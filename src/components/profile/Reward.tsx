import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartOutlined,
  WechatOutlined,
  GiftOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import WeChatRewardQR from "../../assets/WeChat_Reward.jpg";

const Reward: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Preload image optimization
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageError(true);
      message.error(t("qrCodeLoadFailed"));
    };
    img.src = WeChatRewardQR;
  }, [t]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    message.error(t("qrCodeLoadFailed"));
  };

  // 移动端渲染函数
  const renderMobileView = () => (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 移动端标题栏 */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center">
            <span className="text-lg mr-2">❤️</span>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("rewardDeveloper")}
            </h1>
          </div>
        </div>
      </div>

      {/* 移动端内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 头部说明 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
            <HeartOutlined className="text-2xl text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t("supportDeveloper")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("yourSupportIsPowerful")}
          </p>
        </div>

        {/* 二维码区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {/* Loading Skeleton */}
              {!imageLoaded && !imageError && (
                <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <WechatOutlined className="text-3xl text-gray-400 dark:text-gray-500" />
                </div>
              )}

              {/* QR Code Image */}
              {!imageError && (
                <img
                  src={WeChatRewardQR}
                  alt={t("wechatScanReward")}
                  className={`w-48 h-48 rounded-2xl shadow-xl transition-all duration-500 ${
                    imageLoaded
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="eager"
                  decoding="async"
                />
              )}

              {/* Error State */}
              {imageError && (
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <WechatOutlined className="text-3xl text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-xs text-center px-4">
                    {t("qrCodeLoadFailed")}
                  </p>
                </div>
              )}

              {/* WeChat Badge */}
              {!imageError && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <WechatOutlined className="text-white text-sm" />
                </div>
              )}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center justify-center gap-2">
                <WechatOutlined className="text-green-500" />
                {t("wechatScanReward")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("scanQRCodeToReward")}
              </p>
            </div>
          </div>
        </div>

        {/* 特性卡片 */}
        <div className="space-y-4 mb-6">
          {/* Feature Card 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <GiftOutlined className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {t("safeAndConvenient")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  {t("wechatOfficialPayment")}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <StarOutlined className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {t("supportDevelopment")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  {t("helpProductImprovement")}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <ThunderboltOutlined className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {t("expressGratitude")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  {t("conveyRecognitionEncouragement")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 感谢信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
            {t("thankYouMessage")}
          </p>
        </div>
      </div>
    </div>
  );

  // 桌面端渲染函数
  const renderDesktopView = () => (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <HeartOutlined className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            {t("supportDeveloper")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t("yourSupportIsPowerful")}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* QR Code Section */}
          <div className="relative">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Loading Skeleton */}
                  {!imageLoaded && !imageError && (
                    <div className="w-56 h-56 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center animate-pulse">
                      <WechatOutlined className="text-4xl text-gray-400 dark:text-gray-500" />
                    </div>
                  )}

                  {/* QR Code Image */}
                  {!imageError && (
                    <img
                      src={WeChatRewardQR}
                      alt={t("wechatScanReward")}
                      className={`w-56 h-56 rounded-2xl shadow-xl transition-all duration-500 hover:scale-105 ${
                        imageLoaded
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      loading="eager"
                      decoding="async"
                    />
                  )}

                  {/* Error State */}
                  {imageError && (
                    <div className="w-56 h-56 bg-gray-100 dark:bg-gray-700 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <WechatOutlined className="text-4xl text-gray-400 dark:text-gray-500 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">
                        {t("qrCodeLoadFailed")}
                      </p>
                    </div>
                  )}

                  {/* WeChat Badge */}
                  {!imageError && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <WechatOutlined className="text-white text-sm" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center justify-center gap-2 mb-2">
                    <WechatOutlined className="text-green-500" />
                    {t("wechatScanReward")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("scanQRCodeToReward")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section - Vertically Centered */}
          <div className="flex flex-col justify-center space-y-4">
            {/* Feature Card 1 */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <GiftOutlined className="text-white text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                    {t("safeAndConvenient")}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t("wechatOfficialPayment")}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <StarOutlined className="text-white text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                    {t("supportDevelopment")}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t("helpProductImprovement")}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative overflow-hidden bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ThunderboltOutlined className="text-white text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                    {t("expressGratitude")}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t("conveyRecognitionEncouragement")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("thankYouMessage")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 大屏幕版本 - 768px及以上 */}
      <div className="hidden md:block h-full">
        {renderDesktopView()}
      </div>
      
      {/* 小屏幕版本 - 768px以下 */}
      <div className="block md:hidden h-full">
        {renderMobileView()}
      </div>
    </>
  );
};

export default Reward;
