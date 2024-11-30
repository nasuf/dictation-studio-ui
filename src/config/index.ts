interface Config {
  UI_HOST: string;
  SERVICE_HOST: string;
  SERVICE_PATH: string;
}

const configs: Record<string, Config> = {
  development: {
    UI_HOST: "http://localhost:5173",
    SERVICE_HOST: "http://localhost:4001",
    SERVICE_PATH: "/dictation-studio",
  },
  production: {
    UI_HOST: "https://www.dictationstudio.com",
    SERVICE_HOST: "https://www.dictationstudio.com",
    SERVICE_PATH: "/ds",
  },
};

const env = import.meta.env.MODE || "development";
export const config = configs[env];

if (!config) {
  throw new Error(`No config found for environment: ${env}`);
}

export default config;
