import  { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { 
  FiImage, 
  FiSettings, 
  FiGrid, 
  FiArrowRight,
  FiActivity,
  FiCalendar,
  FiDatabase,
  FiTrendingUp,
  FiBarChart2,
  FiUsers,
  FiHome,
  FiStar,
  FiChevronRight,
  FiPieChart,
  FiEye,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [bannerCount, setBannerCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 Fetch counts from Firestore
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const bannersSnap = await getDocs(collection(db, "banners"));
        const servicesSnap = await getDocs(collection(db, "services"));
        const gallerySnap = await getDocs(collection(db, "gallery"));

        setBannerCount(bannersSnap.size);
        setServiceCount(servicesSnap.size);
        setGalleryCount(gallerySnap.size);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Banners",
      value: loading ? "..." : bannerCount,
      color: "from-purple-500 to-pink-500",
      icon: <FiImage className="w-5 h-5" />,
      link: "/banner",
      trend: "+12.5%",
      change: "positive",
    },
    {
      title: "Services",
      value: loading ? "..." : serviceCount,
      color: "from-blue-500 to-cyan-500",
      icon: <FiSettings className="w-5 h-5" />,
      link: "/service",
      trend: "+8.3%",
      change: "positive",
    },
    {
      title: "Gallery",
      value: loading ? "..." : galleryCount,
      color: "from-amber-500 to-orange-500",
      icon: <FiGrid className="w-5 h-5" />,
      link: "/gallery",
      trend: "+24.7%",
      change: "positive",
    },
    
  ];

  const quickActions = [
    { 
      label: "Add New Banner", 
      link: "/banner/new", 
      color: "purple", 
      icon: <FiImage />,
      description: "Upload high-quality banner images",
      gradient: "from-purple-600 to-pink-600"
    },
    { 
      label: "Manage Services", 
      link: "/service/manage", 
      color: "blue", 
      icon: <FiSettings />,
      description: "Edit service offerings",
      gradient: "from-blue-600 to-cyan-600"
    },
    { 
      label: "Upload Gallery", 
      link: "/gallery/upload", 
      color: "amber", 
      icon: <FiGrid />,
      description: "Add new gallery images",
      gradient: "from-amber-600 to-orange-600"
    },
    { 
      label: "View Analytics", 
      link: "/analytics", 
      color: "emerald", 
      icon: <FiPieChart />,
      description: "Detailed performance metrics",
      gradient: "from-emerald-600 to-green-600"
    }
  ];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    }
  };

  const floatAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const shimmerAnimation = {
    initial: { x: "-100%" },
    animate: {
      x: "200%",
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const rotateAnimation = {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-white relative overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <motion.div 
        variants={rotateAnimation}
        initial="initial"
        animate="animate"
        className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
      />
      <motion.div 
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-l from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl"
      />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      
      <div className="relative z-10 p-4 md:p-8">
        {/* Top Navigation */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-blue-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-white via-white to-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl overflow-hidden">
            {/* Shimmer Effect */}
            <motion.div
              variants={shimmerAnimation}
              initial="initial"
              animate="animate"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                    className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl"
                  >
                    <FiStar className="w-6 h-6 text-purple-600" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, Admin! </h2>
                    <p className="text-gray-600">Here's what's happening with your platform today.</p>
                  </div>
                </div>

              </div>
              
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={index}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <Link to={stat.link}>
                <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-10 shadow-lg`}>
                        <div className={`text-white p-2 rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                          {stat.icon}
                        </div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                          stat.change === 'positive' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <FiTrendingUp className="w-3 h-3" />
                        <span className="text-sm font-semibold">{stat.trend}</span>
                      </motion.div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">{stat.title}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <FiChevronRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Animated Progress Bar */}
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (parseInt(stat.value) || 0) * 15)}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 1.2, ease: "easeOut" }}
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${stat.color} rounded-full`}
                      >
                        <motion.div
                          variants={shimmerAnimation}
                          initial="initial"
                          animate="animate"
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>


        {/* Content Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/10 to-blue-600/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
            {/* Floating Particles */}
            <motion.div 
              variants={floatAnimation}
              initial="initial"
              animate="animate"
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"
            />
            <motion.div 
              variants={floatAnimation}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
              className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"
            />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Content Performance</h2>
                  <p className="text-gray-300">Real-time insights and analytics</p>
                </div>
                
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    title: "Banners", 
                    count: bannerCount, 
                    change: "+12%", 
                    color: "purple",
                    icon: <FiImage />
                  },
                  { 
                    title: "Services", 
                    count: serviceCount, 
                    change: "+8%", 
                    color: "blue",
                    icon: <FiSettings />
                  },
                  { 
                    title: "Gallery", 
                    count: galleryCount, 
                    change: "+24%", 
                    color: "amber",
                    icon: <FiGrid />
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.6 }}
                    whileHover={{ scale: 1.03 }}
                    className="group bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-2xl bg-${item.color}-500/20`}>
                        <div className={`text-${item.color}-400`}>
                          {item.icon}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold">{item.count}</p>
                        <p className="text-gray-400 text-sm">Total Items</p>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Performance metrics and analytics for your {item.title.toLowerCase()} content.
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-${item.color}-400 font-medium`}>{item.change} growth</span>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className={`text-${item.color}-400 group-hover:text-${item.color}-300 transition-colors cursor-pointer`}
                      >
                        <FiArrowRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Add to your global styles or CSS file */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;