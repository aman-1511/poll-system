import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { setUser } from '../slices/userSlice';
import socket from '../utils/socket';

const StudentDashboard = () => {
  const [name, setName] = useState('');
  const [pendingJoin, setPendingJoin] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (pendingJoin) {
      const handleConnect = () => {
        socket.emit('student:joined', { name: name.trim() });
      };
      socket.on('connect', handleConnect);
      if (socket.connected) {
        socket.emit('student:joined', { name: name.trim() });
      }
      return () => {
        socket.off('connect', handleConnect);
      };
    }
  }, [pendingJoin, name]);

  const handleContinue = (e) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch(setUser({ name: name.trim(), role: 'student' }));
      setPendingJoin(true);
      navigate('/student/waiting');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', p: 0 }}>
      {/* Intervue Poll Button */}
      <Button
        variant="contained"
        startIcon={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#fff"/><path d="M8 4v4l3 1" stroke="#4F00CE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        }
        sx={{
          position: 'relative',
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

      <Paper elevation={3} sx={{ width: '100%', p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(44,44,44,0.06)' }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h3" fontWeight={400} textAlign="center" color="#111" sx={{ letterSpacing: '-1px', fontSize: { xs: '2rem', sm: '2.8rem' } }}>
            Let's <Box component="span" fontWeight={700}>Get Started</Box>
          </Typography>
          <Typography variant="body1" color="#757575" textAlign="center" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, mb: 2 }}>
            If you're a student, you'll be able to <Box component="span" fontWeight={700} color="#111">submit your answers</Box>, participate in live polls, and see how your responses compare with your classmates
          </Typography>
          <Box component="form" onSubmit={handleContinue} width="100%" display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="subtitle1" color="#111" fontWeight={400} alignSelf="flex-start" mb={1}>
              Enter your Name
            </Typography>
            <TextField
              id="studentName"
              variant="outlined"
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              required
              sx={{ mb: 3, bgcolor: '#F3F3F3', borderRadius: 1 }}
              InputProps={{ style: { fontSize: '1.1rem' } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!name.trim()}
              sx={{
                py: 1.5,
                borderRadius: 999,
                fontSize: '1.2rem',
                fontWeight: 600,
                background: 'linear-gradient(90deg, #7765DA 0%, #4F00CE 100%)',
                boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
                mt: 1,
                '&:hover': {
                  background: 'linear-gradient(90deg, #4F00CE 0%, #7765DA 100%)',
                },
              }}
            >
              Continue
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default StudentDashboard; 