import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './db';
import { seedInitialQuestions } from './services/SeedData';
import { setupSocketHandlers } from './sockets';
import routes from './routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins during college LAN / mobile wifi connectivity
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// REST API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Spot The Errors Realtime Server'
  });
});

// Setup Socket.IO real-time handlers
setupSocketHandlers(io);

// Bootstrap
async function startServer() {
  await connectDB();
  await seedInitialQuestions();

  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 SPOT THE ERRORS Server running on port ${PORT}`);
    console.log(`🌐 REST API: http://localhost:${PORT}/api`);
    console.log(`⚡ Real-time Socket.IO Engine ready`);
    console.log(`📱 Client origin: ${CLIENT_URL}`);
    console.log(`=================================================`);
  });
}

startServer();

export { app, server, io };
