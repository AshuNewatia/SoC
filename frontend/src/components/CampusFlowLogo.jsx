import React from "react";

export const CampusFlowLogo = ({ className = "w-11 h-11" }) => {
  return (
    <svg
      className={`${className} shrink-0`}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: "2.75rem", minHeight: "2.75rem" }} // Ensures Flexbox never crushes it
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient
          id="cf-bg-grad"
          x1="0"
          y1="0"
          x2="512"
          y2="512"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0072FF" />
          <stop offset="50%" stopColor="#0052D4" />
          <stop offset="100%" stopColor="#002A8F" />
        </linearGradient>

        {/* Wing Gradient */}
        <linearGradient
          id="cf-wing-grad"
          x1="220"
          y1="180"
          x2="430"
          y2="300"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0052D4" />
        </linearGradient>
      </defs>

      {/* 1. Rounded App Container */}
      <rect width="512" height="512" rx="118" fill="url(#cf-bg-grad)" />

      {/* 2. 'C' Outer Arc */}
      <path
        d="M 330 140 
           C 290 100, 210 100, 160 150 
           C 100 210, 100 310, 160 370 
           C 210 420, 290 420, 330 380"
        stroke="#FFFFFF"
        strokeWidth="52"
        strokeLinecap="round"
        fill="none"
      />

      {/* 3. 'F' Wing Top */}
      <path
        d="M 230 210 
           L 395 210 
           C 415 210, 420 225, 400 238 
           L 360 260 
           C 315 285, 260 270, 230 210 Z"
        fill="#38BDF8"
      />

      {/* 4. 'F' Body & Lower Wing */}
      <path
        d="M 230 200 
           L 230 405 
           C 230 420, 250 425, 260 410 
           L 285 355 
           L 285 305 
           L 355 305 
           C 370 305, 375 290, 360 280 
           L 285 230 
           L 285 200 
           Z"
        fill="url(#cf-wing-grad)"
      />
    </svg>
  );
};

export default CampusFlowLogo;