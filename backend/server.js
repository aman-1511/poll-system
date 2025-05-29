require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeSocketHandlers } = require('./controllers/pollController');
const { initializeStudentManager } = require('./utils/studentManager');

// Try to connect to MongoDB, but continue even if it fails
let dbConnected = false;
try {
  require('./utils/db');
  dbConnected = true;
} catch (error) {
  console.warn('MongoDB connection not available, running in memory-only mode');
  console.warn(error.message);
}

const app = express();

// Configure CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: [clientUrl, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize student manager and socket handlers
const studentManager = initializeStudentManager();
initializeSocketHandlers(io, studentManager);

// API routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    students: studentManager.getStudentCount(),
    activePoll: studentManager.getActivePoll() ? true : false,
    dbConnected: dbConnected
  });
});

// Get all past polls
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await studentManager.getPollHistory();
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active poll
app.get('/api/polls/active', (req, res) => {
  const activePoll = studentManager.getActivePoll();
  if (!activePoll) {
    return res.status(404).json({ error: 'No active poll' });
  }
  res.json(activePoll);
});

// Get student list
app.get('/api/students', (req, res) => {
  res.json(studentManager.getStudents());
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`MongoDB connection: ${dbConnected ? 'Connected' : 'Not connected (running in memory mode)'}`);
  console.log(`CORS origin: ${clientUrl}`);
}); 