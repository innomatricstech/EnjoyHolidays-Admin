import { useState, useEffect, useRef } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { storage, db } from "../firebase/firebase";
import { Plus, Upload, Trash2, MapPin, X, Edit } from "lucide-react";

const Service = () => {
  const [services, setServices] = useState([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef(null);

  /* ================= FETCH ALL SERVICES ================= */
  const fetchServices = async () => {
    try {
      const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setServices(data);
      setServiceCount(snapshot.size);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  /* ================= IMAGE UPLOAD HANDLING ================= */
  const openFilePicker = () => {
    fileRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setUploadProgress(0);
  };

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ================= FORM HANDLING ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= OPEN MODAL FOR EDIT ================= */
  const openEditModal = (service) => {
    setIsEditing(true);
    setEditingId(service.id);
    setFormData({
      title: service.title,
      location: service.location,
      image: null, // Don't preload existing image file
    });
    setImagePreview(service.imageUrl); // Show existing image as preview
    setIsModalOpen(true);
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      image: null,
    });
    setImagePreview("");
    setUploadProgress(0);
    setIsEditing(false);
    setEditingId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ================= CLOSE MODAL ================= */
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  /* ================= CREATE NEW SERVICE ================= */
  const createService = async () => {
    if (!formData.title || !formData.location || !formData.image) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storagePath = `services/${Date.now()}-${formData.image.name}`;
      const imageRef = ref(storage, storagePath);

      // Create upload task with progress tracking
      const uploadTask = uploadBytesResumable(imageRef, formData.image);
      
      // Listen for state changes, errors, and completion
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Upload failed");
          setLoading(false);
          setIsUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, "services"), {
            title: formData.title,
            location: formData.location,
            imageUrl: downloadURL,
            storagePath, // 🔥 REQUIRED FOR DELETE
            createdAt: serverTimestamp(),
          });

          // Reset form and close modal
          resetForm();
          setLoading(false);
          setIsUploading(false);
          setIsModalOpen(false);
          
          fetchServices();
        }
      );

    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
      setLoading(false);
      setIsUploading(false);
    }
  };

  /* ================= UPDATE SERVICE ================= */
  const updateService = async () => {
    if (!formData.title || !formData.location) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const serviceDoc = doc(db, "services", editingId);
      const updateData = {
        title: formData.title,
        location: formData.location,
      };

      // If new image is selected, upload it first
      if (formData.image) {
        setIsUploading(true);
        setUploadProgress(0);
        
        const storagePath = `services/${Date.now()}-${formData.image.name}`;
        const imageRef = ref(storage, storagePath);

        // Create upload task with progress tracking
        const uploadTask = uploadBytesResumable(imageRef, formData.image);
        
        // Listen for state changes, errors, and completion
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            alert("Image upload failed");
            setLoading(false);
            setIsUploading(false);
          },
          async () => {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Delete old image if exists
            const oldService = services.find(s => s.id === editingId);
            if (oldService && oldService.storagePath) {
              try {
                const oldImageRef = ref(storage, oldService.storagePath);
                await deleteObject(oldImageRef);
              } catch (err) {
                console.error("Failed to delete old image:", err);
              }
            }

            // Update document with new image
            await updateDoc(serviceDoc, {
              ...updateData,
              imageUrl: downloadURL,
              storagePath,
            });

            // Reset form and close modal
            resetForm();
            setLoading(false);
            setIsUploading(false);
            setIsModalOpen(false);
            
            fetchServices();
          }
        );
      } else {
        // No new image, just update text fields
        await updateDoc(serviceDoc, updateData);
        
        // Reset form and close modal
        resetForm();
        setLoading(false);
        setIsModalOpen(false);
        
        fetchServices();
      }

    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed");
      setLoading(false);
      setIsUploading(false);
    }
  };

  /* ================= SAVE SERVICE (CREATE OR UPDATE) ================= */
  const saveService = async () => {
    if (isEditing) {
      await updateService();
    } else {
      await createService();
    }
  };

  /* ================= DELETE SERVICE ================= */
  const deleteService = async (service) => {
    const confirmDelete = window.confirm(
      "Delete this service permanently?"
    );
    if (!confirmDelete) return;

    try {
      // ✅ NEW services
      if (service.storagePath) {
        const imageRef = ref(storage, service.storagePath);
        await deleteObject(imageRef);
      }
      // ✅ OLD services (no storagePath)
      else if (service.imageUrl) {
        const decodedUrl = decodeURIComponent(service.imageUrl);
        const path = decodedUrl.split("/o/")[1].split("?")[0];
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      }

      // ✅ Delete Firestore document
      await deleteDoc(doc(db, "services", service.id));

      fetchServices();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed – check Firebase rules");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-center mb-6">
        Service <span className="text-blue-600">Management</span>
      </h1>
        <div></div>
      </div>

      {/* ================= UPLOAD BUTTON (ALWAYS SHOWN WITH SAME STYLE - NOW FIRST) ================= */}
      <div className="flex flex-col items-center justify-center py-4 mb-8">
        <div 
          onClick={() => setIsModalOpen(true)}
          className="w-full max-w-md border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <Upload size={48} className="text-blue-600 mb-4" />
          <p className="text-lg font-medium mb-2">
            Click to upload service
          </p>
          <p className="text-sm text-gray-500 text-center">
            {services.length === 0 
              ? "Upload your first travel package to get started" 
              : "Upload more travel packages"}
          </p>
        </div>
      </div>

      {/* ================= COUNT SECTION (SHOW WHEN SERVICES EXIST - NOW SECOND) ================= */}
      {services.length > 0 && (
        <div className="text-center mb-10">
          <div className="inline-block bg-white px-6 py-4 rounded-xl shadow">
            <p className="text-4xl font-black text-blue-600">
              {serviceCount}
            </p>
            <p className="text-sm text-slate-500">Total Services</p>
          </div>
        </div>
      )}

      {/* ================= SERVICES LIST (NOW THIRD) ================= */}
      {services.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Your Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600 flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Service
                    </button>
                    <button
                      onClick={() => deleteService(service)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold">
                {isEditing ? "Edit Service" : "Add New Service"}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {isEditing ? "Update your travel package" : "Create a new travel package"}
              </p>

              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* IMAGE UPLOAD */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Package Image {!isEditing && "*"}
                  {isEditing && (
                    <span className="text-xs text-slate-500 ml-2">
                      (Optional - Leave unchanged to keep current image)
                    </span>
                  )}
                </label>

                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={openFilePicker}
                      className="w-full border border-slate-300 py-2 rounded-lg font-medium hover:bg-slate-50"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={openFilePicker}
                    className="w-40 h-40 mx-auto border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Upload Image
                    </p>
                    <p className="text-xs text-slate-400">
                      Click to upload
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Progress Bar - Only shown during upload */}
                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Uploading...</span>
                      <span className="font-bold text-blue-600">{uploadProgress}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Package Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Magnificent Ladakh"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location Details *
                </label>
                <textarea
                  name="location"
                  rows="3"
                  placeholder="e.g., Leh, Nubra Valley, Pangong Lake"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={closeModal}
                  className="flex-1 border border-slate-300 py-3 rounded-xl font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveService}
                  disabled={loading || !formData.title || !formData.location || (!isEditing && !formData.image)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold disabled:bg-slate-300"
                >
                  {loading 
                    ? (isEditing ? "Updating..." : "Creating...") 
                    : (isEditing ? "Update Package" : "Create Package")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;