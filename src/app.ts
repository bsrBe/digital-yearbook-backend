import express from 'express';
import cors from 'cors';
import {
  authRoutes,
  userRoutes,
  friendRoutes,
  chatRoutes,
  signatureRoutes,
  memoryRoutes,
  highlightRoutes,
} from './routes';
import { errorHandler, notFound } from './middleware';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'YearbookPro API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/highlights', highlightRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
