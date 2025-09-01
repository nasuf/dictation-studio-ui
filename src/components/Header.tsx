import React, { useState, useCallback, useEffect } from "react";
import { Menu, Dropdown, message, Switch } from "antd";
import {
  GlobalOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";
import { api } from "@/api/api";
import LoginModal from "@/components/LoginModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { clearUser, setLanguage, setUser } from "@/redux/userSlice";
import { useNavigate } from "react-router-dom";
import { USER_ROLE } from "@/utils/const";
import { GradualSpacing } from "@/lib/magic-ui-components/GradualSpacing";
import { supabase } from "@/utils/supabaseClient";
import { localStorageCleanup } from "@/utils/util";

interface AppHeaderProps {
  showLoginModal: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  onSiderToggle?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showLoginModal,
  isDarkMode,
  toggleDarkMode,
  language,
  onSiderToggle,
}) => {
  const { i18n, t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const response = await api.logout();
      if (response.status === 200) {
        message.success(t("logoutSuccessful"));
      } else {
        message.error(t("logoutFailed"));
      }
    } catch {
      message.error(t("logoutFailed"));
    } finally {
      dispatch(clearUser());
      localStorageCleanup();
      navigate("/");
      await supabase.auth.signOut();
    }
  };

  // Modify toggleLanguage to save the config
  const handleToggleLanguage = useCallback(
    (lang: string) => {
      toggleLanguage(lang);
      dispatch(setLanguage(lang));
      if (userInfo) {
        const updatedUserInfo = { ...userInfo, language: lang };
        dispatch(setUser(updatedUserInfo));
        api.saveUserConfig({ language: lang });
      }
    },
    [toggleLanguage, userInfo]
  );

  useEffect(() => {
    toggleLanguage(language);
  }, [language, toggleLanguage]);

  const languageMenu = (
    <Menu
      onClick={({ key }) => handleToggleLanguage(key as string)}
      selectedKeys={[currentLanguage]}
      className="modern-menu"
    >
      <Menu.Item key="en" className="modern-menu-item">
        English
      </Menu.Item>
      <Menu.Item key="zh" className="modern-menu-item">
        简体中文
      </Menu.Item>
      <Menu.Item key="zhTraditional" className="modern-menu-item">
        繁體中文
      </Menu.Item>
      <Menu.Item key="ja" className="modern-menu-item">
        日本語
      </Menu.Item>
      <Menu.Item key="ko" className="modern-menu-item">
        한국어
      </Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu className="modern-menu">
      <Menu.Item
        key="profile"
        onClick={() => navigate("/profile/information")}
        className="modern-menu-item"
      >
        {t("userProfile")}
      </Menu.Item>
      <Menu.Item
        key="upgrade-plan"
        onClick={() => navigate("/profile/upgrade-plan")}
        className="modern-menu-item"
      >
        {t("upgradePlan")}
      </Menu.Item>
      {userInfo?.role === USER_ROLE.ADMIN && (
        <Menu.Item
          key="admin"
          onClick={() => {
            // Check if mobile device (screen width < 768px)
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
              navigate("/admin/portal");
            } else {
              navigate("/admin/user");
            }
          }}
          className="modern-menu-item"
        >
          {t("adminPanel")}
        </Menu.Item>
      )}
      <Menu.Item
        key="channel-recommendation"
        onClick={() => navigate("/profile/channel-recommendation")}
        className="modern-menu-item"
      >
        {t("channelRecommendation")}
      </Menu.Item>
      <Menu.Item
        key="feedback"
        onClick={() => navigate("/profile/feedback")}
        className="modern-menu-item"
      >
        {t("feedback")}
      </Menu.Item>
      <Menu.Item
        key="settings"
        onClick={() => navigate("/profile/reward-developer")}
        className="modern-menu-item"
      >
        {t("supportDeveloper")}
      </Menu.Item>
      <Menu.Item key="logout" onClick={logout} className="modern-menu-item">
        {t("logout")}
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <header className="modern-header relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 header-pattern"></div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="floating-orb"
              style={{
                width: `${12 + i * 4}px`,
                height: `${12 + i * 4}px`,
                left: `${15 + i * 25}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${4 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            {onSiderToggle && (
              <button
                onClick={onSiderToggle}
                className="md:hidden modern-button modern-button-primary"
              >
                <MenuOutlined className="modern-icon" />
              </button>
            )}

            {/* Logo */}
            <div className="md:hidden">
              <span
                className="modern-logo cursor-pointer"
                onClick={() => navigate("/dictation/video")}
              >
                Dictation Studio
              </span>
            </div>
            <div className="hidden md:block">
              <GradualSpacing
                className="modern-logo-desktop cursor-pointer"
                text="Dictation Studio"
                customProps={{ onClick: () => navigate("/dictation/video") }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme Toggle */}
            <div className="modern-switch-container">
              <Switch
                checked={isDarkMode}
                onChange={toggleDarkMode}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                className="relative"
              />
            </div>

            {/* Language Dropdown */}
            <Dropdown
              overlay={languageMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button className="modern-button modern-button-transparent">
                <GlobalOutlined className="modern-icon" />
                <span className="hidden md:inline modern-text">
                  {i18n.language === "en"
                    ? "EN"
                    : i18n.language === "zh"
                    ? "중"
                    : i18n.language === "zhTraditional"
                    ? "繁"
                    : i18n.language === "ja"
                    ? "日"
                    : "한"}
                </span>
              </button>
            </Dropdown>

            {/* User Menu */}
            {userInfo ? (
              <Dropdown
                overlay={userMenu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button className="modern-avatar-button">
                  <img
                    src={userInfo.avatar}
                    alt="User Avatar"
                    className="modern-avatar"
                  />
                  <div className="modern-avatar-glow"></div>
                </button>
              </Dropdown>
            ) : (
              <button
                onClick={showLoginModal}
                className="modern-button modern-button-accent"
              >
                <UserOutlined className="modern-icon" />
                <span className="hidden md:inline modern-text">
                  {t("login")}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="header-particle"
              style={{
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 4) * 15}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${6 + (i % 3)}s`,
              }}
            />
          ))}
        </div>
      </header>

      <LoginModal
        visible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
      />
    </>
  );
};

export default AppHeader;
