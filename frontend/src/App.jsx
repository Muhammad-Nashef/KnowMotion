import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Questions from "./pages/Questions";
import SubCategories from "./pages/subCategories";
import Layout from "../src/layouts/Layout.jsx";
import AdminDashboard from "./pages/adminDashboard.jsx";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/sub-categories/:mainCategoryId" element={<SubCategories />} />
      <Route path="/questions/:subCategoryId" element={<Questions />} />
      <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>}/>
      </Route>
      </Routes>
      
  );
}

export default App;
