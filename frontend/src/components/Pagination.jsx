import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const buttonClasses = [
    "w-9",
    "h-9",
    "flex",
    "items-center",
    "justify-center",
    "rounded-lg",
    "border",
    "border-[#e6e9eb]",
    "text-[#5f6569]",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
    "hover:bg-[#f6f9fc]",
    "transition-colors"
  ].join(" ");

  return (
    <div className="flex items-center justify-center gap-2">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={buttonClasses}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg font-medium transition-colors
            ${currentPage === page 
              ? "bg-[#2D90E0] text-white"
              : "border border-[#e6e9eb] text-[#5f6569] hover:bg-[#f6f9fc]"
            }`}
        >
          {page}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={buttonClasses}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
