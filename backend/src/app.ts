import cookieParser from 'cookie-parser';
import compression from 'compression';
import { authRouter } from './modules/auth/auth.routes.js';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { routes } from './routes.js';
import { prisma } from './lib/prisma.js';
import { createSampleImportRouter } from './modules/samples/sample-import.routes.js';
import { createSamplesAdminRouter } from './modules/samples/samples.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { serverTiming } from './middleware/server-timing.js';

export const app = express();
app.disable('x-powered-by');
app.use(serverTiming);
app.use(compression({ threshold: 1024 }));
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(cookieParser());
// Both sample writers check ADMIN before reading their route-specific bodies.
app.use('/api/admin/samples/import', createSampleImportRouter(prisma));
app.use('/api/admin/samples', createSamplesAdminRouter(prisma));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRouter);
app.use('/api', routes);
app.use((_req, res) => { res.status(404).json({ message: 'Không tìm thấy API.' }); });
app.use(errorHandler);
