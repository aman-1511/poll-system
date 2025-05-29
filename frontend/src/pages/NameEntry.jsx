import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import socket from '../utils/socket';
import { setPollStatus } from '../slices/pollSlice';
import { setUser } from '../slices/userSlice';

const roles = [
  {
    key: 'student',
    title: "I'm a Student",
    desc: 'Submit answers and view live poll results in real-time.'
  },
  {
    key: 'teacher',
    title: "I'm a Teacher",
    desc: 'Create polls and monitor student responses.'
  }
];

const NameEntry = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setNameInput] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleContinue = () => {
    if (!selectedRole) {
      setError('Please select your role.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError(null);

    if (selectedRole === 'teacher') {
      dispatch(setUser({ name, role: 'teacher' }));
      navigate('/teacher');
    } else if (selectedRole === 'student') {
      // Emit student join event and handle response
      socket.emit('student:joined', { name }, ({ pollStatus, currentPoll }) => {
        dispatch(setUser({ name, role: 'student' }));
        dispatch(setPollStatus(pollStatus));
        if (pollStatus === 'active') {
          navigate('/student/question');
        } else {
          navigate('/student/waiting');
        }
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', p: 0 }}>
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
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(44,44,44,0.06)', mb: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4" fontWeight={700} textAlign="center" color="#111" sx={{ letterSpacing: '-1px', fontSize: { xs: '1.5rem', sm: '2.2rem' } }}>
            Welcome to the <Box component="span" color="#7C5CFA">Live Polling System</Box>
          </Typography>
          <Typography variant="body1" color="#757575" textAlign="center" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
            Please select the role that best describes you to begin using the live polling system.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} width="100%" justifyContent="center" alignItems="center">
            {roles.map((role) => (
              <Card
                key={role.key}
                sx={{
                  minWidth: { xs: '100%', sm: 220 },
                  maxWidth: { xs: '100%', sm: 260 },
                  width: { xs: '100%', sm: 'auto' },
                  borderRadius: 3,
                  border: selectedRole === role.key ? '2.5px solid #7C5CFA' : '2px solid #eee',
                  boxShadow: selectedRole === role.key ? '0 4px 16px rgba(124,92,250,0.08)' : '0 2px 8px rgba(44,44,44,0.06)',
                  transition: 'box-shadow 0.2s, border 0.2s',
                  bgcolor: selectedRole === role.key ? '#f7f4ff' : '#fff',
                  cursor: 'pointer',
                  mb: { xs: 2, sm: 0 },
                }}
                onClick={() => setSelectedRole(role.key)}
                tabIndex={0}
              >
                <CardActionArea>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} color="#4F00CE" gutterBottom>
                      {role.title}
                    </Typography>
                    <Typography variant="body2" color="#555">
                      {role.desc}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
          {selectedRole && (
            <TextField
              fullWidth
              label="Enter your name"
              value={name}
              onChange={(e) => setNameInput(e.target.value)}
              variant="outlined"
              sx={{ mt: 2 }}
            />
          )}
          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
          <Button
            variant="contained"
            size="large"
            disabled={!selectedRole || !name.trim()}
            onClick={handleContinue}
            sx={{
              mt: 2,
              borderRadius: 999,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #7765DA 0%, #4F00CE 100%)',
              boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
              px: 6,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(90deg, #4F00CE 0%, #7765DA 100%)',
              },
            }}
            fullWidth
          >
            Continue
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default NameEntry; 