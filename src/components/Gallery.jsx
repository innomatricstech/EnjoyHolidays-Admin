import { useState, useEffect, useRef } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
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
} from "firebase/firestore";
import { storage, db } from "../firebase/firebase";
import {
  Upload,
  Trash2,
  Download,
  Info,
} from "lucide-react";

const Gallery = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imageCount, setImageCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* ================= FETCH ALL IMAGES ================= */
  const fetchImages = async () => {
    try {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setImages(data);
      setImageCount(snapshot.size);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  /* ================= FILE SELECT ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setUploadProgress(0);
  };

  const clearSelection = () => {
    setImage(null);
    setPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ================= UPLOAD IMAGE ================= */
  const uploadImage = async () => {
    if (!image) return;
    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storagePath = `gallery/${Date.now()}-${image.name}`;
      const imageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(imageRef, image);
      
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
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, "gallery"), {
            imageUrl: downloadURL,
            storagePath,
            createdAt: serverTimestamp(),
            title: image.name, // You can modify this to add custom titles
          });

          clearSelection();
          fetchImages();
          setLoading(false);
          setIsUploading(false);
        }
      );

    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
      setLoading(false);
      setIsUploading(false);
    }
  };

  /* ================= DELETE IMAGE ================= */
  const deleteImage = async (img) => {
    const confirmDelete = window.confirm(
      "Delete this image permanently?"
    );
    if (!confirmDelete) return;

    try {
      if (img.storagePath) {
        const imageRef = ref(storage, img.storagePath);
        await deleteObject(imageRef);
      } else if (img.imageUrl) {
        const decodedUrl = decodeURIComponent(img.imageUrl);
        const path = decodedUrl.split("/o/")[1].split("?")[0];
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      }

      await deleteDoc(doc(db, "gallery", img.id));
      fetchImages();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed – check Firebase rules");
    }
  };

  /* ================= DOWNLOAD IMAGE ================= */
  const downloadImage = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name || "gallery-image";
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-3xl font-black text-center mb-6">
        Gallery <span className="text-blue-600">Management</span>
      </h1>

      {/* ================= UPLOAD ================= */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow mb-10">
        {!preview ? (
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed p-10 rounded-xl text-center cursor-pointer hover:border-blue-500"
          >
            <Upload className="mx-auto w-10 h-10 text-blue-600 mb-3" />
            <p className="font-bold">Click to upload image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <img
              src={preview}
              alt="preview"
              className="rounded-xl w-full h-64 object-cover"
            />
            <button
              onClick={clearSelection}
              className="text-red-500 font-bold"
            >
              Remove
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-6 space-y-2">
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

        <button
          onClick={uploadImage}
          disabled={!image || loading}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold disabled:bg-slate-300"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* ================= COUNT ================= */}
      <div className="text-center mb-8">
        <div className="inline-block bg-white px-6 py-4 rounded-xl shadow">
          <p className="text-4xl font-black text-blue-600">
            {imageCount}
          </p>
          <p className="text-sm text-slate-500">Total Images</p>
        </div>
      </div>

      {/* ================= IMAGES GRID ================= */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-white rounded-xl shadow overflow-hidden"
          >
            <img
              src={img.imageUrl}
              alt="gallery"
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <div className="flex gap-2">
                
                <button
                  onClick={() => deleteImage(img)}
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

      {/* ================= INFO ================= */}
      <div className="max-w-3xl mx-auto mt-12 bg-blue-50 p-6 rounded-2xl">
        <Info className="inline mr-2 text-blue-600" />
        Supported formats: JPG, PNG, GIF, WebP. Max file size: 5MB.
      </div>
    </div>
  );
};

export default Gallery;