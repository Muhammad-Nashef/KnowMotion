import { Routes, Route } from "react-router-dom";
// Pages
import Home from "./pages/Home";
import Questions from "./pages/Questions";
import SubCategories from "./pages/subCategories";
import AdminDashboard from "./pages/adminDashboard.jsx";
// Layout
import Layout from "../src/layouts/Layout.jsx";
// Route Protection
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Routes>
      {/* Public Layout*/}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sub-categories/:mainCategoryId" element={<SubCategories />} />
        <Route path="/questions/:subCategoryId" element={<Questions />} />
        {/* Protected Admin Dashboard */}
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>}/>
        </Route>
    </Routes>
      
  );
}

export default App;
