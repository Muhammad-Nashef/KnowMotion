import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { jwtDecode } from "jwt-decode";

export default function Layout() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);
  
  //Restore login on page refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const payload = jwtDecode(token);
      setUser({
        id: payload.id,
        username: payload.username,
        role: payload.role,
      });
    } catch (err) {
      console.error("Invalid token, clearing session");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setUser(null);
    }
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? "theme-dark" : "theme-light"}`}>
      <Header isDark={isDark} setIsDark={setIsDark} user={user} setUser={setUser} />
      {/* Routed pages */}
      <Outlet context={{ isDark, user,setUser }} />
    </div>
  );
}
