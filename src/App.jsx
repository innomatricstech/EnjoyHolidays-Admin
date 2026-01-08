import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Banner from "./components/Banner";
import Service from "./components/Service";
import Gallery from "./components/Gallery";
import AdminLogin from "./components/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="banner" element={<Banner />} />
          <Route path="service" element={<Service />} />
          <Route path="gallery" element={<Gallery />} />
        </Route>
        
        {/* Redirect all other routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;