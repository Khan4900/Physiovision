import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5f6569]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-[#e6e9eb] rounded-lg py-2 pl-10 pr-4 text-[#030E16] placeholder:text-[#5f6569] focus:border-[#2D90E0] focus:outline-none focus:ring-1 focus:ring-[#2D90E0]"
      />
    </div>
  );
};

export default SearchBar;
