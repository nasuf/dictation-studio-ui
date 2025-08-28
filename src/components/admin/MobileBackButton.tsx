import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface MobileBackButtonProps {
  title: string;
  onBack?: () => void;
}

const MobileBackButton: React.FC<MobileBackButtonProps> = ({ title, onBack }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default behavior: go to admin portal on mobile
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        navigate("/admin/portal");
      } else {
        navigate(-1);
      }
    }
  };

  return (
    <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center">
      <button
        onClick={handleBack}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
      >
        <ArrowLeftOutlined className="mr-2" />
        <span className="text-sm font-medium">{t("back")}</span>
      </button>
      <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white pr-12">
        {title}
      </h1>
    </div>
  );
};

export default MobileBackButton;