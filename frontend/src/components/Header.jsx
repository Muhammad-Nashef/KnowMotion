import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSun, FaMoon, FaSignOutAlt, FaTools  } from "react-icons/fa";
import logo from "/quizdriveIcon.png";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

export default function Header({ isDark, setIsDark,user,setUser }) {
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  //const [user, setUser] = useState(null); // store logged-in user info
  const loginRef = useRef(null);
  const navigate = useNavigate();

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setShowLogin(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("token"); // remove JWT
  localStorage.removeItem("role"); // ✅ VERY IMPORTANT
  setUser(null); // reset user state
  Swal.fire({
    icon: "success",
    title: "התנתקת בהצלחה!",
    showConfirmButton: false,
    timer: 2000,
    toast: true,
    position: "top-end"
  });
  navigate("/"); // optional: redirect to home page
};
  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "בוקר טוב";          // Morning
    else if (hour >= 12 && hour < 15) return "צהריים טובים"; // Noon
    else if (hour >= 15 && hour < 18) return "אחר צהריים טובים"; // Afternoon
    else return "ערב טוב";                                 // Evening/Night
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) throw new Error("שם משתמש או סיסמה שגויים");

      const data = await res.json();

      localStorage.setItem("token", data.token);
      

      const payload = jwtDecode(data.token);

      setUser({ username: payload.username, role: payload.role });
      localStorage.setItem("role", payload.role);
      Swal.fire({
      icon: "success",
      title: "התחברת בהצלחה!",
      showConfirmButton: false,
      timer: 2000,
      toast: true,
      position: "top-end",
    });
      setShowLogin(false);

      if (payload.role === "admin") navigate("/admin-dashboard");
      else navigate("/");
    } catch (err) {
      Swal.fire({
      icon: "error",
      title: "שגיאה",
      text: err.message,
      confirmButtonColor: "#d33",
    });
      setLoginData({ username: "", password: "" }); // clear fields on error
    }
  };
  

  return (
    //<div className="flex justify-between items-center w-full py-4 px-6">
      <div className={`
  flex justify-between items-center w-full py-4 px-6
  sticky top-0 z-50
  backdrop-blur-md
  ${isDark ? "bg-gray-700/10" : "bg-gray-300/10"}
  border-b ${isDark ? "border-gray-700" : "border-gray-400"}
  shadow-sm
`}>
      {/* Logo 
      <img
        src={logo}
        alt="הנעת ידע"
        className="h-16 cursor-pointer hover:opacity-80 transition"
        onClick={() => navigate("/")}
      />*/}

      <div
  onClick={() => navigate("/")}
  className="relative flex flex-col items-center cursor-pointer group"
>
  {/* Glow */}
  <div
    className="
      absolute inset-0 rounded-full
      blur-xl opacity-0
      group-hover:opacity-100
      transition duration-500
      bg-[#388bd4]
    "
  />

  {/* Logo */}
  <motion.img
    src={logo}
    alt="הנעת ידע"
    className="h-14 relative z-10 select-none"
    whileHover={{ rotate: -2, scale: 1.05 }}
    transition={{ type: "spring", stiffness: 200 }}
    draggable={false}
  />

  {/* Text under logo */}
  <span
  className={`
    mt-2 font-bold
    bg-clip-text text-transparent
    select-none pointer-events-none
    group-hover:opacity-90 transition
    ${isDark
      ? "bg-gradient-to-r from-[#9aa5ff] via-[#cbb8ff] to-[#e8a6ff]"
      : "bg-gradient-to-r from-[#3b3b3b] via-[#5a5a5a] to-[#7a7a7a]"
    }
  `}
>
  הנעת ידע
</span>
</div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Dark / Light */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg border border-gray-500 hover:bg-gray-700 transition"
        >
          {isDark ? <FaMoon /> : <FaSun />}
        </button>






        {/* Login */}
        <div className="relative" ref={loginRef}>
          {user ? (
            <div className="flex items-center space-x-2">
            

            {user?.role === "admin" && (
  <button
    onClick={() => navigate("/admin-dashboard")}
    className="p-1 rounded hover:bg-blue-600 hover:text-white transition"
    title="ללוח מנהל"
  >
    <FaTools size={18} />
  </button>
)}
           
      <span className={`text-sm ${isDark ? "text-white" : "text-gray-800"}`}>
              {getGreeting()}, {user.role === "admin" ? "מנהל" : user.username}
            </span>
             {/* Logout icon */}
      <button
        onClick={handleLogout}
        className={`p-1 rounded hover:bg-red-600 hover:text-white transition`}
        title="התנתק"
      >
        <FaSignOutAlt size={16} />
      </button>
    </div>
          ) : (
      // Show login button when not logged in
      <button
        onClick={() => setShowLogin(!showLogin)}
        className="p-2 rounded-lg border border-gray-500 hover:bg-gray-700 transition"
      >
        <FaUserCircle size={20} />
      </button>
    )}

          <AnimatePresence>
            {showLogin && !user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                      absolute right-0 mt-2 w-60 rounded-lg shadow-lg z-50 p-4
                      ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}
                    `}
              >
                <form
                  onSubmit={handleLoginSubmit}
                  className="flex flex-col space-y-3 text-right"
                >
                  <input
                    type="text"
                    placeholder="שם משתמש"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                    className="px-3 py-2 border rounded text-right"
                  />
                  <input
                    type="password"
                    placeholder="סיסמה"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="px-3 py-2 border rounded text-right"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#3477B2] text-white rounded hover:bg-blue-600 transition"
                  >
                    התחבר
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
