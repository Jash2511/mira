import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import orgRoutes from './routes/organization.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
// If CLIENT_ORIGIN is not provided, allow same-origin (and any) which is fine on Vercel since API is same domain
app.use(cors({ origin: CLIENT_ORIGIN ? [CLIENT_ORIGIN] : true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mira-Ex-Jira API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

export default app;
