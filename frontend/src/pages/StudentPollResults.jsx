import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import socket from '../utils/socket';
import { setPollResults, setPollStatus } from '../slices/pollSlice';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const StudentPollResults = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPoll = useSelector(state => state.poll.currentPoll);
  const results = useSelector(state => state.poll.results);
  const pollStatus = useSelector(state => state.poll.pollStatus);
  const user = useSelector(state => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    // Set loading state to false after a delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Check if the student has answered the current poll
  useEffect(() => {
    if (currentPoll && user.name) {
      // Check with the server if this student has answered
      socket.emit('check:answered', { name: user.name }, (response) => {
        if (response && response.hasAnswered) {
          setHasAnswered(true);
        } else if (pollStatus === 'completed') {
          // If poll is completed, allow viewing results even if they didn't answer
          setHasAnswered(true);
        } else {
          // Not answered and poll still active, redirect to question page
          navigate('/student/question');
        }
      });
    }
  }, [currentPoll, user.name, pollStatus, navigate]);

  useEffect(() => {
    // Redirect if not logged in
    if (!user.name || !user.role) {
      navigate('/');
      return;
    }

    // Redirect based on poll status
    if (pollStatus === 'waiting') {
      navigate('/student/waiting');
    } else if (pollStatus === 'active' && !hasAnswered) {
      navigate('/student/question');
    }
  }, [pollStatus, navigate, user.name, user.role, hasAnswered]);

  useEffect(() => {
    const handleTimeout = () => {
      dispatch(setPollStatus('completed'));
      setHasAnswered(true); // Allow viewing results after poll timeout
    };
    
    const handleResults = (results) => {
      console.log('Received poll results:', results);
      if (results) {
        dispatch(setPollResults(results));
      }
    };
    
    const handleQuestion = (data) => {
      // Reset answered state for new questions
      setHasAnswered(false);
      navigate('/student/question');
    };
    
    socket.on('poll:timeout', handleTimeout);
    socket.on('poll:results', handleResults);
    socket.on('question:receive', handleQuestion);
    
    return () => {
      socket.off('poll:timeout', handleTimeout);
      socket.off('poll:results', handleResults);
      socket.off('question:receive', handleQuestion);
    };
  }, [dispatch, navigate]);

  // Show loading state while initializing or if no current poll
  if (isLoading || !currentPoll) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ mb: 3 }} />
        <Typography variant="h5" align="center">
          {!currentPoll ? "No active poll. Please wait for the teacher to start a poll." : "Loading poll results..."}
        </Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 3 }}
          onClick={() => navigate('/student/waiting')}
        >
          Return to Waiting Room
        </Button>
      </Container>
    );
  }

  // If poll is active and student hasn't answered, redirect to question
  if (pollStatus === 'active' && !hasAnswered) {
    navigate('/student/question');
    return null;
  }

  // Ensure results is an object before using it
  const safeResults = results || {};
  
  // Calculate total votes for proper percentage display
  const totalVotes = Object.values(safeResults).reduce((sum, count) => sum + count, 0);

  const getPercent = (option) => {
    if (totalVotes === 0) return 0;
    return Math.round(((safeResults[option] || 0) / totalVotes) * 100);
  };

  const getCount = (option) => {
    return safeResults[option] || 0;
  };

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
      
      <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', pb: 7 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} color="#111">Poll Results</Typography>
          {pollStatus === 'active' && (
            <Typography variant="body2" color="primary" sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Live Results
            </Typography>
          )}
        </Stack>
        
        {pollStatus === 'active' && (
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              bgcolor: '#f0f7ff', 
              p: 1.5, 
              borderRadius: 1,
              border: '1px solid #d0e2ff'
            }}
          >
            Currently showing only your vote. Full results will be available when all students have answered or the timer expires.
          </Typography>
        )}

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight={600} color="#333">
            Current Question
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            bgcolor: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            p: 2, 
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            textAlign: 'center',
            mb: 0
          }}
        >
          <Typography variant="h6" fontWeight={500}>
            {currentPoll.question}
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            p: 3, 
            bgcolor: 'white',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            mb: 4
          }}
        >
          {currentPoll.options.map((option, optIndex) => {
            const percentage = getPercent(option);
            const voteCount = getCount(option);
            
            return (
              <Box key={`${option}-${optIndex}`} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#7C5CFA', 
                    color: 'white',
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  {optIndex + 1}
                </Box>
                
                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage}
                    sx={{
                      height: 24,
                      borderRadius: 2,
                      bgcolor: '#eae6fd',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#7C5CFA',
                        borderRadius: 2
                      }
                    }}
                  />
                  <Typography variant="body1" sx={{ position: 'absolute', ml: 2, mt: -2.5, color: '#222', fontWeight: 600 }}>
                    {option}
                  </Typography>
                </Box>
                
                <Box sx={{ minWidth: 90, textAlign: 'right' }}>
                  <Typography variant="body1" fontWeight={700} color="#4F00CE">{percentage}%</Typography>
                  <Typography variant="caption" color="#666">({voteCount} votes)</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} color="#111" sx={{ mb: 2 }}>
            {pollStatus === 'completed' ? 
              'Poll ended. Wait for the teacher to ask a new question.' :
              'Wait for other students to complete the poll...'}
          </Typography>
          <CircularProgress size={30} />
        </Box>
      </Box>
    </Container>
  );
};

export default StudentPollResults; 