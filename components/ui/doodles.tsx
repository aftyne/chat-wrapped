import React from "react";

export function QuirkyFaceHangout({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* Organic white sticker base with stipple texture */}
      <path
        d="M16 14C22 10 42 10 47 16C52 22 54 42 48 49C42 56 20 55 14 48C8 41 10 18 16 14Z"
        fill="#FFFFFF"
        stroke="#151D21"
        strokeWidth="1.75"
      />
      {/* Stipple dots at bottom */}
      <circle cx="20" cy="45" r="1" fill="#151D21" />
      <circle cx="25" cy="47" r="1" fill="#151D21" />
      <circle cx="30" cy="46" r="1" fill="#151D21" />
      <circle cx="36" cy="48" r="1" fill="#151D21" />
      <circle cx="41" cy="45" r="1" fill="#151D21" />
      <circle cx="23" cy="42" r="1" fill="#151D21" />
      <circle cx="34" cy="43" r="1" fill="#151D21" />
      {/* Quirky brows & eyes */}
      <path d="M19 23C22 20 26 20 29 22" stroke="#151D21" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M35 22C38 20 42 20 45 23" stroke="#151D21" strokeWidth="1.75" strokeLinecap="round" />
      <ellipse cx="24" cy="26" rx="3.2" ry="2.2" fill="#FFFFFF" stroke="#151D21" strokeWidth="1.6" />
      <circle cx="24" cy="26" r="1.2" fill="#151D21" />
      <ellipse cx="40" cy="26" rx="3.2" ry="2.2" fill="#FFFFFF" stroke="#151D21" strokeWidth="1.6" />
      <circle cx="40" cy="26" r="1.2" fill="#151D21" />
      {/* Nose & quirky smile */}
      <path
        d="M31 24C30 29 28 33 32 34C35 35 34 31 33 29"
        stroke="#151D21"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 38C28 40 35 40 38 37"
        stroke="#151D21"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function QuirkyFaceLaugh({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M32 10C46 10 53 21 52 34C51 47 42 54 30 53C18 52 11 43 12 30C13 17 20 10 32 10Z"
        fill="#E5F1F4"
        stroke="#151D21"
        strokeWidth="1.75"
      />
      {/* Hair/cap swoop */}
      <path
        d="M17 20C23 14 36 14 44 19"
        stroke="#151D21"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Winking / laughing eyes */}
      <circle cx="25" cy="26" r="2" fill="#151D21" />
      <path d="M36 25C38 23 42 23 44 26" stroke="#151D21" strokeWidth="1.75" strokeLinecap="round" />
      {/* Expressive wide laugh mouth */}
      <path
        d="M24 35C27 32 38 32 42 36C44 38 41 44 33 44C25 44 22 38 24 35Z"
        fill="#FFFFFF"
        stroke="#151D21"
        strokeWidth="1.6"
      />
      <path d="M26 38H40" stroke="#151D21" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LotusBowlDoodle({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 80" fill="none" className={className} aria-hidden="true">
      {/* Bowl base */}
      <path
        d="M12 40C12 58 26 68 44 68C62 68 76 58 76 40H12Z"
        fill="#F3B897"
        stroke="#151D21"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Bowl rim */}
      <ellipse
        cx="44"
        cy="40"
        rx="32"
        ry="9"
        fill="#88C9D8"
        stroke="#151D21"
        strokeWidth="1.8"
      />
      {/* Lotus outer petals */}
      <path
        d="M28 38C22 28 28 20 36 26C32 16 40 12 44 22C48 12 56 16 52 26C60 20 66 28 60 38"
        fill="#EA96C8"
        stroke="#151D21"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Center lotus bud */}
      <path
        d="M44 14C39 22 39 32 44 39C49 32 49 22 44 14Z"
        fill="#F2D2EC"
        stroke="#151D21"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Base shadow line */}
      <path d="M28 70H60" stroke="#151D21" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CandleDoodle({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      {/* Flame */}
      <path
        d="M36 10C32 18 31 24 36 27C41 24 40 18 36 10Z"
        fill="#EAFA91"
        stroke="#151D21"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      {/* Wick */}
      <path d="M36 27V32" stroke="#151D21" strokeWidth="1.7" strokeLinecap="round" />
      {/* Candle body */}
      <path
        d="M20 40C20 34 27 31 36 31C45 31 52 34 52 40V54C52 60 45 64 36 64C27 64 20 60 20 54V40Z"
        fill="#D79CE3"
        stroke="#151D21"
        strokeWidth="1.75"
      />
      {/* Candle top pool */}
      <ellipse
        cx="36"
        cy="39"
        rx="14"
        ry="5.5"
        fill="#F2D2EC"
        stroke="#151D21"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ZenStonesDoodle({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      {/* Bottom stone */}
      <ellipse
        cx="36"
        cy="56"
        rx="22"
        ry="7.5"
        fill="#707D82"
        stroke="#151D21"
        strokeWidth="1.75"
      />
      {/* Lower-mid stone */}
      <ellipse
        cx="35"
        cy="45"
        rx="17"
        ry="6.5"
        fill="#8A979C"
        stroke="#151D21"
        strokeWidth="1.75"
      />
      {/* Upper-mid stone */}
      <ellipse
        cx="37"
        cy="35"
        rx="12.5"
        ry="5.5"
        fill="#707D82"
        stroke="#151D21"
        strokeWidth="1.75"
      />
      {/* Top pebble */}
      <ellipse
        cx="36"
        cy="26"
        rx="7.5"
        ry="4"
        fill="#9EABB0"
        stroke="#151D21"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function MoodFaceBadge({
  mood = "happy",
  bg = "#F2D2EC",
  className = "w-8 h-8",
}: {
  mood?: "happy" | "sad" | "shock" | "wink";
  bg?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <circle cx="18" cy="18" r="16" fill={bg} />
      <circle cx="13" cy="16" r="1.8" fill="#151D21" />
      <circle cx="23" cy="16" r="1.8" fill="#151D21" />
      {mood === "sad" && (
        <path
          d="M14 23C15.5 21 20.5 21 22 23"
          stroke="#151D21"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
      {mood === "happy" && (
        <path
          d="M13.5 20.5C15.5 23 20.5 23 22.5 20.5"
          stroke="#151D21"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
      {mood === "shock" && (
        <circle cx="18" cy="22" r="2.5" stroke="#151D21" strokeWidth="1.7" />
      )}
      {mood === "wink" && (
        <path
          d="M14 21.5C16.5 23.5 20 23 22.5 20.5"
          stroke="#151D21"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function PlayCircleIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="13.5" stroke="#151D21" strokeWidth="1.75" />
      <path
        d="M13.5 11.5L21 16L13.5 20.5V11.5Z"
        stroke="#151D21"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
