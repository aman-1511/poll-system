import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { submitAnswer, setPollStatus, setPollResults } from '../slices/pollSlice';
import { setTimeLimit, tick, stopTimer, startTimer } from '../slices/timerSlice';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import socket from '../utils/socket';

const StudentQuestion = () => {
  const [selected, setSelected] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPoll = useSelector(state => state.poll.currentPoll);
  const pollStatus = useSelector(state => state.poll.pollStatus);
  const timer = useSelector(state => state.timer);
  const user = useSelector((state) => state.user);

  // Initialize timer when component mounts
  useEffect(() => {
    if (currentPoll && currentPoll.timeout && !timer.running) {
      dispatch(setTimeLimit(currentPoll.timeout));
      dispatch(startTimer());
    }
  }, [currentPoll, dispatch, timer.running]);

  // Handle poll status changes
  useEffect(() => {
    if (pollStatus === 'waiting') {
      navigate('/student/waiting');
    } else if (pollStatus === 'completed') {
      navigate('/student/results');
    }
  }, [pollStatus, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timer.running && timer.timeLeft > 0) {
      const interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer.timeLeft === 0 && timer.running) {
      // Time's up - stop timer and navigate to results
      dispatch(stopTimer());
      dispatch(setPollStatus('completed'));
      navigate('/student/results');
    }
  }, [timer.running, timer.timeLeft, dispatch, navigate]);

  // If no current poll, show loading or redirect
  if (!currentPoll) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5">No active poll. Please wait for the teacher to start a poll.</Typography>
      </Container>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected !== null && user.name && !hasSubmitted) {
      setHasSubmitted(true);
      
      // Get the selected option text
      const selectedOption = currentPoll.options[selected];
      
      // Submit answer to server
      socket.emit('answer:submit', { name: user.name, answer: selectedOption }, (response) => {
        if (response && response.error) {
          console.error('Error submitting answer:', response.error);
          // Reset submission state on error
          setHasSubmitted(false);
          alert(`Failed to submit answer: ${response.error}`);
        } else {
          console.log('Answer submitted successfully:', response);
          
          // If server returned results, update them in Redux
          if (response && response.results) {
            dispatch(setPollResults(response.results));
          }
          
          // Also update local state with the option text
          dispatch(submitAnswer({ 
            pollId: currentPoll.id, 
            optionIndex: selected,
            option: selectedOption
          }));
          
          // Set poll status to completed for this student
          dispatch(setPollStatus('completed'));
          
          // Navigate to results page
          navigate('/student/results');
        }
      });
    }
  };

  // Format timer as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(44,44,44,0.06)', mb: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
            <Typography variant="h6" fontWeight={700} color="#111">Question</Typography>
            <Typography variant="body1" color={timer.timeLeft <= 10 ? '#E14B3C' : '#111'} fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#fff"/><path d="M10 5v5l3 1" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> {formatTime(timer.timeLeft)}
            </Typography>
          </Stack>
          <Box sx={{ width: '100%', bgcolor: 'linear-gradient(90deg, #444 60%, #aaa 100%)', borderRadius: 2, p: 2, mb: 2, color: '#fff', fontWeight: 600, fontSize: '1.1rem', background: 'linear-gradient(90deg, #444 60%, #aaa 100%)' }}>
            {currentPoll.question}
          </Box>
          <Stack spacing={2} width="100%">
            {currentPoll.options.map((opt, idx) => (
              <Button
                key={opt}
                variant={selected === idx ? 'outlined' : 'contained'}
                onClick={() => setSelected(idx)}
                disabled={hasSubmitted}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 2,
                  bgcolor: selected === idx ? '#fff' : '#f6f6f6',
                  color: selected === idx ? '#7C5CFA' : '#222',
                  borderColor: selected === idx ? '#7C5CFA' : 'transparent',
                  borderWidth: 2,
                  borderRadius: 2,
                  boxShadow: selected === idx ? '0 0 0 2px #ede7ff' : 'none',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  px: 2,
                  py: 1.2,
                  '& .MuiButton-startIcon': { mr: 2 },
                }}
                startIcon={
                  <Radio
                    checked={selected === idx}
                    sx={{
                      color: selected === idx ? '#7C5CFA' : '#eae6fd',
                      '&.Mui-checked': { color: '#7C5CFA' },
                    }}
                  />
                }
                fullWidth
              >
                {opt}
              </Button>
            ))}
          </Stack>
          <Button
            variant="contained"
            type="button"
            disabled={selected === null || hasSubmitted}
            onClick={handleSubmit}
            sx={{
              mt: 2,
              borderRadius: 999,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #7C5CFA 60%, #5B3FD7 100%)',
              boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
              px: 6,
              py: 1.5,
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                background: 'linear-gradient(90deg, #4F00CE 0%, #7765DA 100%)',
              },
            }}
          >
            Submit
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default StudentQuestion; 