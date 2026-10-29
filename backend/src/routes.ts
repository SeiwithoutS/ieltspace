import { Router } from 'express';
export const routes = Router();
routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ieltspace-backend' });
});
// Gắn route của từng module tại đây khi triển khai nghiệp vụ.
// routes.use('/exams', examRoutes);
