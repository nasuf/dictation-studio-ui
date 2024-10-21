import React, { useState, useCallback, useEffect } from "react";
import { Menu, Dropdown, message, Switch } from "antd";
import {
  GlobalOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useLanguageToggle } from "@/hooks/useLanguageToggle";
import { api } from "@/api/api";
import LoginModal from "@/components/LoginModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { clearUser, setLanguage, setUser } from "@/redux/userSlice";
import { useNavigate } from "react-router-dom";
import { JWT_TOKEN_KEY, USER_KEY } from "@/utils/const";
import { GradualSpacing } from "@/lib/magic-ui-components/GradualSpacing";

interface AppHeaderProps {
  showLoginModal: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showLoginModal,
  isDarkMode,
  toggleDarkMode,
  language,
}) => {
  const { i18n, t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguageToggle();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const navigate = useNavigate();

  // const login = useGoogleLogin({
  //   onSuccess: async (tokenResponse) => {
  //     try {
  //       const response = await api.verifyGoogleToken(
  //         tokenResponse.access_token
  //       );
  //       dispatch(setUser(response.data));
  //       message.success(t("loginSuccessfulWithGoogle"));
  //       setIsLoginModalVisible(false);
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 1000);
  //     } catch (error) {
  //       console.error("Login failed:", error);
  //       message.error(t("loginFailedWithGoogle"));
  //       localStorage.removeItem(JWT_TOKEN_KEY);
  //     }
  //   },
  //   onError: () => {
  //     console.log("Login Failed");
  //     message.error(t("loginFailedWithGoogle"));
  //     localStorage.removeItem(JWT_TOKEN_KEY);
  //   },
  // });

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
      localStorage.removeItem(JWT_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      navigate("/");
    }
  };

  // Modify toggleLanguage to save the config
  const handleToggleLanguage = useCallback(
    (lang: string) => {
      toggleLanguage(lang);
      dispatch(setLanguage(lang));

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
      const updatedUser = { ...storedUser, language: lang };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      // Update Redux store
      if (userInfo) {
        const updatedUserInfo = { ...userInfo, language: lang };
        dispatch(setUser(updatedUserInfo));
        // Save the updated language to the backend
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
      className="header-menu"
    >
      <Menu.Item key="en" className="header-menu-item">
        English
      </Menu.Item>
      <Menu.Item key="zh" className="header-menu-item">
        简体中文
      </Menu.Item>
      <Menu.Item key="zhTraditional" className="header-menu-item">
        繁體中文
      </Menu.Item>
      <Menu.Item key="ja" className="header-menu-item">
        日本語
      </Menu.Item>
      <Menu.Item key="ko" className="header-menu-item">
        한국어
      </Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu className="header-menu">
      <Menu.Item
        key="profile"
        onClick={() => navigate("/profile/information")}
        className="header-menu-item"
      >
        {t("userProfile")}
      </Menu.Item>
      {userInfo?.role === "admin" && (
        <Menu.Item
          key="admin"
          onClick={() => navigate("/admin/channel")}
          className="header-menu-item"
        >
          {t("adminPanel")}
        </Menu.Item>
      )}
      <Menu.Item key="logout" onClick={logout} className="header-menu-item">
        {t("logout")}
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-gradient-to-r from-purple-900 via-purple-700 to-blue-600 dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white dark:text-gray-300 py-2 px-4 md:px-6 flex items-center justify-between shadow-lg h-16">
      <div className="flex items-center">
        <GradualSpacing
          className="text-2xl md:text-2xl font-bold cursor-pointer font-display text-center font-bold -tracking-widest text-white dark:text-gray-300 md:leading-[5rem]"
          text="Dictation Studio"
          customProps={{ onClick: () => navigate("/dictation/video") }}
        />
      </div>
      <div className="flex items-center space-x-4">
        <Switch
          checked={isDarkMode}
          onChange={toggleDarkMode}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          className="bg-purple-500 dark:bg-gray-600"
        />
        <Dropdown overlay={languageMenu} trigger={["click"]}>
          <button className="flex items-center space-x-1 bg-transparent hover:bg-white/10 dark:hover:bg-gray-600/50 px-2 md:px-3 py-1 md:py-2 rounded-md transition duration-300 text-sm md:text-base">
            <GlobalOutlined />
            <span className="hidden md:inline">
              {i18n.language === "en"
                ? "English"
                : i18n.language === "zh"
                ? "简体中文"
                : i18n.language === "zhTraditional"
                ? "繁體中文"
                : i18n.language === "ja"
                ? "日本語"
                : "한국어"}
            </span>
          </button>
        </Dropdown>
        {userInfo ? (
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <button className="flex items-center space-x-1 md:space-x-2 bg-transparent hover:bg-white/10 dark:hover:bg-gray-600/50 px-2 md:px-3 py-1 md:py-2 rounded-md transition duration-300 text-sm md:text-base">
              <img
                src={userInfo.avatar}
                alt="User Avatar"
                className="w-6 h-6 md:w-8 md:h-8 rounded-full"
              />
            </button>
          </Dropdown>
        ) : (
          <button
            onClick={showLoginModal}
            className="bg-transparent hover:bg-white/10 dark:hover:bg-gray-600/50 text-white px-2 md:px-4 py-1 md:py-2 rounded-md transition duration-300 text-sm md:text-base"
          >
            <UserOutlined className="md:mr-2" />
            <span className="hidden md:inline">{t("login")}</span>
          </button>
        )}
      </div>
      <LoginModal
        visible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
      />
    </header>
  );
};

export default AppHeader;
