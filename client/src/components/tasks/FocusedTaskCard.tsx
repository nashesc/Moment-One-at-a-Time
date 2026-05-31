import React from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3;
  estimated_minutes: number;
}

export function FocusedTaskCard({ task }: { task: Task }) {
  const priorityColors = {
    1: "bg-nature-green",
    2: "bg-amber-500",
    3: "bg-sky-blue",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center w-full max-w-md mx-auto border border-pale-green/50">
      <div className="flex justify-between w-full mb-6">
        <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} aria-label={`Priority ${task.priority}`} />
        <span className="text-xs text-text-gray">{task.estimated_minutes} min</span>
      </div>
      
      <h2 className="font-playfair text-3xl text-text-dark mb-4 leading-tight">
        {task.title}
      </h2>
      
      {task.description && (
        <p className="text-text-gray text-base leading-relaxed mb-6">
          {task.description}
        </p>
      )}
    </div>
  );
}