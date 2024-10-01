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
    "Press Tab to start dictation or repeat the current sentence, press Enter to continue to the next sentence",
  wordDictationKeyboardInstructions:
    "Press Enter to submit and validate the answer. Press Enter again to get the next word. Press Tab or click the card to replay the word pronunciation.",
  inputPlaceHolder: "Enter what you hear",
  completionRate: "Completion Rate",
  accuracyRate: "Accuracy Rate",
  yourInput: "Your Input",
  loginSuccessful: "Login successful",
  loginFormErrorMessage: "Login failed, please try again",
  loginFormUsernameOrEmailPrompt: "Please enter your username or email",
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
    "按Tab键开始听写或重复当前语句，按Enter键继续下一句话",
  wordDictationKeyboardInstructions:
    "按Enter键提交并验证答案。再次按Enter键获取下一个单词。按Tab键或点击卡片重新播放单词发音",
  inputPlaceHolder: "输入你听到的内容",
  completionRate: "完成率",
  accuracyRate: "准确率",
  yourInput: "你的输入",
  loginSuccessful: "登录成功",
  loginSuccessfulWithGoogle: "Google 登录成功",
  loginFormErrorMessage: "登录失败，请重试",
  loginFormUsernameOrEmailPrompt: "请输入用户名或邮箱",
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
    "Tabキーを押してディクテーションを開始するか現在の文を繰り返し、Enterキーを押して次の文に進みます",
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
    "Tab 키를 눌러 받아쓰기를 시작하거나 현재 문장을 반복하고, Enter 키를 눌러 다음 문장으로 계속합니다",
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
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    zh: { translation: zhTranslations },
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
