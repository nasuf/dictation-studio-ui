interface Config {
  UI_HOST: string;
  SERVICE_HOST: string;
  SERVICE_PATH: string;
  APP_NAME: string;
  DEBUG: boolean;
  API_TIMEOUT: number;
}

const configs: Record<string, Config> = {
  development: {
    UI_HOST: "http://localhost:5173",
    SERVICE_HOST: "http://localhost:4001",
    SERVICE_PATH: "/dictation-studio",
    APP_NAME: import.meta.env.VITE_APP_NAME || "Dictation Studio (Dev)",
    DEBUG: import.meta.env.VITE_DEBUG === "true",
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "20000"),
  },
  production: {
    UI_HOST: "https://www.dictationstudio.com",
    SERVICE_HOST: "https://www.dictationstudio.com",
    SERVICE_PATH: "/ds",
    APP_NAME: import.meta.env.VITE_APP_NAME || "Dictation Studio",
    DEBUG: import.meta.env.VITE_DEBUG === "true",
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "20000"),
  },
};

// 优先级：VITE_APP_ENV > import.meta.env.MODE > "production"
const env =
  import.meta.env.VITE_APP_ENV || import.meta.env.MODE || "production";
export const config = configs[env];

if (!config) {
  throw new Error(`No config found for environment: ${env}`);
}

// 在开发模式下打印当前环境信息
if (import.meta.env.DEV) {
  console.log(`🚀 Current environment: ${env}`);
  console.log(`📱 App name: ${config.APP_NAME}`);
  console.log(`📡 Service host: ${config.SERVICE_HOST}`);
  console.log(`🐛 Debug mode: ${config.DEBUG}`);
  console.log(`⏱️ API timeout: ${config.API_TIMEOUT}ms`);
}

export default config;
