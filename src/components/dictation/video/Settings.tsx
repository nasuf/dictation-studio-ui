import React from "react";
import { Slider, Select, Card, Typography, Tag, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { ShortcutKeys } from "@/utils/type";
import {
  PlayCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  KeyOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface SettingsProps {
  playbackSpeed: number;
  autoRepeat: number;
  shortcuts: ShortcutKeys;
  handleSpeedChange: (newSpeed: number) => void;
  handleAutoRepeatChange: (value: number) => void;
  handleShortcutSet: (key: string) => void;
  settingShortcut: string | null;
}

// 键码到用户友好名称的映射
const keyCodeToDisplayName = (keyCode: string): string => {
  const keyMap: { [key: string]: string } = {
    Enter: "Enter",
    Tab: "Tab",
    Space: "Space",
    ControlLeft: "Ctrl",
    ControlRight: "Ctrl",
    ShiftLeft: "Shift",
    ShiftRight: "Shift",
    AltLeft: "Alt",
    AltRight: "Alt",
    MetaLeft: "Cmd",
    MetaRight: "Cmd",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    Escape: "Esc",
    Backspace: "Backspace",
    Delete: "Delete",
    Home: "Home",
    End: "End",
    PageUp: "Page Up",
    PageDown: "Page Down",
  };

  // 处理字母键
  if (keyCode.startsWith("Key")) {
    return keyCode.replace("Key", "");
  }

  // 处理数字键
  if (keyCode.startsWith("Digit")) {
    return keyCode.replace("Digit", "");
  }

  // 处理F键
  if (keyCode.startsWith("F") && keyCode.length <= 3) {
    return keyCode;
  }

  return keyMap[keyCode] || keyCode;
};

// 获取快捷键功能的图标
const getShortcutIcon = (key: string) => {
  const iconMap = {
    repeat: <PlayCircleOutlined />,
    prev: <StepBackwardOutlined />,
    next: <StepForwardOutlined />,
  };
  return iconMap[key as keyof typeof iconMap] || <KeyOutlined />;
};

// 获取快捷键功能的描述
const getShortcutDescription = (key: string, t: any) => {
  const descMap = {
    repeat: t("repeatCurrentSentence") || "Repeat current sentence",
    prev: t("playPreviousSentence") || "Play previous sentence",
    next: t("playNextSentence") || "Play next sentence",
  };
  return descMap[key as keyof typeof descMap] || "";
};

const Settings: React.FC<SettingsProps> = ({
  playbackSpeed,
  autoRepeat,
  shortcuts,
  handleSpeedChange,
  handleAutoRepeatChange,
  handleShortcutSet,
  settingShortcut,
}) => {
  const { t } = useTranslation();

  const handleShortcutClick = (key: string) => {
    handleShortcutSet(key);
  };

  // Remove handleKeyCapture - let parent component handle all keyboard events

  return (
    <div className="space-y-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
      {/* Playback Speed */}
      <div>
        <h6 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {t("playbackSpeed")}
        </h6>
        <div className="px-2">
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={playbackSpeed}
            onChange={handleSpeedChange}
            className="custom-slider"
            tooltip={{ formatter: (value) => `${value}x` }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x</span>
            <span className="font-medium">{playbackSpeed}x</span>
            <span>2.0x</span>
          </div>
        </div>
      </div>

      {/* Auto Repeat */}
      <div>
        <h6 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {t("autoRepeat")}
        </h6>
        <Select
          value={autoRepeat}
          onChange={handleAutoRepeatChange}
          className="w-full"
          size="middle"
        >
          <Select.Option value={0}>{t("off") || "Off"}</Select.Option>
          <Select.Option value={1}>{t("onceTime") || "1 time"}</Select.Option>
          <Select.Option value={2}>
            {t("twiceTimes") || "2 times"}
          </Select.Option>
          <Select.Option value={3}>
            {t("threeTimes") || "3 times"}
          </Select.Option>
        </Select>
      </div>

      {/* Shortcut Keys */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h6 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t("shortcutKeys")}
          </h6>
          <Tooltip
            title={
              t("shortcutKeysHelp") ||
              "Click a button below, then press any key to set the shortcut"
            }
          >
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>

        {/* 设置提示 */}
        {settingShortcut && (
          <div className="mb-2 px-2 py-1.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded text-center">
            <div className="flex items-center justify-center gap-1.5">
              <KeyOutlined className="text-blue-600 dark:text-blue-400 text-xs" />
              <Text className="text-blue-800 dark:text-blue-200 text-xs font-medium">
                {t("pressAnyKeyToSet") || "Press any key to set shortcut for"}{" "}
                <strong>{t(settingShortcut)}</strong>
              </Text>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {Object.entries(shortcuts).map(([key, value]) => (
            <Card
              key={key}
              size="small"
              className={`cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                settingShortcut === key
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
              }`}
              onClick={() => handleShortcutClick(key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-lg text-gray-600 dark:text-gray-400">
                    {getShortcutIcon(key)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {t(key)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getShortcutDescription(key, t)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {settingShortcut === key ? (
                    <Tag color="blue" className="animate-pulse">
                      {t("pressKey") || "Press key..."}
                    </Tag>
                  ) : (
                    <Tag
                      color="default"
                      className="font-mono text-sm px-3 py-1"
                      style={{ minWidth: "60px", textAlign: "center" }}
                    >
                      {value
                        ? keyCodeToDisplayName(value)
                        : t("notSet") || "Not set"}
                    </Tag>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 快捷键说明 */}
        <div className="mt-2 px-2 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
          <Text className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            <strong>{t("tip") || "Tip"}:</strong>{" "}
            {t("shortcutKeysTip") ||
              "These shortcuts work when the video player is active. You can use any key combination including Ctrl, Alt, Shift, function keys, or single keys."}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Settings;
