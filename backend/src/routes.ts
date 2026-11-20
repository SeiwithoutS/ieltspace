import { Router } from 'express';
import { prisma } from './lib/prisma.js';
import { createVocabularyAdminRouter, createVocabularyLibraryRouter } from './modules/vocabulary/vocabulary.routes.js';
import { vocabularyMediaRouter } from './modules/vocabulary/media.routes.js';
import { adminExamsRouter } from './modules/exams/exams.admin.routes.js';
import { publicExamsRouter } from './modules/exams/exams.public.routes.js';
import { createSamplesPublicRouter } from './modules/samples/samples.routes.js';
import { createLearnerStudyRouter } from './modules/learner/study.routes.js';
import { adminUsersRouter } from './modules/users/admin-users.routes.js';
import { adminStatisticsRouter } from './modules/statistics/admin-statistics.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { announcementAdminRouter } from './modules/notifications/announcement-admin.routes.js';
import { adminSupportRouter, supportRouter } from './modules/support/support.routes.js';

export const routes = Router();
routes.use('/learner', createLearnerStudyRouter());
routes.use('/samples', createSamplesPublicRouter(prisma));
routes.use('/vocabulary/sets', createVocabularyLibraryRouter(prisma));
routes.use('/admin/vocabulary/sets', createVocabularyAdminRouter(prisma));
routes.use('/admin/vocabulary/media', vocabularyMediaRouter);

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ieltspace-backend' });
});

routes.use('/admin/users', adminUsersRouter);
routes.use('/admin/statistics', adminStatisticsRouter);
routes.use('/notifications', notificationsRouter);
routes.use('/admin/notifications', announcementAdminRouter);
routes.use('/support/reports', supportRouter);
routes.use('/admin/support/reports', adminSupportRouter);
routes.use('/admin', adminExamsRouter);
routes.use('/exam-sets', publicExamsRouter);
