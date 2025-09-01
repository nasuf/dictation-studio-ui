import React from "react";
import { Link } from "react-router-dom";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { SkeletonImage } from "./Widget";

interface VideoCardProps {
  videoId: string;
  videoTitle: string;
  progress: number;
  isImageLoaded: boolean;
  onImageLoad: (videoId: string) => void;
  onVideoClick?: (videoId: string, videoTitle: string) => void;
  linkPath?: string | undefined;
  showPlayButton?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
  videoId,
  videoTitle,
  progress,
  isImageLoaded,
  onImageLoad,
  onVideoClick,
  linkPath,
  showPlayButton = true,
}) => {
  const { t } = useTranslation();
  const getVideoStatus = (progressValue: number) => {
    if (progressValue >= 100) return "completed";
    if (progressValue > 0) return "in_progress";
    return "not_started";
  };

  const getStatusColor = (progressValue: number) => {
    const status = getVideoStatus(progressValue);
    switch (status) {
      case "completed":
        return "#52c41a"; // green
      case "in_progress":
        return "#1890ff"; // blue
      default:
        return "#9e9e9e"; // gray
    }
  };

  const getStatusText = (progressValue: number) => {
    const status = getVideoStatus(progressValue);
    switch (status) {
      case "completed":
        return t("completed");
      case "in_progress":
        return t("inProgress");
      default:
        return t("notStarted");
    }
  };

  const cardContent = (
    <div className="group block transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-blue-500/30 dark:group-hover:border-blue-400/30">
        {/* Main video thumbnail container */}
        <div className="relative overflow-hidden" style={{ paddingTop: "56.25%" }}>
          {!isImageLoaded && (
            <SkeletonImage active />
          )}
          <img
            alt={videoTitle}
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            onLoad={() => onImageLoad(videoId)}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Modern progress bar */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 backdrop-blur-sm">
              <div
                className="h-full transition-all duration-500 relative overflow-hidden"
                style={{
                  width: `${progress}%`,
                  backgroundColor: getStatusColor(progress),
                }}
              >
                {/* Animated shimmer effect for progress */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
          )}
          
          {/* Enhanced play button */}
          {showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20 dark:group-hover:bg-black/30">
                <PlayCircleOutlined className="text-white text-xl md:text-2xl drop-shadow-lg" />
              </div>
            </div>
          )}
          
          {/* Modern progress percentage badge */}
          {progress > 0 && (
            <div className="absolute top-3 right-3">
              <div className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg">
                <div 
                  className="w-2 h-2 rounded-full mr-2 animate-pulse" 
                  style={{ backgroundColor: getStatusColor(progress) }}
                />
                <span className="text-white text-xs font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          )}
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Content section with fixed height */}
        <div className="relative h-24 p-4 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50">
          {/* Title with fixed height for exactly 2 lines */}
          <div className="h-10 mb-1">
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-5">
              {videoTitle}
            </h3>
          </div>
          
          {/* Status indicator fixed at bottom-left */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse shadow-lg"
                style={{
                  backgroundColor: getStatusColor(progress),
                  boxShadow: `0 0 4px ${getStatusColor(progress)}40`
                }}
              />
              <span
                className="text-[10px] md:text-xs font-medium transition-colors duration-300"
                style={{ color: getStatusColor(progress) }}
              >
                {getStatusText(progress)}
              </span>
            </div>
            
            {/* Action indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-5 h-5 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center shadow-lg">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (linkPath) {
    return (
      <Link
        to={linkPath}
        onClick={() => onVideoClick?.(videoId, videoTitle)}
        className="block"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default VideoCard;