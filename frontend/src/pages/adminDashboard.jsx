import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus } from "react-icons/fa";
import { useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaBolt, FaCogs } from "react-icons/fa";

export default function AdminDashboard() {
    
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editedRows, setEditedRows] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubImage, setNewSubImage] = useState("");
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
  const firstInputRef = useRef(null);
  const [subError, setSubError] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [newSubImagePublicId, setNewSubImagePublicId] = useState("");
  const def_icon =
  "https://res.cloudinary.com/davjzk9oi/image/upload/v1766512083/default_icon_nlybfx.png";

  useEffect(() => {
  fetch("http://localhost:5000/main-categories")
    .then(res => res.json())
    .then(data => {
      setMainCategories(data);
      if (data.length > 0) setSelectedMainCategory(data[0].id); // default selection
    });
}, []);



  /* ===================== TIME GREETING ===================== */
  useEffect(() => {
    const hour = new Date().getHours();
    let greet = "";
    if (hour >= 5 && hour < 12) greet = "בוקר טוב,";          // Morning
    else if (hour >= 12 && hour < 15) greet = "צהריים טובים,"; // Noon
    else if (hour >= 15 && hour < 18) greet = "אחר צהריים טובים,"; // Afternoon
    else greet = "ערב טוב,";                                 // Evening/Night
    setGreeting(greet);
  }, []);

  const openDeleteSubModal = (sub) => {
  setSubToDelete(sub);
};
  /* ===================== LOAD SUB CATEGORIES ===================== */
  useEffect(() => {
    fetch("http://localhost:5000/all-subcategories")
      .then(res => res.json())
      .then(setSubCategories);
  }, []);

  /* ===================== LOAD QUESTIONS ===================== */
  const handleSubClick = (sub) => {
  // אם לוחצים על אותה תת־קטגוריה → סגור
  if (selectedSub?.id === sub.id) {
    setSelectedSub(null);
    setQuestions([]);
    setEditedRows([]);
    return;
  }

  // אחרת → פתח כרגיל
  setSelectedSub(sub);
  fetch(`http://localhost:5000/subcategories/${sub.id}/questions`)
    .then(res => res.json())
    .then(data => {
      setQuestions(data);
      setEditedRows([]);
    });
};

// update subtotal when questions are added or removed
  const updateSubTotal = (subId, diff) => {
  setSubCategories(prev =>
    prev.map(sub =>
      sub.id === subId
        ? { ...sub, total: sub.total + diff }
        : sub
    )
  );
};
// focus first input when modal opens
useEffect(() => {
  if (showAddSubModal) {
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }
}, [showAddSubModal]);

// close modal on ESC key
useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setShowAddSubModal(false);
    }
  };

  if (showAddSubModal) {
    window.addEventListener("keydown", handleEsc);
  }

  return () => window.removeEventListener("keydown", handleEsc);
}, [showAddSubModal]);


useEffect(() => {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }
}, []);

const confirmDeleteSubCategory = async (subId) => {
  await fetch(`http://localhost:5000/subcategories/${subId}`, {
    method: "DELETE"
  });

  setSubCategories(prev => prev.filter(s => s.id !== subId));

  if (selectedSub?.id === subId) {
    setSelectedSub(null);
    setQuestions([]);
  }

  setSubToDelete(null);
};

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Only allow images
  if (!file.type.startsWith("image/")) {
    Swal.fire({
  icon: "error",
  title: "שגיאה",
  text: "מותר להעלות רק קבצי תמונה",
  confirmButtonColor: "#d33",
});
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "knowmotion_unsigned"); // your unsigned preset
  formData.append("folder", "knowmotion/sub_categories_images"); // specify folder
  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/davjzk9oi/image/upload",
      formData
    );
    setNewSubImage(res.data.secure_url); // save URL in state
    setNewSubImagePublicId(res.data.public_id); // save public ID in state
  } catch (err) {
    console.error(err);
    Swal.fire({
  icon: "error",
  title: "שגיאה",
  text: "העלאת התמונה נכשלה",
  confirmButtonColor: "#d33",
});
  }
};


  /* ===================== QUESTION UPDATE ===================== */
  const updateQuestion = (qIndex, field, value) => {
    const copy = [...questions];
    copy[qIndex][field] = value;
    setQuestions(copy);
    if (!editedRows.includes(qIndex)) setEditedRows([...editedRows, qIndex]);
  };

  /* ===================== ANSWER UPDATE ===================== */
  const updateAnswer = (qIndex, aIndex, field, value) => {
    const copy = [...questions];

    if (field === "is_correct" && value === true) {
      copy[qIndex].answers.forEach(a => (a.is_correct = false));
    }

    copy[qIndex].answers[aIndex][field] = value;
    setQuestions(copy);
    if (!editedRows.includes(qIndex)) setEditedRows([...editedRows, qIndex]);
  };

  /* ===================== ADD QUESTION ===================== */
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: null,
        sub_category_id: selectedSub.id,
        question_text: "",
        img_url: "",
        answers: [
          { id: null, answer_text: "", is_correct: false },
          { id: null, answer_text: "", is_correct: false },
          { id: null, answer_text: "", is_correct: false },
          { id: null, answer_text: "", is_correct: false }
        ]
      }
    ]);
    updateSubTotal(selectedSub.id, +1);
  };

  /* ===================== DELETE QUESTION ===================== */
  const deleteQuestion = (index) => {
    const q = questions[index];

  // if question already exists in DB → mark for deletion
  if (q.id) {
    setDeletedQuestionIds(prev => [...prev, q.id]);
  }

  setQuestions(questions.filter((_, i) => i !== index));
  setEditedRows(editedRows.filter(i => i !== index));

    updateSubTotal(selectedSub.id, -1);
  };

  /* ===================== ADD ANSWER ===================== */
  const addAnswer = (qIndex) => {
    const copy = [...questions];

    if (copy[qIndex].answers.length >= 4) {
        Swal.fire({
  icon: "error",
  title: "שגיאה",
  text: "ניתן להוסיף עד 4 תשובות בלבד",
  confirmButtonColor: "#d33",
});
        return;
    }

    copy[qIndex].answers.push({
      id: null,
      answer_text: "",
      is_correct: false
    });
    setQuestions(copy);
  };

  /* ===================== DELETE ANSWER ===================== */
  const deleteAnswer = (qIndex, aIndex) => {
    const copy = [...questions];

    if (copy[qIndex].answers.length <= 4) {
        Swal.fire({
  icon: "error",
  title: "שגיאה",
  text: "חייבות להיות בדיוק 4 תשובות לכל שאלה",
  confirmButtonColor: "#d33",
});
        return;
    }

    copy[qIndex].answers.splice(aIndex, 1);
    setQuestions(copy);
  };

  /* ===================== APPLY ===================== */
  const handleApplyChanges = () => {
    fetch("http://localhost:5000/questions/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({questions,
        deletedQuestionIds
    })
    })
      .then(res => res.json())
      .then(() => {
        Swal.fire({
  icon: "success",
  title: "השינויים נשמרו",
  showConfirmButton: false,
  timer: 2000,
  toast: true,
  position: "top-end",
});
        setEditedRows([]);
        setDeletedQuestionIds([]);

        // reload subcategories to be 100% accurate
  fetch("http://localhost:5000/all-subcategories")
    .then(res => res.json())
    .then(setSubCategories);
      });
  };
    /* ===================== ADD SUBCATEGORY ===================== */
    const handleAddSubCategory = () => {
  if (!newSubName.trim()) {
    setSubError(true);
    return;
  }
  setSubError(false);
    const imageUrlToSend = newSubImage || def_icon;

  fetch("http://localhost:5000/subcategories/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: newSubName,
      image_url: imageUrlToSend,
      image_public_id: newSubImagePublicId || "",
      main_category_id: selectedMainCategory
    })
  })
    .then(res => res.json())
    .then(() => { 
      fetch("http://localhost:5000/all-subcategories")
      .then(res => res.json())
      .then(data => setSubCategories(data));
    setShowAddSubModal(false);
      setNewSubName("");
      setNewSubImage("");
    });
    
};



const handleQuestionImageUpload = async (e, qIndex) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    Swal.fire({
  icon: "error",
  title: "שגיאה",
  text: "מותר להעלות רק קבצי תמונה",
  confirmButtonColor: "#d33",
});
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "knowmotion_unsigned"); // your unsigned preset
  formData.append("folder", "knowmotion/questions_images");

  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/davjzk9oi/image/upload",
      formData
    );

    // save image URL to the question
    updateQuestion(qIndex, "img_url", res.data.secure_url);
  } catch (err) {
    console.error(err);
    Swal.fire({
  icon: "error",
  title: "שגיאה",
  text: "העלאת התמונה נכשלה",
  confirmButtonColor: "#d33",
});
  }
};

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl text-[#3477B2] font-bold mb-6">{greeting}</h1>

      {/* SUB CATEGORIES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {subCategories.map(sub => (
          <motion.div
  key={sub.id}
  whileHover={{ scale: 1.05 }}
  className="relative group flex flex-col items-center justify-center
  w-36 h-36 rounded-full bg-blue-500 text-white cursor-pointer
  transition-all duration-300
  hover:-translate-y-1
  "
  /*relative group flex flex-col items-center justify-center
  w-36 h-36 rounded-full cursor-pointer text-white

  bg-[#212121]

  transition-all duration-300 ease-out

  shadow-[0_0_12px_#3477B2]
  hover:shadow-[0_0_28px_#3477B2]
  hover:-translate-y-1

  active:translate-y-0
  active:shadow-[0_0_18px_#3477B2]*/
  onClick={() => handleSubClick(sub)}
>

  {/* CATEGORY BADGE */}
  <span
    className={`absolute top-2 left-2 z-20 flex items-center gap-2
    px-3 py-1.5 text-sm font-semibold rounded-full shadow-md text-white
    transition-transform duration-200 hover:scale-110 ${
      sub.main_category_id === 1 ? "bg-blue-500" : "bg-yellow-500"
    }`}
  >
    {sub.main_category_id === 1 ? <FaCogs size={14} /> : <FaBolt size={14} />}
  </span>
  
    {/* DELETE SUB-CATEGORY BUTTON */}
    <div className="absolute top-2 right-2 z-20 opacity-0 scale-90
  group-hover:opacity-100 group-hover:scale-100
  transition-all duration-200">
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent opening sub-category
          openDeleteSubModal(sub);
        }}
        className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
      >
        <FaTrash size={12} />
      </button>
    </div>

  {/* Spinning border like Spinner 1 */}
  <span className="absolute inset-0 rounded-full border-4 border-blue-300 border-t-blue-500 animate-spin"></span>

  {/* Circle content (on top of spinner) */}
  <div className="z-10 flex flex-col items-center justify-center select-none">
    <span className="font-bold">{sub.name}</span>
    <span className="text-sm">{sub.total} שאלות</span>
  </div>
</motion.div>
        ))}
        <motion.div
  whileHover={{ scale: 1.05 }}
  className="relative flex flex-col items-center justify-center w-36 h-36 rounded-full bg-green-500 text-white cursor-pointer shadow-lg"
  onClick={() => setShowAddSubModal(true)}
>
  <span className="text-4xl z-10">+</span>
  <div className="z-10 text-center mt-2 font-bold">תת-קטגוריה</div>
</motion.div>
      </div>

      {/* QUESTIONS */}
      <AnimatePresence>
        {selectedSub && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-semibold mb-4">
              {selectedSub.name}
            </h2>
            {questions.length === 0 ? (
        <div className="text-center text-zinc-400 py-10 text-lg">
          אין שאלות בתת־קטגוריה זו
        </div>
      ) : (
            questions.map((q, qIndex) => (
              <motion.div
  key={q.id ?? qIndex}
  animate={{
    backgroundColor: editedRows.includes(qIndex) ? "#1a3756ff" : undefined
  }}
  transition={{ duration: 0.3 }}
  className="border rounded p-4 mb-4"
>
                <div className="flex flex-row-reverse items-center gap-2 mb-2">
                  <input
                    value={q.question_text}
                    onChange={e => updateQuestion(qIndex, "question_text", e.target.value)}
                    placeholder="טקטסט השאלה"
                    className="w-full border px-2 py-1 rounded"
                  />
                  <button onClick={() => deleteQuestion(qIndex)} className="text-red-500">
                    <FaTrash />
                  </button>
                </div>

            <div className="mt-2 flex items-center gap-3">
  {/* Upload image */}
  <label
    className={`
      px-3 py-1.5 rounded-lg text-sm transition
      ${q.img_url
        ? "bg-gray-400 cursor-not-allowed opacity-60"
        : "bg-[#3477B2] text-white hover:bg-[#2d6598] cursor-pointer"}
    `}
  >
    העלאת תמונה
    <input
      type="file"
      accept="image/*"
      hidden
      disabled={!!q.img_url}
      onChange={(e) => handleQuestionImageUpload(e, qIndex)}
    />
  </label>

  {/* Remove image */}
  <button
    disabled={!q.img_url}
    onClick={() => updateQuestion(qIndex, "img_url", "")}
    className={`
      text-sm transition
      ${q.img_url
        ? "text-red-500 hover:underline"
        : "text-gray-400 cursor-not-allowed"}
    `}
  >
    הסרת תמונה
  </button>
</div>
                {q.img_url && (
                    <div className="flex justify-center mt-4">
                        <img
                            src={q.img_url}
                            alt="question"
                            className="max-w-xs rounded-xl border shadow-md hover:scale-105 transition"
                                            />
                    </div>
                )}

                {/* ANSWERS */}
                {q.answers.map((a, aIndex) => (
                  <div key={aIndex} className="flex flex-row-reverse gap-2 items-center mb-2">
                    <input
                      value={a.answer_text}
                      onChange={e =>
                        updateAnswer(qIndex, aIndex, "answer_text", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                      placeholder="Answer"
                    />
                    <input
                      type="radio"
                      name={`correct-answer-${qIndex}`}
                      checked={a.is_correct}
                      onChange={e =>
                        updateAnswer(qIndex, aIndex, "is_correct", true)
                      }
                    />
                    <button onClick={() => deleteAnswer(qIndex, aIndex)} className="text-red-500">
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {q.answers.length < 4 && (
                    <button
                  onClick={() => addAnswer(qIndex)}
                  className="text-blue-600 text-sm"
                >
                  + הוספת תשובה
                </button>
                )}
              </motion.div>
            ))
          )}
            <div className="flex gap-4 mt-6">
                <button onClick={addQuestion}   className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2 transition">
              <FaPlus /> <span>הוספת שאלה</span>
            </button>
          {questions.length> 0 && (
            <button onClick={handleApplyChanges} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition">
              עדכון
            </button>
          )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAddSubModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20"
        onClick={() => setShowAddSubModal(false)}>
    <motion.div
    onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="
        w-[420px] rounded-2xl p-6 shadow-2xl
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
      "
    >
      <h2 className="text-lg font-bold mb-4 text-[#3477B2]">הוספת תת-קטגוריה חדשה</h2>
      
      <input
        ref={firstInputRef}
        type="text"
        placeholder="שם תת-קטגוריה"
        className={`
    w-full mb-3 px-3 py-2 rounded-lg
    border
    ${subError ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
    bg-white dark:bg-gray-700
    text-gray-800 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-[#3477B2]
  `}
        value={newSubName}
        onChange={e => setNewSubName(e.target.value)}
        animate={subError ? { x: [-6, 6, -4, 4, 0] } : {}}
  transition={{ duration: 0.3 }}
  
      />

      <div className="mb-4">
  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">
    <span>Upload Image</span>
    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
  </label>
  <div className="mt-2 flex justify-center">
  <img
      src={newSubImage || def_icon} // use default if newSubImage is empty
      alt="Uploaded"
      className="max-h-40 rounded-lg border shadow-sm"
    />
</div>
</div>
<select
  value={selectedMainCategory}
  onChange={e => setSelectedMainCategory(Number(e.target.value))}
  className="w-full mb-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3477B2]"
>
  {mainCategories.map(mc => (
    <option key={mc.id} value={mc.id}>
      {mc.name}
    </option>
  ))}
</select>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg
      bg-gray-200 dark:bg-gray-600
      text-gray-800 dark:text-white
      hover:opacity-90 transition"
          onClick={() => setShowAddSubModal(false)}
        >
          ביטול
        </button>
        <button
          className="px-4 py-2 rounded-lg
      bg-[#3477B2] text-white
      hover:bg-[#2d6598] transition"
          onClick={handleAddSubCategory}
        >
          הוספה
        </button>
      </div>
    </motion.div>
  </div>
)}

{subToDelete && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    onClick={() => setSubToDelete(null)}
  >
    <motion.div
      onClick={e => e.stopPropagation()}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{scale: 0.95, opacity: 0 }}
      className="w-[420px] rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-xl"
    >
      <h2 className="text-xl font-bold text-red-600 mb-3">
        מחיקת תת־קטגוריה:{" "}
        <span className="text-gray-900 dark:text-white">
        { subToDelete.name}
        </span>
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        פעולה זו תמחק את <b>{subToDelete.total}</b> השאלות לצמיתות.
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600"
          onClick={() => setSubToDelete(null)}
        >
          ביטול
        </button>

        <button
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          onClick={() => confirmDeleteSubCategory(subToDelete.id)}
        >
          מחק לצמיתות
        </button>
      </div>
    </motion.div>
  </div>
)}
    </div>
  );
}