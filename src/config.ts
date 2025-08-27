interface FeatureFlags {
  enableReporting: boolean;
  enableAnalytics: boolean;
}

interface Endpoints {
  todos: string;
  reports: string;
}

interface Config {
  environment: string;
  releaseType: string;
  features: FeatureFlags;
  endpoints: Endpoints;
}

const config: Config = {
  // Environment
  environment: process.env.NODE_ENV || 'development',
  releaseType: process.env.RELEASE_TYPE || 'edge',

  // Feature flags
  features: {
    enableReporting: process.env.ENABLE_REPORTING === 'true' || true,
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true' || false
  },

  // API endpoints
  endpoints: {
    todos: '/api/todos',
    reports: '/api/reports'
  }
};

export default config;
