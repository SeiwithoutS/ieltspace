import { Router } from 'express';
import { adminExamsRouter } from './modules/exams/exams.admin.routes.js';
import { publicExamsRouter } from './modules/exams/exams.public.routes.js';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ieltspace-backend' });
});

routes.use('/admin', adminExamsRouter);
routes.use('/exam-sets', publicExamsRouter);
