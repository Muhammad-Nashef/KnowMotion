import SubjectCard from "../components/subjectCard";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaUserCircle, FaSun, FaMoon } from "react-icons/fa"; // icons
import logo from "/quizdriveIcon.png";
import Header from "../components/Header.jsx";

export default function Home() {
  const {isDark} = useOutletContext();
  const [mainCategories, setMainCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/main-categories")
      .then(res => res.json())
      .then(data => setMainCategories(data));
  }, []);

  return (
    <div className={`${isDark ? "bg-[#212121] text-white" : "bg-white text-black"} min-h-screen flex flex-col`}>

      {/* Page Content */}
      <div className="flex flex-col items-center justify-center px-6 mt-16 flex-1">
        <h1 className="text-4xl font-bold text-center text-[#3477B2] mb-4">
          הנעת ידע - תרגול הנדסת רכב חכם
        </h1>

        <p className="text-center text-[#3477B2] mb-12">
          בחר קטגוריה והתחל לתרגל
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {mainCategories.map(cat => (
            <SubjectCard
              key={cat.id}
              name={cat.name}
              image={cat.image_url}
              onClick={() => navigate(`/sub-categories/${cat.id}`)}
              isDark={isDark}
              className="h-80 w-70"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/*
import SubjectCard from "../components/subjectCard";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [mainCategories, setMainCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/main-categories")
      .then(res => res.json())
      .then(data => setMainCategories(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#212121] px-6 flex items-center justify-center">
      <div className = "w-full">
      <h1 className="text-4xl font-bold text-center text-[#3477B2] mb-4">
        הנעת ידע - תרגול הנדסת רכב חכם
      </h1>
      <p className="text-center text-[#3477B2] mb-12"> בחר קטגוריה והתחל לתרגל </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-20 max-w-2xl mx-auto ">
        {mainCategories.map(cat => (
          <SubjectCard
            key={cat.id}
            name={cat.name}
            image={cat.image_url}
            onClick={() => navigate(`/sub-categories/${cat.id}`)}
            className= "h-80 w-70"
          />
        ))}
        </div>
      </div>
    </div>
  );
}*/