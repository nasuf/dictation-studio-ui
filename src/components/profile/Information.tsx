import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Information: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userInfo) {
      setLoading(false);
    }
  }, [userInfo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <img
              src={userInfo?.avatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
            />
          </div>
        </div>
        <div className="pt-20 pb-8 px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {userInfo?.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {userInfo?.role}
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {userInfo?.email}
              </span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                {userInfo?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
