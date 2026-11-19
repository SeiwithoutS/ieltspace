import { Router } from 'express';
import { prisma } from './lib/prisma.js';
import { createVocabularyAdminRouter, createVocabularyLibraryRouter } from './modules/vocabulary/vocabulary.routes.js';
import { vocabularyMediaRouter } from './modules/vocabulary/media.routes.js';
import { adminExamsRouter } from './modules/exams/exams.admin.routes.js';
import { publicExamsRouter } from './modules/exams/exams.public.routes.js';
import { createSamplesPublicRouter } from './modules/samples/samples.routes.js';

export const routes = Router();
routes.use('/samples', createSamplesPublicRouter(prisma));
routes.use('/vocabulary/sets', createVocabularyLibraryRouter(prisma));
routes.use('/admin/vocabulary/sets', createVocabularyAdminRouter(prisma));
routes.use('/admin/vocabulary/media', vocabularyMediaRouter);

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ieltspace-backend' });
});

routes.use('/admin', adminExamsRouter);
routes.use('/exam-sets', publicExamsRouter);
