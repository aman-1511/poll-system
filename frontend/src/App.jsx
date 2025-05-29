import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NameEntry from './pages/NameEntry';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherQuestion from './pages/TeacherQuestion';
import StudentDashboard from './pages/StudentDashboard';
import TeacherPollResults from './pages/TeacherPollResults';
import StudentQuestion from './pages/StudentQuestion';
import StudentPollResults from './pages/StudentPollResults';
import StudentWaiting from './pages/StudentWaiting';
import PollHistory from './pages/PollHistory';
import ChatPopup from './components/ChatPopup';
import socket from './utils/socket';
import { setActivePoll, setPollStatus, setPollResults, clearPoll } from './slices/pollSlice';
import { setStudents } from './slices/participantsSlice';
import { addMessage } from './slices/chatSlice';
import './App.css'

function AppContent() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  useEffect(() => {
    // Handle student join confirmation
    socket.on('student:joined', ({ name, pollStatus, currentPoll }) => {
      console.log('Student joined:', { name, pollStatus, currentPoll });
      if (currentPoll) {
        dispatch(setActivePoll(currentPoll));
      }
      dispatch(setPollStatus(pollStatus));
    });

    // Handle receiving a new question
    socket.on('question:receive', ({ id, question, options, timeout, startTime }) => {
      console.log('Received question:', { id, question, options, timeout });
      dispatch(setActivePoll({ id, question, options, timeout, startTime }));
      dispatch(setPollStatus('active'));
    });

    // Handle poll results
    socket.on('poll:results', (results) => {
      console.log('Received results:', results);
      dispatch(setPollResults(results));
      dispatch(setPollStatus('completed'));
    });

    // Handle poll timeout
    socket.on('poll:timeout', () => {
      console.log('Poll timed out');
      dispatch(setPollStatus('completed'));
    });

    // Handle poll errors
    socket.on('poll:error', (msg) => {
      console.error('Poll error:', msg);
      alert(msg);
    });

    // Handle student list updates
    socket.on('students:update', (students) => {
      console.log('Students updated:', students);
      dispatch(setStudents(students));
    });

    // Handle poll progress updates
    socket.on('poll:progress', ({ total, answered }) => {
      console.log('Poll progress:', { total, answered });
      dispatch({ type: 'poll/setStudentAnswers', payload: answered });
    });

    // Handle chat messages
    socket.on('chat:message', (message) => {
      console.log('Chat message received:', message);
      dispatch(addMessage(message));
    });

    // Handle being kicked
    socket.on('student:kicked', ({ reason }) => {
      console.log('Kicked:', reason);
      alert(`You have been kicked: ${reason}`);
      // Redirect to login page
      window.location.href = '/';
    });

    return () => {
      socket.off('student:joined');
      socket.off('question:receive');
      socket.off('poll:results');
      socket.off('poll:timeout');
      socket.off('poll:error');
      socket.off('students:update');
      socket.off('poll:progress');
      socket.off('chat:message');
      socket.off('student:kicked');
    };
  }, [dispatch]);

  return (
    <div className="App">
      {/* Chat component will handle its own visibility based on user state */}
      <ChatPopup />
      <Routes>
        <Route path="/" element={<NameEntry />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student/question" element={<StudentQuestion />} />
        <Route path="/student/results" element={<StudentPollResults />} />
        <Route path="/student/waiting" element={<StudentWaiting />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/question" element={<TeacherQuestion />} />
        <Route path="/teacher/results" element={<TeacherPollResults />} />
        <Route path="/poll-history" element={<PollHistory />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

