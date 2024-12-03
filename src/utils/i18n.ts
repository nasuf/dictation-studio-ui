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
    "Improve your English listening with daily dictation exercises.",
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
  configSaved: "Config saved",
  configSaveFailed: "Config save failed",
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
  configSaved: "配置已保存",
  configSaveFailed: "配置保存失败",
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
  configSaved: "配置已保存",
  configSaveFailed: "配置保存失敗",
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
  configSaved: "設定が保存されました",
  configSaveFailed: "設定の保存に失敗しました",
  playbackSpeed: "再生速度",
  autoRepeat: "自動繰り返し",
  shortcutKeys: "ショートカットキー",
  repeat: "繰り返す",
  next: "次へ",
  prev: "前へ",
  noProgressDataAvailable: "聴写進捗はありません",
  upgradePlan: "プランをアップグレード",
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
  configSaved: "설정이 저장되었습니다",
  configSaveFailed: "설정 저장에 실패했습니다",
  playbackSpeed: "재생 속도",
  autoRepeat: "자동 반복",
  shortcutKeys: "단축키",
  repeat: "반복",
  next: "다음",
  prev: "이전",
  noProgressDataAvailable: "듣기 진행 상황이 없습니다",
  upgradePlan: "플랜 업그레이드",
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
