import React from "react";
import { Slider, Select, Button } from "antd";
import { useTranslation } from "react-i18next";
import { ShortcutKeys } from "@/utils/type";

interface SettingsProps {
  playbackSpeed: number;
  autoRepeat: number;
  shortcuts: ShortcutKeys;
  handleSpeedChange: (newSpeed: number) => void;
  handleAutoRepeatChange: (value: number) => void;
  handleShortcutSet: (key: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  playbackSpeed,
  autoRepeat,
  shortcuts,
  handleSpeedChange,
  handleAutoRepeatChange,
  handleShortcutSet,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div>
        <h6 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {t("playbackSpeed")}
        </h6>
        <Slider
          min={0.5}
          max={2}
          step={0.1}
          value={playbackSpeed}
          onChange={handleSpeedChange}
          className="custom-slider"
        />
      </div>
      <div>
        <h6 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {t("autoRepeat")}
        </h6>
        <Select
          value={autoRepeat}
          onChange={handleAutoRepeatChange}
          className="w-full"
        >
          <Select.Option value={0}>Off</Select.Option>
          <Select.Option value={1}>1 time</Select.Option>
          <Select.Option value={2}>2 times</Select.Option>
          <Select.Option value={3}>3 times</Select.Option>
        </Select>
      </div>
      <div>
        <h6 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {t("shortcutKeys")}
        </h6>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(shortcuts).map(([key, value]) => (
            <Button
              key={key}
              onClick={() => handleShortcutSet(key)}
              className="w-full text-left"
            >
              {t(key)}: {value || "Not set"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
