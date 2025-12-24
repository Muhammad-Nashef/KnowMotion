import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SubjectCard from "../components/subjectCard";
import { useOutletContext } from "react-router-dom";

export default function SubCategories() {
  const {isDark} = useOutletContext();
  const { mainCategoryId } = useParams();
  const [subCategories, setSubCategories] = useState([]);
  const [mainCategoryName, setMainCategoryName] = useState("");
  const navigate = useNavigate();

  
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/sub-categories/${mainCategoryId}`)
      .then(res => res.json())
      .then(data => {
        setSubCategories(data.sub_categories);  
        setMainCategoryName(data.main_category.name);
      });
  }, [mainCategoryId]);

  return (
  <div className={`${isDark ? "bg-[#212121] text-white" : "bg-white text-black"} min-h-screen flex flex-col`}>

    {/* Page Content */}
    <div className="px-6 py-16 flex-1">
      <h1 className="text-4xl font-bold text-center text-[#3477B2] mb-12">
        {mainCategoryName}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {subCategories.map(sub => (
          <SubjectCard
            key={sub.id}
            name={sub.name}
            image={sub.image_url}
            onClick={() => navigate(`/questions/${sub.id}`)}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  </div>
);
}