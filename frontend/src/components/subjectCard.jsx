import { motion } from "framer-motion";

const SubjectCard = ({ name, image, onClick,isDark, className="" }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`${isDark ? "bg-[#404040] border-zinc-800" : "bg-gray-300 border-gray-500"} backdrop-blur

  rounded-2xl p-8
  flex flex-col items-center justify-center
  cursor-pointer
  transition-all duration-10
  hover:border-accent-primary 
  ${className}`}
      whileHover={{
  scale: 1.04,
  boxShadow: "0 0 50px #388bd4ff",
}}
whileTap={{ scale: 0.98 }}
transition={{ type: "spring", stiffness: 260 }}
    >
      <img
  src={image}
  alt={name}
  className="w-16 h-16 mb-5 object-contain opacity-90"
/>
      <h2
  className={`text-lg font-semibold text-center bg-clip-text text-transparent
    bg-gradient-to-r
    ${
      isDark
        ? "from-[#9aa5ff] via-[#cbb8ff] to-[#e8a6ff]"
        : "from-[#4a57c6] via-[#6a4fc4] to-[#8a3fa8]"
    }
  `}
>
  {name}
</h2>
    </motion.div>
  );
};

export default SubjectCard;
