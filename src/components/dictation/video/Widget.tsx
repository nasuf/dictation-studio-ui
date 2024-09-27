import { Card, Typography, Avatar } from "antd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { AudioOutlined } from "@ant-design/icons";

export const VideoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 640px;
  max-height: 80vh;
`;

export const SubtitlesColumn = styled.div`
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
  isCurrent: boolean;
}>`
  filter: ${(props) => (props.isBlurred ? "blur(5px)" : "none")};
  transition: filter 0.3s ease;
  font-size: 18px;
  text-align: center;
  margin: 20px 0;
  opacity: ${(props) => (props.isCurrent ? 1 : 0.5)};
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

export const ProgressCircleWrapper = styled.div`
  flex-shrink: 0;
  width: 40px;
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

export const StyledSubtitlesColumn = styled(SubtitlesColumn)`
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  padding: 20px;
`;

export const VideoCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  align-content: start;
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

const ProgressBarBase = styled.div`
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  margin-bottom: 10px;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ width: number; color: string }>`
  width: ${(props) => props.width}%;
  height: 100%;
  background: ${(props) => props.color};
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.5s ease-in-out;
`;

const ProgressBarText = styled.div`
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  font-size: 12px;
  z-index: 1;
  width: 100%;
  text-align: left;
  padding: 0 5px;
  box-sizing: border-box;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const getTextColor = (backgroundColor: string) => {
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

export const DualProgressBar: React.FC<{
  completionPercentage: number;
  accuracyPercentage: number;
}> = ({ completionPercentage, accuracyPercentage }) => {
  const { t } = useTranslation();
  const completionColor = "#1890ff";
  const accuracyColor = "#52c41a";

  return (
    <ProgressBarBase>
      <ProgressBarFill width={completionPercentage} color={completionColor} />
      <ProgressBarFill
        width={accuracyPercentage}
        color={accuracyColor}
        style={{ opacity: 0.7 }}
      />
      <ProgressBarText>
        {`${t("completionRate")}: ${Math.round(completionPercentage)}% ${t(
          "accuracyRate"
        )}: ${Math.round(accuracyPercentage)}%`}
      </ProgressBarText>
    </ProgressBarBase>
  );
};

export const ProgressCircle: React.FC<{ percentage: number }> = ({
  percentage,
}) => {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="transparent"
        stroke="#e6e6e6"
        strokeWidth="5"
      />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="transparent"
        stroke="#52c41a"
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 20 20)"
      />
      <text x="20" y="20" textAnchor="middle" dy=".3em" fontSize="12">
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
`;

export const CustomHoverCard = styled(Card)`
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

export const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
  padding: 0px;
`;

export const ChannelCard = styled(Card)`
  border-radius: 9px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.1);
  height: 240px; // 设置固定高度

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 5px 11px rgba(0, 0, 0, 0.2);
  }
`;

export const ChannelImage = styled.img`
  width: 100%;
  height: 145px;
  object-fit: cover;
`;

export const ChannelInfo = styled.div`
  padding: 0px;
  background: linear-gradient(to bottom, #f0f2f5, #ffffff);
  height: 65px; // 设置固定高度
  display: flex;
  align-items: center;
  justify-content: center;
`;

const { Title } = Typography;
export const ChannelName = styled(Title)`
  margin: 0 !important;
  font-size: 15px !important;
  text-align: center;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
