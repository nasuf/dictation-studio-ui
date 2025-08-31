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
    } catch (error) {
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
      className="sci-fi-menu"
    >
      <Menu.Item key="en" className="sci-fi-menu-item">
        English
      </Menu.Item>
      <Menu.Item key="zh" className="sci-fi-menu-item">
        简体中文
      </Menu.Item>
      <Menu.Item key="zhTraditional" className="sci-fi-menu-item">
        繁體中文
      </Menu.Item>
      <Menu.Item key="ja" className="sci-fi-menu-item">
        日本語
      </Menu.Item>
      <Menu.Item key="ko" className="sci-fi-menu-item">
        한국어
      </Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu className="sci-fi-menu">
      <Menu.Item
        key="profile"
        onClick={() => navigate("/profile/information")}
        className="sci-fi-menu-item"
      >
        {t("userProfile")}
      </Menu.Item>
      <Menu.Item
        key="upgrade-plan"
        onClick={() => navigate("/profile/upgrade-plan")}
        className="sci-fi-menu-item"
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
          className="sci-fi-menu-item"
        >
          {t("adminPanel")}
        </Menu.Item>
      )}
      <Menu.Item
        key="channel-recommendation"
        onClick={() => navigate("/profile/channel-recommendation")}
        className="sci-fi-menu-item"
      >
        {t("channelRecommendation")}
      </Menu.Item>
      <Menu.Item
        key="feedback"
        onClick={() => navigate("/profile/feedback")}
        className="sci-fi-menu-item"
      >
        {t("feedback")}
      </Menu.Item>
      <Menu.Item
        key="settings"
        onClick={() => navigate("/profile/reward-developer")}
        className="sci-fi-menu-item"
      >
        {t("supportDeveloper")}
      </Menu.Item>
      <Menu.Item key="logout" onClick={logout} className="sci-fi-menu-item">
        {t("logout")}
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <header className="sci-fi-header relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 sci-fi-header-bg"></div>
        <div className="absolute inset-0 sci-fi-circuit-pattern"></div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            {onSiderToggle && (
              <button
                onClick={onSiderToggle}
                className="md:hidden sci-fi-button sci-fi-button-secondary"
              >
                <MenuOutlined />
              </button>
            )}

            {/* Logo */}
            <div className="md:hidden">
              <span
                className="sci-fi-logo cursor-pointer"
                onClick={() => navigate("/dictation/video")}
              >
                Dictation Studio
              </span>
            </div>
            <div className="hidden md:block">
              <GradualSpacing
                className="sci-fi-logo-desktop cursor-pointer"
                text="Dictation Studio"
                customProps={{ onClick: () => navigate("/dictation/video") }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme Toggle */}
            <div className="sci-fi-switch-container">
              <Switch
                checked={isDarkMode}
                onChange={toggleDarkMode}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                className="sci-fi-switch"
              />
            </div>

            {/* Language Dropdown */}
            <Dropdown
              overlay={languageMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button className="sci-fi-button sci-fi-button-primary">
                <GlobalOutlined className="sci-fi-icon" />
                <span className="hidden md:inline sci-fi-text">
                  {i18n.language === "en"
                    ? "EN"
                    : i18n.language === "zh"
                    ? "中"
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
                <button className="sci-fi-avatar-button">
                  <img
                    src={userInfo.avatar}
                    alt="User Avatar"
                    className="sci-fi-avatar"
                  />
                  <div className="sci-fi-avatar-glow"></div>
                </button>
              </Dropdown>
            ) : (
              <button
                onClick={showLoginModal}
                className="sci-fi-button sci-fi-button-accent"
              >
                <UserOutlined className="sci-fi-icon" />
                <span className="hidden md:inline sci-fi-text">
                  {t("login")}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="sci-fi-particle"
              style={{
                left: `${20 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </header>

      <LoginModal
        visible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
      />

      {/* Sci-Fi Header Styles */}
      <style>{`
        .sci-fi-header {
          height: 64px;
          position: relative;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
        }

        /* Background Gradients */
        .sci-fi-header-bg {
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(51, 65, 85, 0.95) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 50%, rgba(241, 245, 249, 0.95) 100%)"
          };
        }

        /* Circuit Pattern */
        .sci-fi-circuit-pattern {
          background-image: 
            radial-gradient(circle at 20% 50%, ${
              isDarkMode
                ? "rgba(139, 92, 246, 0.1)"
                : "rgba(139, 92, 246, 0.05)"
            } 2px, transparent 2px),
            radial-gradient(circle at 80% 50%, ${
              isDarkMode
                ? "rgba(59, 130, 246, 0.1)"
                : "rgba(59, 130, 246, 0.05)"
            } 1px, transparent 1px);
          background-size: 100px 50px, 80px 40px;
          animation: circuit-flow 20s linear infinite;
          opacity: ${isDarkMode ? "0.6" : "0.3"};
        }


        /* Logo Styles */
        .sci-fi-logo {
          font-size: 1.125rem;
          font-weight: 800;
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, #8B5CF6, #3B82F6, #06B6D4)"
              : "linear-gradient(135deg, #7C3AED, #2563EB, #0891B2)"
          };
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: logo-gradient 3s ease-in-out infinite;
          text-shadow: ${
            isDarkMode
              ? "0 0 10px rgba(139, 92, 246, 0.3)"
              : "0 0 5px rgba(139, 92, 246, 0.2)"
          };
        }

        .sci-fi-logo-desktop {
          font-size: 1.5rem;
          font-weight: 900;
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, #8B5CF6, #3B82F6, #06B6D4)"
              : "linear-gradient(135deg, #7C3AED, #2563EB, #0891B2)"
          };
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: logo-gradient 3s ease-in-out infinite;
          letter-spacing: -0.025em;
        }

        /* Button Styles */
        .sci-fi-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid transparent;
          background: ${
            isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(248, 250, 252, 0.8)"
          };
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
        }

        .sci-fi-button::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.3))"
              : "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2))"
          };
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sci-fi-button:hover::before {
          opacity: 1;
        }

        .sci-fi-button:hover {
          transform: translateY(-1px);
          box-shadow: ${
            isDarkMode
              ? "0 8px 25px rgba(139, 92, 246, 0.3)"
              : "0 8px 25px rgba(139, 92, 246, 0.2)"
          };
        }

        .sci-fi-button-primary {
          color: ${isDarkMode ? "#E5E7EB" : "#374151"};
        }

        .sci-fi-button-secondary {
          color: ${isDarkMode ? "#D1D5DB" : "#4B5563"};
        }

        .sci-fi-button-accent {
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))"
              : "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))"
          };
          color: ${isDarkMode ? "#A78BFA" : "#7C3AED"};
        }

        /* Avatar Styles */
        .sci-fi-avatar-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          border: 2px solid transparent;
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))"
              : "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))"
          };
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
        }

        .sci-fi-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          object-fit: cover;
        }

        .sci-fi-avatar-glow {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: ${
            isDarkMode
              ? "conic-gradient(from 0deg, #8B5CF6, #3B82F6, #06B6D4, #8B5CF6)"
              : "conic-gradient(from 0deg, #7C3AED, #2563EB, #0891B2, #7C3AED)"
          };
          animation: avatar-rotate 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sci-fi-avatar-button:hover .sci-fi-avatar-glow {
          opacity: 0.6;
        }

        /* Switch Styles */
        .sci-fi-switch-container {
          position: relative;
          padding: 0.25rem;
          border-radius: 1rem;
          background: ${
            isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(248, 250, 252, 0.8)"
          };
          backdrop-filter: blur(8px);
        }

        .sci-fi-switch {
          position: relative;
        }

        .sci-fi-switch .ant-switch-handle::before {
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, #8B5CF6, #3B82F6)"
              : "linear-gradient(135deg, #7C3AED, #2563EB)"
          };
          border-radius: 50%;
          box-shadow: ${
            isDarkMode
              ? "0 2px 8px rgba(139, 92, 246, 0.4)"
              : "0 2px 8px rgba(139, 92, 246, 0.3)"
          };
        }

        /* Menu Styles */
        .sci-fi-menu {
          background: ${
            isDarkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"
          };
          backdrop-filter: blur(12px);
          border: 1px solid ${
            isDarkMode ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)"
          };
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: ${
            isDarkMode
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
              : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          };
        }

        .sci-fi-menu-item {
          color: ${isDarkMode ? "#E5E7EB" : "#374151"};
          background: transparent;
          transition: all 0.2s ease;
        }

        .sci-fi-menu-item:hover {
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))"
              : "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))"
          };
          color: ${isDarkMode ? "#A78BFA" : "#7C3AED"};
        }

        /* Particles */
        .sci-fi-particle {
          position: absolute;
          top: 50%;
          width: 2px;
          height: 2px;
          background: ${
            isDarkMode
              ? "radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)"
          };
          border-radius: 50%;
          animation: particle-float 4s ease-in-out infinite;
        }

        /* Icon and Text */
        .sci-fi-icon {
          font-size: 1rem;
          opacity: 0.8;
        }

        .sci-fi-text {
          font-size: 0.875rem;
          font-weight: 500;
          opacity: 0.9;
        }

        /* Animations */
        @keyframes circuit-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }


        @keyframes logo-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes avatar-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes particle-float {
          0%, 100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-10px) scale(1.2); 
            opacity: 0.8; 
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sci-fi-header {
            height: 56px;
          }
          
          .sci-fi-button {
            padding: 0.375rem 0.5rem;
            gap: 0.25rem;
          }
          
          .sci-fi-avatar-button {
            width: 2rem;
            height: 2rem;
          }
          
          .sci-fi-avatar {
            width: 1.5rem;
            height: 1.5rem;
          }
        }

        /* Override Ant Design Styles */
        .ant-switch-checked {
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, #1E293B, #0F172A)"
              : "linear-gradient(135deg, #8B5CF6, #7C3AED)"
          } !important;
        }

        .ant-switch {
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, #FCD34D, #F59E0B)"
              : "linear-gradient(135deg, #E5E7EB, #D1D5DB)"
          } !important;
        }

        .ant-dropdown {
          z-index: 1050;
        }
      `}</style>
    </>
  );
};

export default AppHeader;
