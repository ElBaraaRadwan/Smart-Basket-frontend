const env = process.env.NODE_ENV || "development";

interface Config {
  API_URL: string;
  WS_URL: string;
}

const config: Record<string, Config> = {
  development: {
    API_URL: process.env.VITE_API_URL || "http://localhost:3000/graphql",
    WS_URL: process.env.VITE_WS_URL || "ws://localhost:3000/ws",
  },
  production: {
    API_URL: process.env.VITE_API_URL || "https://api.yourapp.com/graphql",
    WS_URL: process.env.VITE_WS_URL || "wss://api.yourapp.com/ws",
  },
  test: {
    API_URL: "http://localhost:3000/graphql",
    WS_URL: "ws://localhost:3000/ws",
  },
};

export default config[env];
