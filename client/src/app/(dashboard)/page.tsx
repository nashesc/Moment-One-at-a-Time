import React from "react";
import { MomentumRing } from "@/components/ui/MomentumRing";
import { FocusedTaskCard } from "@/components/tasks/FocusedTaskCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data - in reality, this would be fetched via your TanStack Query setup
  const mockTask = {
    id: "123",
    title: "Draft Q3 Marketing Strategy",
    description: "Focus purely on the main objectives. Do not worry about formatting yet.",
    priority: 1 as const,
    estimated_minutes: 45,
  };

  const completedTasks = 2;
  const totalTasks = 5;

  return (
    <main className="min-h-screen flex flex-col px-6 py-12 max-w-2xl mx-auto pb-32">
      {/* Header Section */}
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="font-playfair text-2xl text-text-dark">Good morning 🌿</h1>
          <p className="text-sm text-text-gray mt-1">May 31, 2026</p>
        </div>
        <Link href="/dashboard?view=list" className="text-sm text-text-gray hover:text-nature-green transition-colors">
          View all moments
        </Link>
      </header>

      {/* Momentum Ring Section */}
      <section className="flex justify-center mb-16">
        <MomentumRing completed={completedTasks} total={totalTasks} />
      </section>

      {/* Centered Task Section */}
      <section className="grow flex flex-col justify-center">
        <FocusedTaskCard task={mockTask} />
      </section>

      {/* Action Buttons */}
      <section className="mt-16 flex flex-col space-y-4 items-center">
        <Button variant="primary" className="w-full max-w-sm text-lg">
          Begin Focus
        </Button>
        <div className="flex space-x-6">
          <Button variant="tertiary" className="text-sm text-text-gray hover:text-amber-600">
            I'm Stuck
          </Button>
          <Button variant="tertiary" className="text-sm text-text-gray">
            Skip for now
          </Button>
        </div>
      </section>
    </main>
  );
}