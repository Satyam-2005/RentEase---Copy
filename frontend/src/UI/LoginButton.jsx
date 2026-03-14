import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Loginbtn = (props) => {
  return (
    <Link to="/register">
      <button className="relative overflow-hidden px-6 py-2.5 rounded-xl border-2 border-[#560bad] text-[#560bad] font-medium transition-all duration-500 group">

        <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition">
          {props.name} <ArrowRight size={18} />
        </span>

        {/* Hover Background */}
        <span className="absolute w-[220px] h-[220px] bg-[#560bad] rounded-full top-full left-full transition-all duration-700 group-hover:top-[-40px] group-hover:left-[-40px]" />
      </button>
    </Link>
  );
};

export default Loginbtn;