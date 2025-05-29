# Live Polling System

A real-time polling application designed for teachers and students to interact through live polls.

## Features

- Teachers can create and manage polls
- Students can join with unique names and submit answers
- Real-time poll results visualization
- Chat system for communication
- Teacher can kick students
- Poll history tracking
- Configurable poll timeout

## Tech Stack

- **Frontend:** React with Redux, Material UI
- **Backend:** Express.js, Socket.io
- **Database:** MongoDB

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or accessible via connection string)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/polling-system
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   VITE_SOCKET_URL=http://localhost:4000
   VITE_API_URL=http://localhost:4000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and go to:
   ```
   http://localhost:5173
   ```

## Usage

1. Students: Enter your name on the homepage
2. Teacher: Navigate to `/teacher` to create polls and manage students
3. When a poll is active, students can submit answers
4. Results are displayed in real-time

## Deployment

Both frontend and backend can be deployed separately:

- Frontend: Deploy the built React application to services like Netlify, Vercel, or any static hosting
- Backend: Deploy to services like Heroku, Railway, or any Node.js hosting

Remember to update the environment variables in your deployment settings.

## Project Structure

- `frontend/`: React application built with Vite
- `backend/`: Node.js server with Express and Socket.io

## Environment Variables

### Backend (.env)

```
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
CLIENT_URL=https://your-frontend-url.vercel.app
SOCKET_CORS_ORIGIN=*
```

### Frontend (.env)

```
VITE_API_URL=https://your-backend-url.vercel.app
VITE_SOCKET_URL=https://your-backend-url.vercel.app
```

## Deploying to Vercel

### Backend Deployment

1. Sign up for [Vercel](https://vercel.com/) if you haven't already
2. Install Vercel CLI: `npm i -g vercel`
3. Navigate to the backend directory: `cd backend`
4. Deploy to Vercel: `vercel`
5. Set environment variables in Vercel Dashboard:
   - Go to your project settings
   - Add the environment variables listed above
   - Make sure to use your actual MongoDB URI

### Frontend Deployment

1. Navigate to the frontend directory: `cd frontend`
2. Deploy to Vercel: `vercel`
3. Set environment variables in Vercel Dashboard:
   - `VITE_API_URL`: Your deployed backend URL
   - `VITE_SOCKET_URL`: Same as API URL

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Socket.io on Vercel

Socket.io requires special handling on serverless platforms like Vercel. The included `vercel.json` configurations handle this automatically, ensuring WebSocket connections work properly.

## Troubleshooting

If you encounter connection issues between frontend and backend:

1. Verify environment variables are set correctly
2. Check CORS settings in both projects
3. Make sure Socket.io is connecting to the correct URL
4. Verify MongoDB connection string is valid

