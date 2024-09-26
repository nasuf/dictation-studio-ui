import { Card } from "antd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

export const VideoContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 20px;
  height: calc(100vh - 64px);
  align-items: center;
  justify-content: center;
`;

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

export const HoverCard = styled(Card)`
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

    .progress-bar {
      transform: scaleY(1.5);
      bottom: -1px;
    }
  }
`;

export const ProgressBar = styled.div<{ percent: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #e6e6e6;
  transition: all 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${(props) => props.percent}%;
    background-color: #1890ff;
    transition: width 0.3s ease-in-out;
  }

  &.progress-bar {
    transform-origin: bottom;
  }
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

const ProgressBarText = styled.div<{ color: string }>`
  position: absolute;
  left: 5px;
  top: 2px;
  color: ${(props) => props.color};
  font-size: 12px;
  z-index: 1;
  width: 100%;
  text-align: left;
  padding: 0 5px;
  box-sizing: border-box;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
    1px 1px 0 #fff;
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
  const backgroundColor = "#f0f0f0";

  const textColor =
    completionPercentage > 10
      ? getTextColor(completionColor)
      : getTextColor(backgroundColor);

  return (
    <ProgressBarBase>
      <ProgressBarFill width={completionPercentage} color={completionColor} />
      <ProgressBarFill
        width={accuracyPercentage}
        color={accuracyColor}
        style={{ opacity: 0.7 }}
      />
      <ProgressBarText color={textColor}>
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

export const StyledScrollableContainer = styled(ScrollableContainer)`
  position: relative;
  padding-bottom: 4px;
`;

export const ChannelCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 16px;
`;

export const CenteredCardMeta = styled(Card.Meta)`
  .ant-card-meta-title {
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
  }
`;

export const CustomCardMeta = styled(Card.Meta)`
  .ant-card-meta-title {
    margin-bottom: 8px;
  }
`;

export const ChannelCustomCardMeta = styled(CustomCardMeta)`
  .ant-card-meta-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
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
