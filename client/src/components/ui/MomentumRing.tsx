import React from "react";

interface MomentumRingProps {
  completed: number;
  total: number;
}

export function MomentumRing({ completed, total }: MomentumRingProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background Track */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="var(--color-pale-green)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress Ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="var(--color-sage-green)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="font-playfair text-3xl font-bold text-nature-green">
          {percentage}%
        </span>
      </div>
      <span className="text-xs text-text-gray font-inter">
        {completed} of {total} moments completed
      </span>
    </div>
  );
}