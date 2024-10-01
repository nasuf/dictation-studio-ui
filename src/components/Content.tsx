import React, { useRef, useState, useMemo } from "react";
import { Breadcrumb, Layout, theme, Button, Modal, Tag, Checkbox } from "antd";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import { CloudUploadOutlined, FileTextOutlined } from "@ant-design/icons";

import AppSider from "@/components/Sider";
import { Word } from "@/components/dictation/Word";
import VideoMain, {
  VideoMainRef,
} from "@/components/dictation/video/VideoMain";
import Radio from "@/components/dictation/Radio";
import ChannelList from "@/components/dictation/video/ChannelList";
import VideoList from "@/components/dictation/video/VideoList";
import ChannelManagement from "@/components/admin/ChannelManagement";
import VideoManagement from "@/components/admin/VideoManagement";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import UserManagement from "@/components/admin/UserManagement";
import UserProgress from "@/components/profile/Progress";
import Information from "@/components/profile/Information";

import nlp from "compromise";
import { FilterOption } from "@/utils/type";

const { Content } = Layout;

const isArticleOrDeterminer = (word: string): boolean => {
  const articlesAndDeterminers = [
    "a",
    "an",
    "the",
    "this",
    "that",
    "these",
    "those",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "some",
    "any",
    "many",
    "much",
    "few",
    "little",
    "several",
    "enough",
    "all",
    "both",
    "each",
    "every",
  ];
  return articlesAndDeterminers.includes(word.toLowerCase());
};

const removePunctuation = (word: string) => {
  return word.replace(/^[^\w\s]+|[^\w\s]+$/g, "").toLowerCase();
};

const AppContent: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const videoMainRef = useRef<VideoMainRef>(null);
  const { t } = useTranslation();
  const isDictationStarted = useSelector(
    (state: RootState) => state.user.isDictationStarted
  );

  const componentStyle = {
    width: "640px",
    height: "390px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = [{ title: "Home", path: "/" }];

    pathSnippets.forEach((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      let title = snippet.charAt(0).toUpperCase() + snippet.slice(1);

      if (snippet === "channel" && location.state && location.state.name) {
        title = location.state.name;
      }

      breadcrumbItems.push({ title, path: url });
    });

    return breadcrumbItems;
  };

  const handleSaveProgress = () => {
    if (videoMainRef.current) {
      videoMainRef.current.saveProgress();
    }
  };

  const isVideoPage = /^\/dictation\/video\/[^/]+\/[^/]+$/.test(
    location.pathname
  );

  const [isMissedWordsModalVisible, setIsMissedWordsModalVisible] =
    useState(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [isDictationCompleted, setIsDictationCompleted] = useState(false);

  const showMissedWordsModal = () => {
    if (videoMainRef.current) {
      setMissedWords(videoMainRef.current.getMissedWords());
      setIsMissedWordsModalVisible(true);
    }
  };

  const handleRemoveMissedWord = (word: string) => {
    if (videoMainRef.current) {
      const cleanWord = removePunctuation(word);
      videoMainRef.current.removeMissedWord(cleanWord);
      setMissedWords((prev) =>
        prev.filter((w) => removePunctuation(w) !== cleanWord)
      );
    }
  };

  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    {
      key: "removePrepositions",
      translationKey: "filterPrepositions",
      checked: false,
    },
    { key: "removePronouns", translationKey: "filterPronouns", checked: false },
    {
      key: "removeAuxiliaryVerbs",
      translationKey: "filterAuxiliaryVerbs",
      checked: false,
    },
    { key: "removeNumbers", translationKey: "filterNumbers", checked: false },
    {
      key: "removeArticleOrDeterminer",
      translationKey: "filterArticlesAndDeterminers",
      checked: false,
    },
    {
      key: "removeConjunctions",
      translationKey: "filterConjunctions",
      checked: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setFilterOptions(filterOptions.map((option) => ({ ...option, checked })));
  };

  const handleFilterChange = (key: string, checked: boolean) => {
    setFilterOptions((prevOptions) => {
      const newOptions = prevOptions.map((option) =>
        option.key === key ? { ...option, checked } : option
      );
      setSelectAll(newOptions.every((option) => option.checked));
      return newOptions;
    });
  };

  const filteredMissedWords = useMemo(() => {
    return missedWords.filter((word) => {
      const doc = nlp(word);
      if (
        filterOptions.find((o) => o.key === "removePrepositions")?.checked &&
        doc.prepositions().length > 0
      )
        return false;
      if (
        filterOptions.find((o) => o.key === "removePronouns")?.checked &&
        doc.pronouns().length > 0
      )
        return false;
      if (
        filterOptions.find((o) => o.key === "removeAuxiliaryVerbs")?.checked &&
        doc.verbs().conjugate().length > 0
      )
        return false;
      if (
        filterOptions.find((o) => o.key === "removeNumbers")?.checked &&
        doc.numbers().length > 0
      )
        return false;
      if (
        filterOptions.find((o) => o.key === "removeArticleOrDeterminer")
          ?.checked &&
        isArticleOrDeterminer(word)
      )
        return false;
      if (
        filterOptions.find((o) => o.key === "removeConjunctions")?.checked &&
        doc.conjunctions().length > 0
      )
        return false;
      return true;
    });
  }, [missedWords, filterOptions]);

  return (
    <Content style={{ padding: "0 48px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "16px 0",
        }}
      >
        <Breadcrumb>
          {getBreadcrumbItems().map((item, index) => (
            <Breadcrumb.Item key={index}>
              <Link to={item.path}>{item.title}</Link>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        {isVideoPage && (
          <div>
            <Button
              onClick={showMissedWordsModal}
              style={{ marginRight: 8 }}
              disabled={!isDictationCompleted}
            >
              <FileTextOutlined />
              {t("missedWordsSummary")}
            </Button>
            <Button onClick={handleSaveProgress} disabled={!isDictationStarted}>
              <CloudUploadOutlined />
              {t("saveProgressBtnText")}
            </Button>
          </div>
        )}
      </div>
      <Layout
        style={{
          height: "80vh",
          padding: "24px 0",
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <AppSider />
        <Content
          style={{
            padding: "0 24px",
            minHeight: 280,
            width: "100%",
            overflow: "auto",
          }}
        >
          <Routes>
            <Route path="/" element={<ChannelList />} />
            <Route path="/dictation" element={<ChannelList />} />
            <Route path="/dictation/video" element={<ChannelList />} />
            <Route path="/dictation/video/:channelId" element={<VideoList />} />
            <Route
              path="/dictation/video/:channelId/:videoId"
              element={
                <VideoMain
                  ref={videoMainRef}
                  onComplete={() => setIsDictationCompleted(true)}
                />
              }
            />
            <Route
              path="/dictation/word"
              element={<Word style={componentStyle} />}
            />
            <Route path="/collection/video" element={<div>文章收藏</div>} />
            <Route path="/collection/word" element={<div>单词收藏</div>} />
            <Route path="/radio" element={<Radio style={componentStyle} />} />
            <Route path="/admin/channel" element={<ChannelManagement />} />
            <Route path="/admin/video" element={<VideoManagement />} />
            <Route path="/admin/user" element={<UserManagement />} />
            <Route path="/profile" element={<Information />} />
            <Route path="/profile/infomation" element={<Information />} />
            <Route path="/profile/progress" element={<UserProgress />} />
          </Routes>
        </Content>
      </Layout>
      <Modal
        title={t("missedWordsSummary")}
        open={isMissedWordsModalVisible}
        onCancel={() => setIsMissedWordsModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", padding: 0 }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 1,
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Checkbox
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="mb-2 font-bold"
          >
            {t("selectAll")}
          </Checkbox>
          <br />
          {filterOptions.map((option) => (
            <Checkbox
              key={option.key}
              checked={option.checked}
              onChange={(e) => handleFilterChange(option.key, e.target.checked)}
              className="mr-4 mb-2"
            >
              {t(option.translationKey)}
            </Checkbox>
          ))}
        </div>
        <div
          style={{
            padding: "16px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 300px)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {filteredMissedWords.map((word) => (
              <Tag
                key={word}
                closable
                onClose={() => handleRemoveMissedWord(word)}
                style={{ fontSize: "16px", padding: "4px 8px" }}
              >
                {word}
              </Tag>
            ))}
          </div>
        </div>
      </Modal>
    </Content>
  );
};

export default AppContent;
