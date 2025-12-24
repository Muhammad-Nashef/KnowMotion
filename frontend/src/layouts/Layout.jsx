import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function Layout() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null); // 🔐 auth state
  
  // 🔁 Restore login on page refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({ role }); // restore minimal user info
    }
  }, []);

  return (
    <div
      className={`${
        isDark ? "bg-[#212121] text-white" : "bg-white text-black"
      } min-h-screen`}
    >
      <Header isDark={isDark} setIsDark={setIsDark}
      user={user}
        setUser={setUser} />

      {/* Pages will render here */}
      <Outlet context={{ isDark, user,setUser }} />
    </div>
  );
}
