import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { HourglassEmpty } from '@mui/icons-material';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import socket from '../utils/socket';
import { setActivePoll, setPollStatus } from '../slices/pollSlice';
import { setTimeLimit } from '../slices/timerSlice';

const StudentWaiting = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pollStatus, activePoll } = useSelector((state) => state.poll);
  const { name, role } = useSelector((state) => state.user);

  // Redirect if not logged in
  useEffect(() => {
    if (!name || !role) {
      navigate('/');
      return;
    }

    // If there's an active poll, navigate to question page
    if (pollStatus === 'active' && activePoll) {
      navigate('/student/question');
    } else if (pollStatus === 'completed') {
      navigate('/student/results');
    }
  }, [name, role, navigate, pollStatus, activePoll]);

  // Handle receiving a new question
  useEffect(() => {
    const handleQuestion = (data) => {
      console.log('Received question:', data);
      const { id, question, options, timeout, startTime } = data;
      
      // Set the active poll with all received data
      dispatch(setActivePoll({ 
        id, 
        question, 
        options, 
        timeout, 
        startTime 
      }));
      
      // Set timer limit
      dispatch(setTimeLimit(timeout));
      
      // Set poll status to active
      dispatch(setPollStatus('active'));
      
      // Navigate to question page
      navigate('/student/question');
    };

    socket.on('question:receive', handleQuestion);
    
    return () => {
      socket.off('question:receive', handleQuestion);
    };
  }, [dispatch, navigate]);

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', bgcolor: '#fff', p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Button
        variant="contained"
        startIcon={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#fff"/><path d="M8 4v4l3 1" stroke="#4F00CE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        }
        sx={{
          alignSelf: 'center',
          borderRadius: 999,
          px: 3,
          py: 1,
          mb: 5,
          fontWeight: 600,
          fontSize: '1rem',
          bgcolor: '#7C5CFA',
          boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
          '&:hover': { bgcolor: '#5B3FD7' },
        }}
        disableElevation
      >
        Intervue Poll
      </Button>
      <Stack spacing={4} alignItems="center" justifyContent="center" flex={1} width="100%">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <HourglassEmpty sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Waiting for Next Poll
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The teacher will start a new poll soon. Please wait.
          </Typography>
          <CircularProgress size={40} />
        </Paper>
      </Stack>
    </Container>
  );
};

export default StudentWaiting; 