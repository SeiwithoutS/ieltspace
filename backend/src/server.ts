import { app } from './app.js';
import { env } from './config/env.js';
const server = app.listen(env.port, () => {
  console.log(`Backend: http://localhost:${env.port}/api`);
});
let closing = false;
const shutdown = () => {
  if (closing) return;
  closing = true;
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
