import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const enTranslations = {
  signIn: "Sign In",
  signUp: "Sign Up",
  dictation: "Dictation",
  videoDictation: "Video Dictation",
  wordDictation: "Word Dictation",
  collection: "Collection",
  videoCollection: "Video Collection",
  wordCollection: "Word Collection",
  fm: "FM",
  videoDictationKeyboardInstructions:
    "Press Tab to start dictation or repeat the current sentence, press Enter to continue to the next sentence. Or customize your own shortcut keys in the settings.",
  wordDictationKeyboardInstructions:
    "Press Enter to submit and validate the answer. Press Enter again to get the next word. Press Tab or click the card to replay the word pronunciation.",
  inputPlaceHolder: "Enter what you hear",
  completionRate: "Completion Rate",
  accuracyRate: "Accuracy Rate",
  yourInput: "Your Input",
  loginSuccessful: "Login successful",
  loginFormErrorMessage: "Login failed, please try again",
  loginFormUsernameOrEmailPrompt: "Please enter your email",
  loginFormPasswordPrompt: "Please enter your password",
  loginFormSubmitButtonText: "Submit",
  registerFormUsernamePrompt: "Please enter your username",
  registerFormEmailPrompt: "Please enter your email",
  registerFormEmailInvalidPrompt: "Please enter a valid email",
  registerFormPasswordPrompt: "Please enter your password",
  registerFormPasswordInvalidPrompt:
    "Password length must be at least 6 characters",
  registerFormConfirmPasswordPrompt: "Please enter your password again",
  registerFormConfirmPasswordInvalidPrompt:
    "The password you entered does not match",
  registerFormSubmitButtonText: "Submit",
  registerFormSuccessMessage: "Register successful, redirecting...",
  registerFormErrorMessage: "Register failed, please try again",
  loginFailedWithGoogle: "Google login failed, please try again",
  signInWithGoogle: "Sign in with Google",
  haveAnAccount: "Have an account? Sign in now",
  noAccount: "No account? Sign up now",
  chooseAvatar: "Choose an avatar",
  loadMore: "Load more",
  cancel: "Cancel",
  submit: "Submit",
  logoutSuccessful: "Logout successful",
  logoutFailed: "Logout failed",
  userProfile: "User Profile",
  logout: "Logout",
  login: "Login",
  emailAlreadyExists: "Email already exists",
  emailCheckFailed: "Email check failed",
  progressSaved: "Progress saved",
  progressSaveFailed: "Progress save failed",
  saveProgressBtnText: "Save Progress",
  profile: "Profile",
  adminPanel: "Admin Panel",
  clearCache: "Clear Cache",
  dictationCompleted: "Dictation Completed",
  startOverOrNot:
    "You have already completed this dictation. Do you want to start over?",
  dictationCompletedCongratulations: "Congratulations!",
  dictationCompletedCongratulationsContent:
    "You have completed this dictation exercise!",
  missedWordsSummary: "Missed Words Summary",
  information: "Information",
  dictationProgress: "Dictation Progress",
  homePageDescription:
    "Improve your foreign language listening with daily dictation exercises.",
  startDictation: "Start Dictation",
  selectAll: "Select All",
  filterPrepositions: "Remove Prepositions",
  filterPronouns: "Remove Pronouns",
  filterAuxiliaryVerbs: "Remove Auxiliary Verbs",
  filterNumbers: "Remove Numbers",
  filterArticlesAndDeterminers: "Remove Articles and Determiners",
  filterConjunctions: "Remove Conjunctions",
  goBack: "Go Back",
  resetProgress: "Reset Progress",
  hours: "hours",
  minutes: "minutes",
  seconds: "seconds",
  totalDictationTime: "Total Dictation Time",
  loading: "Loading...",
  unauthorized: "Unauthorized. Please login first.",
  comingSoon: "Coming Soon...",
  markAsCorrect: "Mark as correct",
  dictationConfigUpdated: "Dictation config updated",
  dictationConfigUpdateFailed: "Dictation config update failed",
  playbackSpeed: "Playback Speed",
  autoRepeat: "Auto Repeat",
  shortcutKeys: "Shortcut Keys",
  repeat: "Repeat",
  next: "Next",
  prev: "Previous",
  noProgressDataAvailable: "No dictation progress available",
  dictationActivities: "Dictation Activities",
  upgradePlan: "Upgrade Plan",
  choosePlanTitle: "Dictation Plans",
  choosePlanDescription:
    "Choose the plan that works best for you, or activate a membership code if you have one.",
  freePlan: "Free Plan",
  basicPlan: "Basic Plan",
  proPlan: "Pro Plan",
  premiumPlan: "Premium Plan",
  oneMonth: "1 Month",
  threeMonths: "3 Months",
  sixMonths: "6 Months",
  unlimitedTime: "Unlimited Time",
  notAvailable: "Not Available",
  cancelSubscription: "Cancel Subscription",
  selectPlan: "Select Plan",
  selectSubscriptionMethod: "Select Subscription Method",
  clickToPay: "Click to Pay",
  autoRenewDescription: "Auto-renew subscription, cancel anytime",
  onetimeDescription: "One-time purchase, no auto-renewal",
  autoRenew: "Auto-renew",
  onetimePurchase: "One-time Purchase",
  email: "Email",
  plan: "Plan",
  expireTime: "Expire Time",
  noLimit: "No Limit",
  noData: "No Data",
  noCollectedWords:
    "No collected words yet. Please start dictation first to collect words",
  wordPreview: "Word Preview",
  nextPayment: "Next Payment",
  wordsDeletedSuccess: "Words deleted successfully",
  wordsDeleteFailed: "Words delete failed",
  missedWordsSaved: "Missed words saved",
  missedWordsSaveFailed: "Missed words save failed",
  cancelSubscriptionConfirm: "Cancel Subscription Confirmation",
  cancelSubscriptionWarning:
    "Are you sure you want to cancel your subscription?",
  cancelSubscriptionWarning1:
    "Your subscription will be cancelled at the end of the current billing period",
  cancelSubscriptionWarning2:
    "You will lose access to current plan features after the subscription ends",
  cancelSubscriptionWarning3:
    "You can resubscribe at any time to regain access once current billing period ends",
  confirm: "Confirm",
  cancelling: "Cancelling...",
  dictationLanguage: "Dictation Language",
  language: "Language",
  languageAutoDetectHint: "Auto-detect will guess language based on content",
  channelList: "Channel List",
  allLanguages: "All Languages",
  noChannelsFound: "No channels found for this language.",
  pleaseInputLink: "Please input video link",
  pleaseInputTitle: "Please input video title",
  videoLink: "YouTube Video Link",
  videoTitle: "Video Title",
  getSubtitle: "Get Subtitles",
  uploadSubtitle: "Upload SRT",
  addVideo: "Add Video",
  fetchingVideoTitle: "Fetching video title...",
  invalidYoutubeLink: "Invalid YouTube link, cannot extract video ID",
  videoTitleFetchSuccess: "Video title fetched successfully",
  videoTitleFetchFailed: "Failed to fetch video title, please enter manually",
  fileUploadSuccess: "{{filename}} uploaded successfully",
  fileUploadFailed: "{{filename}} upload failed",
  purchasePlans: "Purchase Plans",
  activateWithCode: "Activate with Code",
  manageSubscription: "Manage Subscription",
  redeemMembershipCode: "Redeem Your Membership Code",
  enterVerificationCodeBelow:
    "Enter your verification code below to activate your membership",
  verificationCode: "Verification Code",
  pleaseEnterVerificationCode: "Please enter your verification code",
  enterVerificationCode: "Enter your verification code",
  activateMembership: "Activate Membership",
  verificationCodeDescription:
    "If you received a code from an administrator or through a promotion, you can use it here to activate your membership benefits.",
  currentMembership: "Current Membership",
  status: "Status",
  activeRecurring: "Active (Recurring)",
  active: "Active",
  expires: "Expires",
  dictationQuotaExceeded: "Dictation Limit Reached",
  basicPlanLimitMessage:
    "Free users can dictate up to 4 videos every 30 days. You've reached your limit for the current period. Subscribe to any plan to enjoy unlimited dictations.",
  basicPlanQuotaInfo:
    "Free User: {{used}}/{{limit}} videos ({{startDate}} - {{endDate}})",
  freeUserQuotaHeader: "Free User Quota: {{used}}/{{limit}} videos",
  freeUserQuotaRenewal: "Your quota will reset on {{endDate}}",
  infiniteVideos: "unlimited videos",
  upgradeNow: "Subscribe Now",
  failedToLoadDictation: "Failed to load dictation data",
};

const zhTranslations = {
  signIn: "登录",
  signUp: "注册",
  dictation: "听写",
  videoDictation: "视频听写",
  wordDictation: "单词听写",
  collection: "收藏",
  videoCollection: "视频收藏",
  wordCollection: "单词收藏",
  fm: "电台",
  videoDictationKeyboardInstructions:
    "按Tab键开始听写或重复当前语句，按Enter键继续下一句话。或者在设置中自定义快捷键。",
  wordDictationKeyboardInstructions:
    "按Enter键提交并验证答案。再次按Enter键获取下一个单词。按Tab键或点击卡片重新播放单词发音",
  inputPlaceHolder: "输入你听到的内容",
  completionRate: "完成率",
  accuracyRate: "准确率",
  yourInput: "你的输入",
  loginSuccessful: "登录成功",
  loginSuccessfulWithGoogle: "Google 登录成功",
  loginFormErrorMessage: "登录失败，请重试",
  loginFormUsernameOrEmailPrompt: "请输入邮箱",
  loginFormPasswordPrompt: "请输入密码",
  loginFormSubmitButtonText: "登录",
  registerFormUsernamePrompt: "请输入用户名",
  registerFormEmailPrompt: "请输入邮箱地址",
  registerFormEmailInvalidPrompt: "请输入有效的邮箱地址",
  registerFormPasswordPrompt: "请输入密码",
  registerFormPasswordInvalidPrompt: "密码长度必须至少为6个字符",
  registerFormConfirmPasswordPrompt: "请再次输入密码",
  registerFormConfirmPasswordInvalidPrompt: "两次输入的密码不一致",
  registerFormSubmitButtonText: "提交",
  registerFormSuccessMessage: "注册成功，即将自动登录",
  registerFormErrorMessage: "注册失败，请重试",
  loginFailedWithGoogle: "Google 登录失败，请重试",
  signInWithGoogle: "使用 Google 账号登录",
  haveAnAccount: "已有账号？立即登录",
  noAccount: "还没有账号？立即注册",
  chooseAvatar: "选择头像",
  loadMore: "加载更多",
  cancel: "取消",
  submit: "提交",
  logoutSuccessful: "退出成功",
  logoutFailed: "退出失败",
  userProfile: "个人中心",
  logout: "退出登录",
  login: "登录",
  emailAlreadyExists: "邮箱已存在",
  emailCheckFailed: "邮箱检查失败",
  progressSaved: "进度已保存",
  progressSaveFailed: "进度保存失败",
  saveProgressBtnText: "保存进度",
  profile: "个人中心",
  adminPanel: "管理员面板",
  clearCache: "清除缓存",
  dictationCompleted: "听写完成",
  startOverOrNot: "你已经完成了这个听写。你想从头开始吗？",
  dictationCompletedCongratulations: "恭喜！",
  dictationCompletedCongratulationsContent: "你已经完成了这个听写练习！",
  missedWordsSummary: "未写出单词汇总",
  information: "个人信息",
  dictationProgress: "听写进度",
  homePageDescription: "通过每日听写练习提高您的英语听力。",
  startDictation: "开始听写",
  selectAll: "全选",
  filterPrepositions: "移除介词",
  filterPronouns: "移除代词",
  filterAuxiliaryVerbs: "移除助动词",
  filterNumbers: "移除数字",
  filterArticlesAndDeterminers: "移除冠词和限定词",
  filterConjunctions: "移除连词",
  goBack: "返回",
  resetProgress: "重置进度",
  totalDictationTime: "总听写时间",
  loading: "加载中...",
  hours: "小时",
  minutes: "分钟",
  seconds: "秒",
  unauthorized: "未授权。请先登录。",
  comingSoon: "即将推出...",
  markAsCorrect: "标记为正确",
  dictationConfigUpdated: "听写配置已更新",
  dictationConfigUpdateFailed: "听写配置更新失败",
  playbackSpeed: "播放速度",
  autoRepeat: "自动重复",
  shortcutKeys: "快捷键",
  repeat: "重复",
  next: "下一句",
  prev: "上一句",
  noProgressDataAvailable: "暂无听写进度",
  dictationActivities: "听写记录",
  upgradePlan: "升级计划",
  choosePlanTitle: "听写计划",
  choosePlanDescription: "选择最适合您的计划，或通过激活码激活您的会员资格。",
  freePlan: "免费计划",
  basicPlan: "基础计划",
  proPlan: "专业计划",
  premiumPlan: "高级计划",
  oneMonth: "1个月",
  threeMonths: "3个月",
  sixMonths: "6个月",
  unlimitedTime: "无限时长",
  notAvailable: "不可用",
  cancelSubscription: "取消订阅",
  selectPlan: "选择计划",
  selectSubscriptionMethod: "选择订阅方式",
  clickToPay: "点击支付",
  autoRenewDescription: "自动续费订阅，随时取消",
  onetimeDescription: "一次性购买，不自动续费",
  autoRenew: "自动续费",
  onetimePurchase: "一次性购买",
  email: "邮箱",
  plan: "听写计划",
  expireTime: "过期时间",
  noLimit: "无限制",
  noData: "无数据",
  noCollectedWords: "暂无单词收藏。请先开始听写来收集单词",
  wordPreview: "单词预览",
  nextPayment: "下次付款",
  wordsDeletedSuccess: "单词删除成功",
  wordsDeleteFailed: "单词删除失败",
  missedWordsSaved: "单词已保存",
  missedWordsSaveFailed: "单词保存失败",
  cancelSubscriptionConfirm: "确认取消订阅",
  cancelSubscriptionWarning: "您确定要取消订阅吗？",
  cancelSubscriptionWarning1: "您的订阅将在当前计费周期结束时取消",
  cancelSubscriptionWarning2: "订阅结束后，您将失去对当前计划功能的访问权限",
  cancelSubscriptionWarning3:
    "您可以在当前计费周期结束后，随时重新订阅以恢复访问权限",
  confirm: "确认",
  cancelling: "取消中...",
  dictationLanguage: "听写语言",
  language: "语言",
  languageAutoDetectHint: "自动检测将根据内容猜测语言",
  channelList: "频道列表",
  allLanguages: "所有语言",
  noChannelsFound: "未找到此语言的频道。",
  pleaseInputLink: "请输入视频链接",
  pleaseInputTitle: "请输入视频标题",
  videoLink: "YouTube视频链接",
  videoTitle: "视频标题",
  getSubtitle: "获取字幕",
  uploadSubtitle: "上传SRT",
  addVideo: "添加视频",
  fetchingVideoTitle: "正在获取视频标题...",
  invalidYoutubeLink: "无效的YouTube链接，无法提取视频ID",
  videoTitleFetchSuccess: "视频标题获取成功",
  videoTitleFetchFailed: "无法获取视频标题，请手动输入",
  fileUploadSuccess: "{{filename}} 上传成功",
  fileUploadFailed: "{{filename}} 上传失败",
  purchasePlans: "购买计划",
  activateWithCode: "激活码",
  manageSubscription: "管理订阅",
  redeemMembershipCode: "兑换会员码",
  enterVerificationCodeBelow: "输入您的验证码以激活会员资格",
  verificationCode: "验证码",
  pleaseEnterVerificationCode: "请输入您的验证码",
  enterVerificationCode: "输入您的验证码",
  activateMembership: "激活会员",
  verificationCodeDescription:
    "如果您从管理员或通过促销活动收到了验证码，可以在此处使用它来激活您的会员权益。",
  currentMembership: "当前会员",
  status: "状态",
  activeRecurring: "活跃（自动续费）",
  active: "活跃",
  expires: "到期时间",
  dictationQuotaExceeded: "听写次数已达上限",
  basicPlanLimitMessage:
    "免费用户每30天可以听写4个视频。您已用完本期配额。订阅任意计划即可享受无限听写。",
  basicPlanQuotaInfo:
    "免费用户：已用 {{used}}/{{limit}} 个视频 ({{startDate}} - {{endDate}})",
  freeUserQuotaHeader: "免费用户配额：{{used}}/{{limit}} 个视频",
  freeUserQuotaRenewal: "您的配额将于 {{endDate}} 重置",
  infiniteVideos: "无限制视频",
  upgradeNow: "立即订阅",
  failedToLoadDictation: "加载听写数据失败",
};

const zhTraditionalTranslations = {
  signIn: "登入",
  signUp: "註冊",
  dictation: "聽寫",
  videoDictation: "視頻聽寫",
  wordDictation: "單詞聽寫",
  collection: "收藏",
  videoCollection: "視頻收藏",
  wordCollection: "單詞收藏",
  fm: "電台",
  videoDictationKeyboardInstructions:
    "按Tab鍵開始聽寫或重複當前語句，按Enter鍵繼續下一個句子。或者在設置中自定義快捷鍵。",
  wordDictationKeyboardInstructions:
    "按Enter鍵提交並驗證答案。再次按Enter鍵獲取下一個單詞。按Tab鍵或點擊卡片重新播放單詞發音",
  inputPlaceHolder: "輸入你聽到的內容",
  completionRate: "完成率",
  accuracyRate: "準確率",
  yourInput: "你的輸入",
  loginSuccessful: "登入成功",
  loginSuccessfulWithGoogle: "Google 登入成功",
  loginFormErrorMessage: "登入失敗，請重試",
  loginFormUsernameOrEmailPrompt: "請輸入電子郵件",
  loginFormPasswordPrompt: "請輸入密碼",
  loginFormSubmitButtonText: "登入",
  registerFormUsernamePrompt: "請輸入用戶名",
  registerFormEmailPrompt: "請輸入電子郵件地址",
  registerFormEmailInvalidPrompt: "請輸入有效的電子郵件地址",
  registerFormPasswordPrompt: "請輸入密碼",
  registerFormPasswordInvalidPrompt: "密碼長度必須至少為6個字符",
  registerFormConfirmPasswordPrompt: "請再次輸入密碼",
  registerFormConfirmPasswordInvalidPrompt: "兩次輸入的密碼不一致",
  registerFormSubmitButtonText: "提交",
  registerFormSuccessMessage: "註冊成功，即將自動登入",
  registerFormErrorMessage: "註冊失敗，請重試",
  loginFailedWithGoogle: "Google 登入失敗，請重試",
  signInWithGoogle: "使用 Google 帳號登入",
  haveAnAccount: "已有帳號？立即登入",
  noAccount: "還沒有帳號？立即註冊",
  chooseAvatar: "選擇頭像",
  loadMore: "加載更多",
  cancel: "取消",
  submit: "提交",
  logoutSuccessful: "登出成功",
  logoutFailed: "登出失敗",
  userProfile: "個人資料",
  logout: "登出",
  login: "登入",
  emailAlreadyExists: "電子郵件已存在",
  emailCheckFailed: "電子郵件檢查失敗",
  progressSaved: "進度已保存",
  progressSaveFailed: "進度保存失敗",
  saveProgressBtnText: "保存進度",
  profile: "個人中心",
  adminPanel: "管理員面板",
  clearCache: "清除緩存",
  dictationCompleted: "聽寫完成",
  startOverOrNot: "你已經完成了這個聽寫。你想從頭開始嗎？",
  dictationCompletedCongratulations: "恭喜！",
  dictationCompletedCongratulationsContent: "你已經完成了這個聽寫練習！",
  missedWordsSummary: "未寫出單詞的概要",
  information: "個人情報",
  dictationProgress: "聽寫的進度",
  homePageDescription: "通過每日聽寫練習提高您的英語聽力和書寫能力。",
  startDictation: "開始聽寫",
  selectAll: "全選",
  filterPrepositions: "移除介詞",
  filterPronouns: "移除代詞",
  filterAuxiliaryVerbs: "移除助動詞",
  filterNumbers: "移除數字",
  filterArticlesAndDeterminers: "移除冠詞和限定詞",
  filterConjunctions: "移除連詞",
  goBack: "返回",
  resetProgress: "重置進度",
  totalDictationTime: "總聽寫時間",
  loading: "加載中...",
  hours: "小時",
  minutes: "分鐘",
  seconds: "秒",
  unauthorized: "未授權。請先登入。",
  comingSoon: "即將推出...",
  markAsCorrect: "標記為正確",
  dictationConfigUpdated: "聽寫配置已更新",
  dictationConfigUpdateFailed: "聽寫配置更新失敗",
  playbackSpeed: "播放速度",
  autoRepeat: "自動重複",
  shortcutKeys: "快捷鍵",
  repeat: "重複",
  next: "下一句",
  prev: "上一句",
  noProgressDataAvailable: "暫無聽寫進度",
  dictationActivities: "聽寫記錄",
  upgradePlan: "升級計劃",
  choosePlanTitle: "聽寫計劃",
  choosePlanDescription: "選擇最適合您的計劃，或通過激活碼激活您的會員資格。",
  freePlan: "免費計劃",
  basicPlan: "基础計劃",
  proPlan: "專業計劃",
  premiumPlan: "高級計劃",
  oneMonth: "1個月",
  threeMonths: "3個月",
  sixMonths: "6個月",
  unlimitedTime: "無限時長",
  notAvailable: "不可用",
  cancelSubscription: "取消訂閱",
  selectPlan: "選擇計劃",
  selectSubscriptionMethod: "選擇訂閱方式",
  clickToPay: "點擊支付",
  autoRenewDescription: "自動續費訂閱，隨時取消",
  onetimeDescription: "一次性購買，不自動續費",
  autoRenew: "自動續費",
  onetimePurchase: "一次性購買",
  email: "電子郵件",
  plan: "聽寫計劃",
  expireTime: "過期時間",
  noLimit: "無限制",
  noData: "無數據",
  noCollectedWords: "暫無單詞收藏。請先開始聽寫來收集單詞",
  wordPreview: "單詞預覽",
  nextPayment: "下次付款",
  wordsDeletedSuccess: "單詞刪除成功",
  wordsDeleteFailed: "單詞刪除失敗",
  missedWordsSaved: "單詞已保存",
  missedWordsSaveFailed: "單詞保存失敗",
  cancelSubscriptionConfirm: "確認取消訂閱",
  cancelSubscriptionWarning: "您确定要取消訂閱嗎？",
  cancelSubscriptionWarning1: "您的訂閱將在當前計費週期結束時取消",
  cancelSubscriptionWarning2: "訂閱結束後，您將失去對當前計劃功能的訪問權限",
  cancelSubscriptionWarning3:
    "您可以在當前計費週期結束後，隨時重新訂閱以恢復訪問權限",
  confirm: "確認",
  cancelling: "取消中...",
  dictationLanguage: "聽寫語言",
  language: "语言",
  languageAutoDetectHint: "自动检测将根据内容猜测语言",
  channelList: "頻道列表",
  allLanguages: "所有語言",
  noChannelsFound: "未找到此語言的頻道。",
  pleaseInputLink: "請輸入視頻鏈接",
  pleaseInputTitle: "請輸入視頻標題",
  videoLink: "YouTube視頻鏈接",
  videoTitle: "視頻標題",
  getSubtitle: "獲取字幕",
  uploadSubtitle: "上傳SRT字幕",
  addVideo: "添加視頻",
  fetchingVideoTitle: "正在獲取視頻標題...",
  invalidYoutubeLink: "無效的YouTube鏈接，無法提取視頻ID",
  videoTitleFetchSuccess: "視頻標題獲取成功",
  videoTitleFetchFailed: "無法獲取視頻標題，請手動輸入",
  fileUploadSuccess: "{{filename}} 上傳成功",
  fileUploadFailed: "{{filename}} 上傳失敗",
  purchasePlans: "購買計劃",
  activateWithCode: "激活碼",
  manageSubscription: "管理訂閱",
  redeemMembershipCode: "兌換會員碼",
  enterVerificationCodeBelow: "輸入您的驗證碼以激活會員資格",
  verificationCode: "認證碼",
  pleaseEnterVerificationCode: "請輸入您的驗證碼",
  enterVerificationCode: "輸入您的驗證碼",
  activateMembership: "激活會員",
  verificationCodeDescription:
    "如果您從管理員或透過促銷活動收到了驗證碼，可以在此處使用它來激活您的會員權益。",
  currentMembership: "當前會員",
  status: "狀態",
  activeRecurring: "活躍（自動續費）",
  active: "活躍",
  expires: "到期時間",
  dictationQuotaExceeded: "聽寫次數已達上限",
  basicPlanLimitMessage:
    "免費用戶每月只能聽寫4個視頻。您已用完本月配額。訂閱任意會員計劃即可享受無限聽寫。",
  basicPlanQuotaInfo:
    "免費用戶：已用 {{used}}/{{limit}} 個視頻 ({{startDate}} - {{endDate}})",
  freeUserQuotaHeader: "免費用戶配額：{{used}}/{{limit}} 個視頻",
  freeUserQuotaRenewal: "您的配額將於 {{endDate}} 重置",
  infiniteVideos: "無限制視頻",
  upgradeNow: "立即訂閱",
  failedToLoadDictation: "加載聽寫數據失敗",
};

const jaTranslations = {
  signIn: "サインイン",
  signUp: "サインアップ",
  dictation: "ディクテーション",
  videoDictation: "ビデオディクテーション",
  wordDictation: "単語ディクテーション",
  collection: "コレクション",
  videoCollection: "ビデオコレクション",
  wordCollection: "単語コレクション",
  fm: "FM",
  videoDictationKeyboardInstructions:
    "Tabキーを押してディクテーションを開始するか現在の文を繰り返し、Enterキーを押して次の文に進みます。または設置中でカスタマイズできます。",
  wordDictationKeyboardInstructions:
    "Enterキーを押して回答を送信し、検証します。もう一度Enterキーを押して次の単語を取得します。Tabキーを押すかカードをクリックして単語の発音を再生します。",
  inputPlaceHolder: "聞いた内容を入力してください",
  completionRate: "完了率",
  accuracyRate: "正確率",
  yourInput: "あなたの入力",
  loginSuccessful: "ログイン成功",
  loginSuccessfulWithGoogle: "Google ログイン成功",
  loginFormErrorMessage: "ログイン失敗、もう一度試してください",
  loginFormUsernameOrEmailPrompt:
    "ユーザー名またはメールアドレスを入力してください",
  loginFormPasswordPrompt: "パスワードを入力してください",
  loginFormSubmitButtonText: "ログイン",
  registerFormUsernamePrompt: "ユーザー名を入力してください",
  registerFormEmailPrompt: "メールアドレスを入力してください",
  registerFormEmailInvalidPrompt:
    "メールアドレスは有効なものを入力してください",
  registerFormPasswordPrompt: "パスワードを入力してください",
  registerFormPasswordInvalidPrompt: "パスワードは6文字以上で入力してください",
  registerFormConfirmPasswordPrompt: "パスワードをもう一度入力してください",
  registerFormConfirmPasswordInvalidPrompt: "入力したパスワードが一致しません",
  registerFormSubmitButtonText: "登録",
  registerFormSuccessMessage: "登録成功、自動的にログインします",
  registerFormErrorMessage: "登録失敗、もう一度試してください",
  loginFailedWithGoogle: "Google ログイン失敗、もう一度試してください",
  signInWithGoogle: "Google アカウントでログイン",
  haveAnAccount: "アカウントをお持ちの方はこちら",
  noAccount: "アカウントをお持ちでない方はこちら",
  chooseAvatar: "アバターを選択",
  loadMore: "もっと見る",
  cancel: "キャンセル",
  logoutSuccessful: "ログアウトに成功しました",
  logoutFailed: "ログアウトに失敗しました",
  userProfile: "ユーザー資料",
  logout: "ログアウト",
  login: "登録",
  emailAlreadyExists: "メールアドレスが既に存在します",
  emailCheckFailed: "メールアドレスの確認に失敗しました",
  progressSaved: "進捗が保存されました",
  progressSaveFailed: "進捗の保存に失敗しました",
  saveProgressBtnText: "進捗を保存",
  profile: "プロフィール",
  adminPanel: "管理パネル",
  clearCache: "キャッシュをクリア",
  dictationCompleted: "聞き取りが完了しました",
  startOverOrNot: "聞き取りをやり直しますか？",
  dictationCompletedCongratulations: "おめでとう！",
  dictationCompletedCongratulationsContent:
    "あなたはこの聞き取りの練習を完了しました！",
  missedWordsSummary: "未写出単語の概要",
  information: "個人情報",
  dictationProgress: "聞き取りの進捗",
  homePageDescription:
    "毎日の聞き取り練習で英語の聞き取りと書き取りの能力を向上させましょう。",
  startDictation: "聞き取りを開始",
  selectAll: "全て選択",
  filterPrepositions: "前置詞を除外",
  filterPronouns: "代名詞を除外",
  filterAuxiliaryVerbs: "助動詞を除外",
  filterNumbers: "数字を除外",
  filterArticlesAndDeterminers: "冠詞と限定詞を除外",
  filterConjunctions: "接続詞を除外",
  goBack: "戻る",
  resetProgress: "進捗をリセット",
  totalDictationTime: "総聴写時間",
  loading: "読み込み中...",
  hours: "時間",
  minutes: "分",
  seconds: "秒",
  unauthorized: "未承認",
  comingSoon: "近日公開...",
  no_videos_available: "利用可能なビデオはありません",
  markAsCorrect: "正しいとしてマーク",
  dictationConfigUpdated: "聴写設定が更新されました",
  dictationConfigUpdateFailed: "聴写設定の更新に失敗しました",
  playbackSpeed: "再生速度",
  autoRepeat: "自動繰り返し",
  shortcutKeys: "ショートカットキー",
  repeat: "繰り返す",
  next: "次へ",
  prev: "前へ",
  noProgressDataAvailable: "聴写進捗はありません",
  upgradePlan: "プランをアップグレード",
  dictationLanguage: "聴写言語",
  language: "言語",
  languageAutoDetectHint: "自動検出はコンテンツに基づいて言語を推測します",
  channelList: "チャンネルリスト",
  allLanguages: "すべての言語",
  noChannelsFound: "この言語のチャンネルは見つかりませんでした。",
  pleaseInputLink: "動画リンクを入力してください",
  pleaseInputTitle: "動画タイトルを入力してください",
  videoLink: "YouTube動画リンク",
  videoTitle: "動画タイトル",
  getSubtitle: "字幕を取得",
  uploadSubtitle: "SRT字幕をアップロード",
  addVideo: "動画を追加",
  fetchingVideoTitle: "動画タイトルを取得中...",
  invalidYoutubeLink: "無効なYouTube リンク、動画IDを抽出できません",
  videoTitleFetchSuccess: "動画タイトルを成功して取得しました",
  videoTitleFetchFailed:
    "動画タイトルを取得できませんでした, 手動で入力してください",
  fileUploadSuccess: "{{filename}} のアップロードに成功しました",
  fileUploadFailed: "{{filename}} のアップロードに失敗しました",
  purchasePlans: "プラン購入",
  activateWithCode: "コードで有効化",
  manageSubscription: "サブスクリプション管理",
  redeemMembershipCode: "メンバーシップコードを引き換える",
  enterVerificationCodeBelow:
    "認証コードを入力してメンバーシップを有効化してください",
  verificationCode: "認証コード",
  pleaseEnterVerificationCode: "認証コードを入力してください",
  enterVerificationCode: "認証コードを入力",
  activateMembership: "メンバーシップを有効化",
  verificationCodeDescription:
    "管理者またはプロモーションを通過して受け取ったコードを使用して、メンバーシップ特典を有効化できます。",
  currentMembership: "現在のメンバーシップ",
  status: "ステータス",
  activeRecurring: "アクティブ（自動更新）",
  active: "アクティブ",
  expires: "有効期限",
  dictationQuotaExceeded: "利用制限に達しました",
  basicPlanLimitMessage:
    "無料ユーザーは月に4つのビデオのみ利用できます。今月の制限に達しました。無制限のディクテーションを楽しむには、任意のプランにご登録ください。",
  basicPlanQuotaInfo:
    "無料ユーザー: {{used}}/{{limit}} ビデオ ({{startDate}} - {{endDate}})",
  freeUserQuotaHeader: "無料ユーザー配分：{{used}}/{{limit}} ビデオ",
  freeUserQuotaRenewal: "配分は {{endDate}} にリセットされます",
  infiniteVideos: "無制限のビデオ",
  upgradeNow: "今すぐ登録",
  failedToLoadDictation: "ディクテーションデータの読み込みに失敗しました",
};

const koTranslations = {
  signIn: "로그인",
  signUp: "회원가입",
  dictation: "받아쓰기",
  videoDictation: "비디오 받아쓰기",
  wordDictation: "단어 받아쓰기",
  collection: "컬렉션",
  videoCollection: "비디오 컬렉션",
  wordCollection: "단어 컬렉션",
  fm: "FM",
  videoDictationKeyboardInstructions:
    "Tab 키를 눌러 받아쓰기를 시작하거나 현재 문장을 반복하고, Enter 키를 눌러 다음 문장으로 계속합니다. 또는 설정에서 단축키를 커스텀할 수 있습니다.",
  wordDictationKeyboardInstructions:
    "Enter 키를 눌러 답변을 제출하고 확인합니다. Enter 키를 다시 눌러 다음 단어를 가져옵니다. Tab 키를 누르거나 카드를 클릭하여 단어 발음을 다시 재생합니다.",
  inputPlaceHolder: "들은 내용을 입력하세요",
  completionRate: "완료율",
  accuracyRate: "정확률",
  yourInput: "입력",
  loginSuccessful: "로그인 성공",
  loginSuccessfulWithGoogle: "Google 로그인 성공",
  loginFormErrorMessage: "로그인 실패, 다시 시도해주세요",
  loginFormUsernameOrEmailPrompt: "사용자 이름 또는 이메일을 입력하세요",
  loginFormPasswordPrompt: "비밀번호를 입력하세요",
  loginFormSubmitButtonText: "로그인",
  registerFormUsernamePrompt: "사용자 이름을 입력하세요",
  registerFormEmailPrompt: "이메일 주소를 입력하세요",
  registerFormEmailInvalidPrompt: "이메일 주소는 유효한 것을 입력하세요",
  registerFormPasswordPrompt: "비밀번호를 입력하세요",
  registerFormPasswordInvalidPrompt: "비밀번호는 6자 이상이어야 합니다",
  registerFormConfirmPasswordPrompt: "비밀번호를 다시 입력하세요",
  registerFormConfirmPasswordInvalidPrompt:
    "입력한 비밀번호가 일치하지 않습니다",
  registerFormSubmitButtonText: "등록",
  registerFormSuccessMessage: "등록 성공, 자동으로 로그인합니다",
  registerFormErrorMessage: "등록 실패, 다시 시도해주세요",
  loginFailedWithGoogle: "Google 로그인 실패, 다시 시도해주세요",
  signInWithGoogle: "Google 계정으로 로그인",
  haveAnAccount: "계정이 있는 경우 여기를 클릭하세요",
  noAccount: "계정이 없는 경우 여기를 클릭하세요",
  chooseAvatar: "아바타를 선택",
  loadMore: "더 보기",
  cancel: "취소",
  logoutSuccessful: "로그아웃에 성공했습니다.",
  logoutFailed: "로그아웃에 실패했습니다",
  userProfile: "사용자 자료",
  logout: "로그아웃",
  login: "로그인",
  emailAlreadyExists: "이메일이 이미 존재합니다",
  emailCheckFailed: "이메일 확인에 실패했습니다",
  progressSaved: "진행 상황이 저장되었습니다",
  progressSaveFailed: "진행 상황 저장에 실패했습니다",
  saveProgressBtnText: "진행 상황 저장",
  profile: "프로필",
  adminPanel: "관리자 패널",
  clearCache: "캐시 클리어",
  dictationCompleted: "듣기 완료",
  startOverOrNot: "듣기를 다시 시작하시겠습니까？",
  dictationCompletedCongratulations: "축하합니다！",
  dictationCompletedCongratulationsContent:
    "축하합니다！ 이 듣기 연습을 완료했습니다！",
  missedWordsSummary: "미완료 단어 요약",
  information: "개인 정보",
  dictationProgress: "듣기 진행 상황",
  homePageDescription:
    "매일 듣기 연습을 통해 영어 듣기와 쓰기 능력을 향상하세요.",
  startDictation: "듣기 시작",
  selectAll: "전체 선택",
  filterPrepositions: "전치사 제외",
  filterPronouns: "대명사 제외",
  filterAuxiliaryVerbs: "보조 동사 제외",
  filterNumbers: "숫자 제외",
  filterArticlesAndDeterminers: "관사와 한정사 제외",
  filterConjunctions: "접속사 제외",
  goBack: "뒤로가기",
  resetProgress: "진행 상황 초기화",
  totalDictationTime: "총 듣기 시간",
  loading: "로딩중...",
  hours: "시간",
  minutes: "분",
  seconds: "초",
  unauthorized: "미승인",
  comingSoon: "준비중...",
  markAsCorrect: "정확하다고 표시",
  dictationConfigUpdated: "듣기 설정이 업데이트되었습니다",
  dictationConfigUpdateFailed: "듣기 설정 업데이트에 실패했습니다",
  playbackSpeed: "재생 속도",
  autoRepeat: "자동 반복",
  shortcutKeys: "단축키",
  repeat: "반복",
  next: "다음",
  prev: "이전",
  noProgressDataAvailable: "듣기 진행 상황이 없습니다",
  upgradePlan: "플랜 업그레이드",
  dictationLanguage: "듣기 언어",
  language: "언어",
  languageAutoDetectHint: "자동 감지는 내용을 기반으로 언어를 추측합니다",
  channelList: "채널 목록",
  allLanguages: "모든 언어",
  noChannelsFound: "이 언어에 대한 채널을 찾을 수 없습니다.",
  pleaseInputLink: "동영상 링크를 입력하세요",
  pleaseInputTitle: "동영상 제목을 입력하세요",
  videoLink: "YouTube 동영상 링크",
  videoTitle: "동영상 제목",
  getSubtitle: "자막 가져오기",
  uploadSubtitle: "SRT 자막 업로드",
  addVideo: "동영상 추가",
  fetchingVideoTitle: "동영상 제목을 가져오는 중...",
  invalidYoutubeLink:
    "유효하지 않은 YouTube 링크, 동영상 ID를 추출할 수 없습니다",
  videoTitleFetchSuccess: "동영상 제목을 성공적으로 가져왔습니다",
  videoTitleFetchFailed:
    "동영상 제목을 가져오지 못했습니다, 수동으로 입력해주세요",
  fileUploadSuccess: "{{filename}} 업로드 성공",
  fileUploadFailed: "{{filename}} 업로드 실패",
  purchasePlans: "플랜 구매",
  activateWithCode: "코드로 활성화",
  manageSubscription: "구독 관리",
  redeemMembershipCode: "멤버십 코드 사용",
  enterVerificationCodeBelow: "인증 코드를 입력하여 멤버십을 활성화하세요",
  verificationCode: "인증 코드",
  pleaseEnterVerificationCode: "인증 코드를 입력해주세요",
  enterVerificationCode: "인증 코드 입력",
  activateMembership: "멤버십 활성화",
  verificationCodeDescription:
    "관리자 또는 프로모션을 통해 받은 코드를 사용하여 멤버십 혜택을 활성화할 수 있습니다.",
  currentMembership: "현재 멤버십",
  status: "상태",
  activeRecurring: "활성 (자동 갱신)",
  active: "활성",
  expires: "만료일",
  dictationQuotaExceeded: "받아쓰기 제한 도달",
  basicPlanLimitMessage:
    "무료 사용자는 한 달에 4개의 동영상만 받아쓰기할 수 있습니다. 이번 달 할당량을 모두 사용했습니다. 무제한 받아쓰기를 즐기려면 플랜에 가입하세요.",
  basicPlanQuotaInfo:
    "무료 사용자: {{used}}/{{limit}} 동영상 ({{startDate}} - {{endDate}})",
  freeUserQuotaHeader: "무료 사용자 할당량: {{used}}/{{limit}} 동영상",
  freeUserQuotaRenewal: "할당량은 {{endDate}}에 재설정됩니다",
  infiniteVideos: "무제한 동영상",
  upgradeNow: "지금 구독하기",
  failedToLoadDictation: "받아쓰기 데이터 로드 실패",
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    zh: { translation: zhTranslations },
    zhTraditional: { translation: zhTraditionalTranslations },
    ja: { translation: jaTranslations },
    ko: { translation: koTranslations },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
