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
} from "firebase/firestore";
import { storage, db } from "../firebase/firebase";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Info,
} from "lucide-react";

const Banner = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [bannerCount, setBannerCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* ================= FETCH ALL BANNERS ================= */
  const fetchBanners = async () => {
    try {
      const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setBanners(data);
      setBannerCount(snapshot.size);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= FILE SELECT ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setUploadProgress(0); // Reset progress when new file selected
  };

  const clearSelection = () => {
    setImage(null);
    setPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ================= UPLOAD BANNER ================= */
  const uploadBanner = async () => {
    if (!image) return;
    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storagePath = `banners/${Date.now()}-${image.name}`;
      const imageRef = ref(storage, storagePath);

      // Create upload task with progress tracking
      const uploadTask = uploadBytesResumable(imageRef, image);
      
      // Listen for state changes, errors, and completion
      uploadTask.on('state_changed',
        (snapshot) => {
          // Get upload progress percentage
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

          await addDoc(collection(db, "banners"), {
            imageUrl: downloadURL,
            storagePath, // 🔥 REQUIRED FOR DELETE
            createdAt: serverTimestamp(),
          });

          clearSelection();
          fetchBanners();
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

  /* ================= DELETE BANNER (FIXED) ================= */
  const deleteBanner = async (banner) => {
    const confirmDelete = window.confirm(
      "Delete this banner permanently?"
    );
    if (!confirmDelete) return;

    try {
      // ✅ NEW banners
      if (banner.storagePath) {
        const imageRef = ref(storage, banner.storagePath);
        await deleteObject(imageRef);
      }
      // ✅ OLD banners (no storagePath)
      else if (banner.imageUrl) {
        const decodedUrl = decodeURIComponent(banner.imageUrl);
        const path = decodedUrl.split("/o/")[1].split("?")[0];
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      }

      // ✅ Delete Firestore document
      await deleteDoc(doc(db, "banners", banner.id));

      fetchBanners();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed – check Firebase rules");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-3xl font-black text-center mb-6">
        Banner <span className="text-blue-600">Management</span>
      </h1>

      {/* ================= UPLOAD ================= */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow mb-10">
        {!preview ? (
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed p-10 rounded-xl text-center cursor-pointer hover:border-blue-500"
          >
            <Upload className="mx-auto w-10 h-10 text-blue-600 mb-3" />
            <p className="font-bold">Click to upload banner</p>
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
              className="rounded-xl w-full aspect-[21/9] object-cover"
            />
            <button
              onClick={clearSelection}
              className="text-red-500 font-bold"
            >
              Remove
            </button>
          </div>
        )}

        {/* Progress Bar - Only shown during upload */}
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
          onClick={uploadBanner}
          disabled={!image || loading}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold disabled:bg-slate-300"
        >
          {loading ? "Uploading..." : "Upload Banner"}
        </button>
      </div>

      {/* ================= COUNT ================= */}
      <div className="text-center mb-8">
        <div className="inline-block bg-white px-6 py-4 rounded-xl shadow">
          <p className="text-4xl font-black text-blue-600">
            {bannerCount}
          </p>
          <p className="text-sm text-slate-500">Total Banners</p>
        </div>
      </div>

      {/* ================= BANNERS LIST ================= */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-xl shadow overflow-hidden"
          >
            <img
              src={banner.imageUrl}
              alt="banner"
              className="w-full h-40 object-cover"
            />

            <div className="p-4">
              <button
                onClick={() => deleteBanner(banner)}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold"
              >
                <Trash2 className="w-4 h-4" />
                Delete Banner
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= INFO ================= */}
      
    </div>
  );
};

export default Banner;