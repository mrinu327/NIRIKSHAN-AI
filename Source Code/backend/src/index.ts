import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config';

// Routes
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import projectRoutes from './routes/projectRoutes';
import cameraRoutes from './routes/cameraRoutes';
import anomalyRoutes from './routes/anomalyRoutes';
import inspectionRoutes from './routes/inspectionRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import videoVerificationRoutes from './routes/videoVerificationRoutes';
import auditRoutes from './routes/auditRoutes';

export const prisma = new PrismaClient();

const app = express();

// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// ===============================
// Health Check
// ===============================

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

// ===============================
// API Information
// ===============================

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
      attendance: '/api/attendance',
      videoVerification: '/api/video-verification',
      auditLogs: '/api/audit-logs',
    },
  });
});

// ===============================
// API Routes
// ===============================

// Authentication
app.use('/api/auth', authRoutes);

// Dashboard
app.use('/api/dashboard', dashboardRoutes);

// Projects
app.use('/api/projects', projectRoutes);

// CCTV Cameras
app.use('/api/cameras', cameraRoutes);

// Anomalies
app.use('/api/anomalies', anomalyRoutes);

// Inspections
app.use('/api/inspections', inspectionRoutes);

// Attendance
app.use('/api/attendance', attendanceRoutes);

// Video Verification
app.use('/api/video-verification', videoVerificationRoutes);

// Audit Logs
app.use('/api/audit-logs', auditRoutes);

// ===============================
// 404 Handler
// ===============================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found on NIRIKSHAN AI server',
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error('Unhandled server error:', err);

    res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || 'Unexpected error occurred',
    });
  }
);

// ===============================
// Start Server
// ===============================

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log('====================================================');
    console.log(
      `🚀 NIRIKSHAN AI Backend running on port ${config.port}`
    );
    console.log(
      `📡 Health endpoint: http://localhost:${config.port}/health`
    );
    console.log(
      `🧠 API Spec: http://localhost:${config.port}/api`
    );
    console.log(
      `🔐 Login endpoint: http://localhost:${config.port}/api/auth/login`
    );
    console.log('====================================================');
  });
}

export default app;