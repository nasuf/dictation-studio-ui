import React from "react";

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 py-4 text-center">
      Daily Dictation ©{new Date().getFullYear()} Created by NASUF
    </footer>
  );
};

export default AppFooter;
