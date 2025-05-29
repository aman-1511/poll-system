import { io } from 'socket.io-client';

// Get Socket URL from environment variables
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://poll-system-eight.vercel.app/';

console.log('Connecting to socket server at:', SOCKET_URL);

// Socket connection
const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});

// Utility functions for socket operations
export const joinAsStudent = (name) => {
  return new Promise((resolve, reject) => {
    socket.emit('student:joined', { name }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};

export const joinAsTeacher = (name) => {
  return new Promise((resolve, reject) => {
    socket.emit('teacher:joined', { name }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};

export const askQuestion = (question, options, timeout) => {
  return new Promise((resolve, reject) => {
    socket.emit('question:ask', { question, options, timeout }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};

export const submitAnswer = (name, answer) => {
  return new Promise((resolve, reject) => {
    socket.emit('answer:submit', { name, answer }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};

export const kickStudent = (name) => {
  return new Promise((resolve, reject) => {
    socket.emit('student:kick', { name }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};

export const getPollHistory = () => {
  return new Promise((resolve, reject) => {
    socket.emit('polls:history', {}, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.polls);
      }
    });
  });
};

export const sendChatMessage = (from, message, role) => {
  return new Promise((resolve, reject) => {
    try {
      socket.emit('chat:message', { from, message, role }, (response) => {
        if (response && response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
      // If no callback is used, resolve immediately
      resolve();
    } catch (error) {
      console.error('Error sending chat message:', error);
      reject(error);
    }
  });
};

export default socket; 
