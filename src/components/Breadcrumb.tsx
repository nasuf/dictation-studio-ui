import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { HomeOutlined } from "@ant-design/icons";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { channelName, videoName } = useSelector(
    (state: RootState) => state.navigation
  );

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = [{ title: "Home", path: "/" }];

    pathSnippets.forEach((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      let title = snippet.charAt(0).toUpperCase() + snippet.slice(1);

      switch (snippet) {
        case "dictation":
          title = "Dictation";
          break;
        case "video":
          if (pathSnippets[index - 1] === "dictation") {
            title = "Video Dictation";
          } else if (pathSnippets[index - 1] === "collection") {
            title = "Video Collection";
          }
          break;
        case "word":
          if (pathSnippets[index - 1] === "dictation") {
            title = "Word Dictation";
          } else if (pathSnippets[index - 1] === "collection") {
            title = "Word Collection";
          }
          break;
        case "collection":
          title = "Collection";
          break;
        case "radio":
          title = "FM";
          break;
        case "admin":
          title = "Admin";
          break;
        case "channel":
          title = "Channel Management";
          break;
        case "user":
          title = "User Management";
          break;
        case "profile":
          title = "Profile";
          break;
        case "information":
          title = "Information";
          break;
        case "progress":
          title = "Progress";
          break;
      }

      if (
        index === 2 &&
        pathSnippets[1] === "dictation" &&
        pathSnippets[2] === "video"
      ) {
        title = channelName || "Channel";
      } else if (
        index === 3 &&
        pathSnippets[1] === "dictation" &&
        pathSnippets[2] === "video"
      ) {
        title = videoName || "Video";
      }

      breadcrumbItems.push({ title, path: url });
    });

    return breadcrumbItems;
  };

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 py-2">
        {getBreadcrumbItems().map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon
                className="w-5 h-5 text-gray-400 mx-2"
                aria-hidden="true"
              />
            )}
            <Link
              to={item.path}
              className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ease-in-out
                ${
                  index === getBreadcrumbItems().length - 1
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                }`}
            >
              {index === 0 ? (
                <HomeOutlined className="mr-2 h-5 w-5" />
              ) : (
                <span
                  className={`w-2 h-2 rounded-full mr-2
                    ${
                      index === getBreadcrumbItems().length - 1
                        ? "bg-blue-600 dark:bg-blue-400"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                ></span>
              )}
              {item.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
