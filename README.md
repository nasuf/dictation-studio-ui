# Dictation Studio Frontend Development Guide

## 📋 Project Overview

### Introduction

Dictation Studio is an English listening and dictation practice platform based on YouTube videos. The frontend provides an interactive user interface that helps users improve their English listening and spelling skills through video subtitle-based dictation exercises.

### Core Features

- 🎥 YouTube video playback with synchronized subtitles
- 👤 User authentication and progress management
- 💳 Subscription and quota management interface
- 📊 Learning statistics and missed word collection
- 🌐 Multi-language support and dark mode
- 🔧 Admin dashboard and content management

### Frontend Architecture

```
Frontend (React 18 + TypeScript)
├── UI Layer: Ant Design + Tailwind CSS
├── State Management: Redux Toolkit
├── Routing: React Router
├── HTTP Client: Axios
├── Build Tool: Vite
├── Authentication: JWT + Google OAuth
└── Internationalization: i18next
```

---

## 🎨 Technology Stack Analysis

### Core Dependencies

```json
{
  "react": "^18.3.1",
  "typescript": "^5.5.3",
  "@reduxjs/toolkit": "^2.2.7",
  "antd": "^5.20.6",
  "axios": "^1.7.7",
  "react-router-dom": "^6.26.2",
  "react-i18next": "^15.0.2",
  "tailwindcss": "^3.4.13"
}
```

### Build and Development Tools

- **Vite**: Modern build tool with hot reload and fast builds
- **TypeScript**: Type safety and better development experience
- **ESLint**: Code quality checking
- **Tailwind CSS**: Atomic CSS framework

---

## 📁 Project Structure

```
src/
├── components/          # Component directory
│   ├── dictation/      # Dictation feature components
│   │   ├── video/      # Video playback related
│   │   ├── word/       # Word practice related
│   │   └── radio/      # Audio practice related
│   ├── admin/          # Admin dashboard components
│   ├── profile/        # User profile components
│   ├── Header.tsx      # Top navigation
│   ├── Content.tsx     # Main content area
│   ├── Sider.tsx       # Sidebar
│   └── LoginModal.tsx  # Login modal
├── redux/              # State management
│   ├── store.ts        # Store configuration
│   ├── userSlice.ts    # User state
│   └── navigationSlice.ts # Navigation state
├── api/                # API interfaces
│   └── api.ts          # Unified API wrapper
├── utils/              # Utility functions
│   ├── type.ts         # TypeScript type definitions
│   ├── const.ts        # Constants
│   ├── i18n.ts         # Internationalization config
│   ├── languageUtils.ts # Language processing tools
│   └── util.ts         # Common utility functions
├── config/             # Configuration files
├── hooks/              # Custom Hooks
├── lib/                # Third-party library configs
├── assets/             # Static resources
└── App.tsx             # Root component
```

---

## 🚀 Core Feature Modules

### VideoMain Component (Dictation Module)

**Core Features:**

- YouTube video playback with subtitle synchronization
- Real-time dictation input and scoring
- Auto-save and progress restoration
- Multiple playback modes and shortcuts
- Intelligent word matching algorithm

**Key Component Structure:**

```typescript
interface VideoMainProps {
  onComplete: () => void;
}

const VideoMain: React.ForwardRefRenderFunction<
  VideoMainRef,
  VideoMainProps
> = ({ onComplete }, ref) => {
  // State management
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [revealedSentences, setRevealedSentences] = useState<number[]>([]);

  // YouTube player control
  const playerRef = useRef<YouTubePlayer | null>(null);

  // Quota check and user permissions
  const [quotaInfo, setQuotaInfo] = useState<QuotaResponse | null>(null);

  // Auto-save mechanism
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());
};
```

**Core Implementation:**

1. **Video Transcript Fetching:**

```typescript
const fetchData = async () => {
  // Check user quota
  const quotaData = await checkQuota();
  if (!quotaData.canProceed) {
    handleQuotaExceeded(quotaData);
    return;
  }

  // Fetch video transcript and user progress
  const [transcriptResponse, progressResponse] = await Promise.all([
    api.getVideoTranscript(channelId!, videoId!),
    api.getUserProgress(channelId!, videoId!),
  ]);

  setTranscript(transcriptResponse.data.transcript);
  setVideoTitle(transcriptResponse.data.title);

  // Restore user progress
  if (progressResponse.data && progressResponse.data.userInput) {
    restoreUserProgress(
      progressResponse.data,
      transcriptResponse.data.transcript
    );
  }
};
```

2. **Intelligent Word Matching Algorithm:**

```typescript
const compareInputWithTranscript = (input: string, transcript: string) => {
  const language = detectLanguage(transcript);
  const cleanedInput = cleanString(input, language);
  const cleanedTranscript = cleanString(transcript, language);

  const inputWords = splitWords(cleanedInput, language);
  const transcriptWords = splitWords(cleanedTranscript, language);

  // Use similarity matching for CJK languages
  if (["zh", "ja", "ko"].includes(language)) {
    const similarityThreshold = word.length === 1 ? 0.6 : 0.8;
    const similarity = calculateSimilarity(word, transcriptWord);
    return similarity > similarityThreshold;
  }

  // Use exact matching for English
  return inputWords.includes(transcriptWord);
};
```

3. **Auto-Save Mechanism:**

```typescript
// Timed auto-save (30-second interval)
useEffect(() => {
  const autoSaveInterval = setInterval(() => {
    if (hasUnsavedChanges && !isSavingProgress) {
      saveProgress(true); // Silent save
    }
  }, 30000);
  return () => clearInterval(autoSaveInterval);
}, [hasUnsavedChanges]);

// User activity triggered save (after 5 seconds)
useEffect(() => {
  if (isUserTyping) {
    const activitySaveTimer = setTimeout(() => {
      if (hasUnsavedChanges && !isSavingProgress) {
        saveProgress(true);
      }
    }, 5000);
    return () => clearTimeout(activitySaveTimer);
  }
}, [isUserTyping, hasUnsavedChanges]);
```

### User Authentication Module

**Multiple Login Methods Support:**

- Google OAuth 2.0
- Email registration/login
- Supabase authentication integration

**Authentication Flow:**

```typescript
// Google OAuth login
const handleGoogleLogin = async (tokenResponse: any) => {
  const userInfo = {
    email: userMetadata.email,
    avatar: userMetadata.avatar_url,
    username: userMetadata.full_name,
  };

  const response = await api.updateUserInfo(userInfo);
  if (response.status === 200) {
    dispatch(setUser(response.data.user));
  }
};

// JWT Token management
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem(JWT_ACCESS_TOKEN_KEY);
  if (accessToken) {
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;

    // Auto-refresh token when about to expire
    if (decodedToken.exp && decodedToken.exp - currentTime < 600) {
      const newToken = await refreshToken();
      config.headers["Authorization"] = `Bearer ${newToken}`;
    }
  }
  return config;
});
```

### State Management (Redux Toolkit)

**Store Configuration:**

```typescript
export const store = configureStore({
  reducer: {
    user: userReducer,
    navigation: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**User State Slice:**

```typescript
interface UserState {
  userInfo: UserInfo | null;
  isLoginModalVisible: boolean;
  isDictationStarted: boolean;
  repeatCount: number;
  isSavingProgress: boolean;
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
    },
    setDictationAutoRepeat: (state, action) => {
      if (state.userInfo?.dictation_config) {
        state.userInfo.dictation_config.auto_repeat = action.payload;
      }
    },
    // ...other reducers
  },
});
```

---

## 🎯 Component Design Patterns

### Custom Hooks Usage

```typescript
// Auto-save Hook
const useAutoSave = (data: any, interval: number = 30000) => {
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (data && !isSaving) {
        setIsSaving(true);
        await saveData(data);
        setIsSaving(false);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [data, interval, isSaving]);

  return { isSaving };
};
```

### Component Communication Patterns

- **Parent-Child Components**: Props passing and callback functions
- **Cross-Component**: Redux global state management
- **Sibling Components**: Through common parent component or Redux state

---

## 🎨 User Interface Design

### Dark Mode Implementation

```typescript
const [isDarkMode, setIsDarkMode] = useState(() => {
  const savedMode = localStorage.getItem("darkMode");
  return savedMode ? JSON.parse(savedMode) : false;
});

useEffect(() => {
  localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [isDarkMode]);
```

### Internationalization Support

```typescript
// i18n configuration
const resources = {
  en: { translation: enTranslations },
  zh: { translation: zhTranslations },
  ja: { translation: jaTranslations },
  ko: { translation: koTranslations },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
```

---

## 🔗 API Integration

### API Client Wrapper

```typescript
// axios instance configuration
const axiosInstance = axios.create({
  baseURL: `${SERVICE_BASE_URL}`,
});

// Request interceptor - JWT Token auto-addition
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem(JWT_ACCESS_TOKEN_KEY);
  if (accessToken) {
    // Auto-refresh token when about to expire
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp - currentTime < 600) {
      const newToken = await refreshToken();
      config.headers["Authorization"] = `Bearer ${newToken}`;
    } else {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Response interceptor - Token auto-update
axiosInstance.interceptors.response.use((response) => {
  const access_token = response.headers["x-ds-access-token"];
  const refresh_token = response.headers["x-ds-refresh-token"];
  if (access_token) {
    localStorage.setItem(JWT_ACCESS_TOKEN_KEY, access_token);
  }
  if (refresh_token) {
    localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refresh_token);
  }
  return response;
});
```

### Error Handling Strategy

```typescript
// Unified error handling
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem(JWT_ACCESS_TOKEN_KEY);
    localStorage.removeItem(JWT_REFRESH_TOKEN_KEY);
    window.location.href = "/login";
  } else if (error.response?.status >= 500) {
    // Server error
    message.error("Server error, please try again later");
  } else {
    // Other errors
    message.error(error.response?.data?.error || "Request failed");
  }
};
```

---

## 🔌 Third-Party Service Integration

### Google OAuth 2.0 Integration

```typescript
// Google login in React component
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const LoginModal = () => {
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // Send Google token to backend for verification
      const response = await api.googleLogin(credentialResponse.credential);
      if (response.status === 200) {
        dispatch(setUser(response.data));
        message.success("Login successful");
      }
    } catch (error) {
      message.error("Google login failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => message.error("Google login failed")}
      />
    </GoogleOAuthProvider>
  );
};
```

---

## 🚀 Development Environment Setup

### Frontend Environment

```bash
# Install dependencies
cd dictation-studio-ui
npm install

# Start development server
npm run dev

# Build production version
npm run build
```

### Environment Variables Configuration

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SERVICE_PATH=/dictation-studio

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🐳 Docker Deployment

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

### Production Deployment

```bash
# Build production image
docker build -t dictation-studio-ui .

# Run container
docker run -p 5173:5173 -e VITE_API_URL=https://your-api-domain.com dictation-studio-ui
```

---

## 📖 Development Guidelines

### Code Standards

#### TypeScript/React Standards

```typescript
// Component naming: PascalCase
export const VideoMain: React.FC<Props> = ({ onComplete }) => {
  // Hooks at the top of component
  const [state, setState] = useState<Type>(initialValue);
  const { t } = useTranslation();

  // Event handlers: start with handle
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // Side effects before render logic
  useEffect(() => {
    // Side effect logic
  }, [dependencies]);

  return <div className="container">{/* JSX content */}</div>;
};
```

### New Feature Development Flow

#### 1. Requirements Analysis and Design

- Define feature requirements and user scenarios
- Design component structure and interaction logic
- Plan state management integration

#### 2. Frontend Feature Development

```typescript
// 1. Add API interface
export const api = {
  newFeature: (data: NewFeatureData) =>
    axiosInstance.post("/user/new-feature", data),
};

// 2. Create component
const NewFeatureComponent: React.FC = () => {
  // Component logic
  return <div>New Feature</div>;
};

// 3. Add routing
<Route path="/new-feature" element={<NewFeatureComponent />} />;

// 4. Update state management (if needed)
const newFeatureSlice = createSlice({
  name: "newFeature",
  initialState,
  reducers: {
    // reducers
  },
});
```

### Testing Strategy

#### Frontend Testing

```typescript
// Component testing
import { render, screen } from "@testing-library/react";
import { VideoMain } from "./VideoMain";

test("renders video player", () => {
  render(<VideoMain onComplete={jest.fn()} />);
  const player = screen.getByTestId("video-player");
  expect(player).toBeInTheDocument();
});

// API testing
import { api } from "../api/api";

test("fetches user progress", async () => {
  const mockData = { progress: 50 };
  jest.spyOn(api, "getUserProgress").mockResolvedValue(mockData);

  const result = await api.getUserProgress("channel1", "video1");
  expect(result).toEqual(mockData);
});
```

---

## 🐛 Common Issues and Solutions

### Issue 1: JWT Token Auto-Refresh

**Problem**: API calls fail due to token expiration

**Solution**: Check token expiration time in request interceptor

```typescript
axiosInstance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem(JWT_ACCESS_TOKEN_KEY);
  if (token) {
    const decoded = jwtDecode(token);
    // Refresh token 10 minutes before expiration
    if (decoded.exp - Date.now() / 1000 < 600) {
      await refreshToken();
    }
  }
  return config;
});
```

### Issue 2: User Progress Loss

**Problem**: Progress not saved when user closes page

**Solution**: Implement multi-layer auto-save mechanism

```typescript
// Timed save
useEffect(() => {
  const timer = setInterval(saveProgress, 30000);
  return () => clearInterval(timer);
}, []);

// Save on page leave
useEffect(() => {
  const handleBeforeUnload = () => saveProgress();
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, []);

// Save on user activity
useEffect(() => {
  if (hasChanges) {
    const timer = setTimeout(saveProgress, 5000);
    return () => clearTimeout(timer);
  }
}, [userInput, hasChanges]);
```

### Issue 3: State Management Performance

**Problem**: Unnecessary re-renders causing performance issues

**Solution**: Optimize Redux selectors and use memoization

```typescript
// Use createSelector for complex state derivations
const selectUserProgress = createSelector(
  [(state: RootState) => state.user.progress],
  (progress) => computeComplexProgress(progress)
);

// Memoize expensive components
const ExpensiveComponent = React.memo(
  ({ data }: Props) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

---

## 🎯 Summary

The Dictation Studio frontend is built with modern React ecosystem providing:

### Technical Highlights

- **React 18 + TypeScript**: Type safety and excellent development experience
- **Redux Toolkit**: Efficient state management
- **Vite**: Fast build and development
- **Ant Design + Tailwind**: Beautiful and responsive UI
- **i18next**: Comprehensive internationalization

### Core Features

- 🎥 Interactive video dictation interface
- 📊 Real-time progress tracking
- 🔐 Secure authentication system
- 🌐 Multi-language support
- 🎨 Dark mode and accessibility

### Architecture Benefits

- **Component-based**: Modular and reusable design
- **Type-safe**: Comprehensive TypeScript integration
- **Performance**: Optimized rendering and state management
- **Maintainable**: Clear structure and separation of concerns

This frontend demonstrates modern React application best practices with clean code structure, comprehensive functionality, and excellent developer experience.
