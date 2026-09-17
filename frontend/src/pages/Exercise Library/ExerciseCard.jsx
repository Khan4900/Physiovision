import React from "react";
import { Clock } from "lucide-react";
import CustomButton from "../../components/CustomButton";

const ExerciseCard = ({
  title,
  type,
  duration,
  difficulty,
  imageUrl,
  onStart,
  buttonText = "Start Exercise",
}) => {
  const getDifficultyColor = (level) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-[#f0f7ea] text-[#4DC53C]";
      case "intermediate":
        return "bg-[#eaf6fd] text-[#2D90E0]";
      case "advanced":
        return "bg-[#fff0f6] text-[#FF118C]";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden group border border-[#e6e9eb] shadow-md">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#2D90E0] text-white text-sm">
          {type}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#030E16] mb-3">{title}</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#5f6569]">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{duration} min</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
              difficulty
            )}`}
          >
            {difficulty}
          </span>
        </div>
        <CustomButton
          text={buttonText}
          onClick={onStart}
          variant="primary"
          fullWidth={true}
        />
      </div>
    </div>
  );
};

export default ExerciseCard;
