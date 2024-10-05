import React from "react";

interface TimerProps {
  time: number;
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ time, isRunning }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl ml-4
        bg-gradient-to-br from-blue-300 to-purple-400 dark:bg-gradient-to-br dark:from-blue-400 dark:to-purple-500 ${
          !isRunning ? "animate-pulse" : ""
        }`}
    >
      <span
        className={`text-sm font-semibold text-purple-800 dark:text-gray-200`}
      >
        {formatTime(time)}
      </span>
    </div>
  );
};

export default Timer;
