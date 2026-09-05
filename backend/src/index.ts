import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config';

export const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    res.status(200).json({
      status: 'HEALTHY',
      service: 'NIRIKSHAN-AI-BACKEND',
      version: '1.0.0',
      database: 'CONNECTED',
      stats: {
        users: userCount,
        projects: projectCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'UNHEALTHY',
      database: 'DISCONNECTED',
      error: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});

// Root API information
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'NIRIKSHAN AI API',
    tagline: 'Monitor. Verify. Act.',
    description: 'Centralized DoSJE Monitoring & Surprise Inspection API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      projects: '/api/projects',
      cameras: '/api/cameras',
      inspections: '/api/inspections',
      anomalies: '/api/anomalies',
      videoVerification: '/api/video-verification',
      auditLogs: '/api/audit-logs',
    },
  });
});

// API Routes
import dashboardRoutes from './routes/dashboardRoutes';
import projectRoutes from './routes/projectRoutes';
import cameraRoutes from './routes/cameraRoutes';
import anomalyRoutes from './routes/anomalyRoutes';

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/anomalies', anomalyRoutes);

// Global 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found on NIRIKSHAN AI server' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'Unexpected error occurred',
  });
});

// Start listening if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 NIRIKSHAN AI Backend running on port ${config.port}`);
    console.log(`📡 Health endpoint: http://localhost:${config.port}/health`);
    console.log(`🧭 API Spec: http://localhost:${config.port}/api`);
    console.log(`====================================================`);
  });
}

export default app;
