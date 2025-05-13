import WelcomeCard from "@/components/welcomeCard";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <>
      <WelcomeCard type={"calendar"} />
      <div className="min-h-screen bg-background text-white p-8">
        {" "}
        {/*bg-gradient-to-b from-[#0B1C56] to-[#091437]*/}
        <h1 className="text-3xl font-bold mb-6">📅 My Calendar</h1>
        {/* Calendar controls */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search events..."
            className="bg-[#0F234C] text-white px-4 py-2 rounded-md w-1/3"
          />

          <div className="flex gap-2 items-center">
            <button className="bg-[#1f2c6e] hover:bg-[#26367e] px-3 py-1 rounded-md">
              Today
            </button>
            <ChevronLeft className="cursor-pointer" />
            <span className="text-lg font-semibold">May 2025</span>
            <ChevronRight className="cursor-pointer" />
          </div>
        </div>
        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center font-semibold border-b border-gray-700 pb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2 mt-4 text-center text-sm">
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              className="h-20 border border-gray-700 rounded-md p-1 hover:bg-[#132454] transition"
            >
              <div className="text-gray-300 font-medium">{i + 1}</div>
              {/* Sample event */}
              {i === 6 && (
                <div className="text-xs bg-purple-600 text-white mt-2 rounded px-1">
                  Interview @ 10AM
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Floating Add Event Button */}
        <button className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
          <Plus size={18} />
          Add Event
        </button>
      </div>
    </>
  );
};

export default page;
