import { env as config } from '../config.js';
export const env = {port: config.PORT, nodeEnv: config.NODE_ENV, frontendUrl: config.FRONTEND_ORIGIN};
