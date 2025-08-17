import { Card, Typography, Avatar, Skeleton, Drawer } from "antd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { AudioOutlined, EditOutlined } from "@ant-design/icons";

export const VideoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 640px;
  max-height: 80vh;
`;

export const YouTubeWrapper = styled.div`
  width: 100%;
  max-width: 640px;
  aspect-ratio: 16 / 9;
  background-color: black;
  overflow: hidden;
  position: relative;
`;

export const ScrollingSubtitles = styled.div`
  height: calc(80vh - 100px);
  overflow-y: auto;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const BlurredText = styled.div<{
  isBlurred: boolean;
}>`
  filter: ${(props) => (props.isBlurred ? "blur(5px)" : "none")};
  transition: filter 0.3s ease;
  font-size: 18px;
  text-align: center;
  margin: 20px 0;
  opacity: ${(props) => (props.isBlurred ? 0.5 : 1)};
`;

export const LoadingContainer = styled.div`
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
`;

export const SubtitlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

export const ComparisonText = styled.span<{ color: string }>`
  color: ${(props) => props.color};
`;

export const HighlightedText = styled.span<{ backgroundColor: string }>`
  background-color: ${(props) => props.backgroundColor};
`;

export const SubtitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const SubtitleContent = styled.div`
  flex: 1;
  margin-right: 20px;
`;

export const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  padding: 20px;
`;

export const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  height: 100%;
`;

export const StyledVideoColumn = styled(VideoColumn)`
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 20px;
`;

export const ScrollableSubtitles = styled(ScrollingSubtitles)`
  flex: 1;
  overflow-y: auto;
`;

export const StyledYouTubeWrapper = styled(YouTubeWrapper)`
  width: 100%;
  max-width: 640px;
  margin-top: 40px;
`;

export const ScrollableContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 20px 20px 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 8px 20px 8px;
  }

  @media (max-width: 480px) {
    padding: 6px 4px 16px 4px;
  }

  @media (max-width: 360px) {
    padding: 4px 2px 12px 2px;
  }
`;

export const VideoCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  align-content: start;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  @media (max-width: 360px) {
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
`;

export const HideYouTubeControls = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  iframe {
    pointer-events: none;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const ProgressCircle: React.FC<{ percentage: number }> = ({
  percentage,
}) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="transparent"
        stroke="#e6e6e6"
        strokeWidth="4"
        className="dark:stroke-gray-700"
      />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="transparent"
        stroke="#1890ff"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 24 24)"
        className="dark:stroke-blue-400"
      />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dy=".3em"
        fontSize="12"
        fill="#1890ff"
        className="dark:fill-blue-400"
      >
        {`${Math.round(percentage)}%`}
      </text>
    </svg>
  );
};

export const CustomCardMeta = styled(Card.Meta)`
  .ant-card-meta-title {
    margin-bottom: 8px;
  }
`;

export const ScrollingTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  width: 100%;

  .inner-text {
    display: inline-block;
    padding-right: 100%;
    animation: scroll-left 15s linear infinite;
    animation-play-state: paused;
  }

  &:hover .inner-text {
    animation-play-state: running;
  }

  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .inner-text::after {
    content: attr(data-content);
    position: absolute;
    left: 100%;
    top: 0;
    white-space: nowrap;
  }
`;

export const CustomHoverCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  background-color: transparent;
  border: none;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  .ant-card-cover {
    overflow: hidden;
    border-radius: 12px 12px 0 0;
  }

  .ant-card-body {
    padding: 12px;
    background: #f0f2f5;
    height: 60px;
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    
    .ant-card-body {
      padding: 8px;
      height: 60px;
    }
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    
    .ant-card-body {
      padding: 6px;
      height: 60px;
      font-size: 12px;
    }
  }

  @media (max-width: 360px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    
    .ant-card-body {
      padding: 4px;
      height: 60px;
      font-size: 11px;
    }
  }

  .dark & {
    .ant-card-body {
      background: #1f2937;
    }
  }
`;

export const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 0px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  @media (max-width: 360px) {
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
`;

// Universal card component for both channels and videos
export const UniversalCard = styled(Card)<{ contentType?: 'channel' | 'video' }>`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  background-color: transparent;
  border: none;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  .ant-card-cover {
    overflow: hidden;
    border-radius: 12px 12px 0 0;
  }

  .ant-card-body {
    padding: 0;
    height: ${props => props.contentType === 'video' ? '100px' : '60px'};
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    
    .ant-card-body {
      height: ${props => props.contentType === 'video' ? '95px' : '60px'};
    }
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    
    .ant-card-body {
      height: ${props => props.contentType === 'video' ? '90px' : '60px'};
    }
  }

  @media (max-width: 360px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    
    .ant-card-body {
      height: ${props => props.contentType === 'video' ? '85px' : '60px'};
    }
  }
`;

// Backward compatibility alias
export const ChannelCard = UniversalCard;

export const ChannelImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

// Universal content info component for both channels and videos
export const UniversalContentInfo = styled.div<{ contentType?: 'channel' | 'video' }>`
  padding: 12px !important;
  background: #f0f2f5 !important;
  height: ${props => props.contentType === 'video' ? '100px' : '60px'} !important;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.contentType === 'video' ? 'flex-start' : 'center'};
  justify-content: ${props => props.contentType === 'video' ? 'flex-start' : 'center'};
  box-sizing: border-box;

  .dark & {
    background: #1f2937 !important;
  }

  @media (max-width: 768px) {
    padding: 10px !important;
    height: ${props => props.contentType === 'video' ? '95px' : '60px'} !important;
  }

  @media (max-width: 480px) {
    padding: 8px !important;
    height: ${props => props.contentType === 'video' ? '90px' : '60px'} !important;
    font-size: 12px;
  }

  @media (max-width: 360px) {
    padding: 6px !important;
    height: ${props => props.contentType === 'video' ? '85px' : '60px'} !important;
    font-size: 11px;
  }
`;

// Backward compatibility alias
export const ChannelInfo = UniversalContentInfo;

const { Title } = Typography;

// Universal title component for both channels and videos
export const UniversalContentTitle = styled(Title)<{ contentType?: 'channel' | 'video' }>`
  margin: 0 !important;
  font-size: 14px !important;
  text-align: ${props => props.contentType === 'video' ? 'left' : 'center'};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
  flex: ${props => props.contentType === 'video' ? '1' : 'none'};
  height: ${props => props.contentType === 'video' ? 'auto' : 'auto'};
  max-height: ${props => props.contentType === 'video' ? '42px' : 'none'};
  word-break: break-word;

  .dark & {
    color: #e5e7eb;
  }

  @media (max-width: 768px) {
    font-size: 13px !important;
    line-height: 1.25;
    max-height: ${props => props.contentType === 'video' ? '39px' : 'none'};
  }

  @media (max-width: 480px) {
    font-size: 12px !important;
    line-height: 1.25;
    max-height: ${props => props.contentType === 'video' ? '36px' : 'none'};
  }

  @media (max-width: 360px) {
    font-size: 11px !important;
    line-height: 1.25;
    max-height: ${props => props.contentType === 'video' ? '33px' : 'none'};
  }
`;

// Backward compatibility alias
export const ChannelName = UniversalContentTitle;

// Status indicator component for videos with smart spacing
export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  margin-bottom: 2px;
  gap: 4px;
  flex-shrink: 0;
  min-height: 16px;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .status-text {
    font-size: 11px;
    font-weight: 500;
    flex-shrink: 0;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    min-height: 15px;
    margin-bottom: 1px;
    
    .status-text {
      font-size: 10px;
    }
  }

  @media (max-width: 480px) {
    gap: 3px;
    min-height: 14px;
    margin-bottom: 0;
    
    .status-dot {
      width: 6px;
      height: 6px;
    }
    
    .status-text {
      font-size: 9px;
    }
  }

  @media (max-width: 360px) {
    min-height: 13px;
    
    .status-text {
      font-size: 8px;
    }
  }
`;

export const StyledAvatar = styled(Avatar)`
  cursor: pointer;
  width: 40px;
  height: 40px;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const LogoIcon = styled(AudioOutlined)`
  font-size: 24px;
  color: #1890ff;
  margin-right: 8px;
`;

export const LogoText = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const SkeletonImage = styled(Skeleton.Image)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;

  .ant-skeleton-image {
    width: 100% !important;
    height: 100% !important;
  }
`;

export const DualProgressBar: React.FC<{
  completionPercentage: number;
  accuracyPercentage: number;
  isCompleted: boolean;
}> = ({ completionPercentage, accuracyPercentage, isCompleted }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full h-12 flex items-center">
      <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-in-out ${
            isCompleted ? "animate-pulse" : ""
          }`}
          style={{ width: `${completionPercentage}%` }}
        ></div>
        <div
          className="absolute top-0 left-0 h-full bg-green-500 opacity-70 transition-all duration-500 ease-in-out"
          style={{ width: `${accuracyPercentage}%` }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-2 text-xs font-medium">
          <span className="text-white dark:text-gray-200 drop-shadow-md">
            {`${t("completionRate")}: ${Math.round(completionPercentage)}%`}
          </span>
          <span className="text-white dark:text-gray-200 drop-shadow-md">
            {`${t("accuracyRate")}: ${Math.round(accuracyPercentage)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};

export const BlurredBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 1000;
`;

export const StyledDrawer = styled(Drawer)`
  .ant-drawer-content-wrapper {
    width: 400px !important;
  }
  .ant-drawer-content {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
  }

  .dark & {
    .ant-drawer-content {
      background: rgba(31, 41, 55, 0.8);
      color: #e5e7eb;
    }
    .ant-drawer-title {
      color: #e5e7eb;
    }
    .ant-drawer-close {
      color: #e5e7eb;
    }
  }
`;

export const LoginContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

export const FormWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
`;

export const BottomSection = styled.div`
  padding: 20px 0;
`;

export const EditIcon = styled(EditOutlined)`
  position: absolute;
  right: 50%;
  bottom: -10px;
  transform: translateX(50px);
  background-color: #fff;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
`;
