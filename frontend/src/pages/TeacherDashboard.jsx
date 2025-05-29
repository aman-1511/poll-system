import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import socket, { joinAsTeacher, kickStudent } from '../utils/socket';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const students = useSelector(state => state.participants.students);

  useEffect(() => {
    // Join as a teacher when component mounts
    joinAsTeacher(user.name)
      .then(response => {
        console.log('Teacher joined successfully:', response);
      })
      .catch(error => {
        console.error('Failed to join as teacher:', error);
      });
  }, [user.name]);

  const handleCreateNewQuestion = () => {
    navigate('/teacher/question');
  };

  const handleViewHistory = () => {
    navigate('/poll-history');
  };

  const handleKickStudent = (name) => {
    if (window.confirm(`Are you sure you want to kick ${name}?`)) {
      kickStudent(name)
        .then(() => {
          console.log(`Student ${name} kicked successfully`);
        })
        .catch(error => {
          console.error(`Failed to kick student ${name}:`, error);
          alert(`Failed to kick student: ${error}`);
        });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', bgcolor: '#fff', p: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Button
        variant="contained"
        startIcon={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#fff"/><path d="M8 4v4l3 1" stroke="#4F00CE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        }
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 40 },
          left: { xs: 16, sm: 80 },
          borderRadius: 999,
          px: 3,
          py: 1,
          fontWeight: 600,
          fontSize: '1rem',
          bgcolor: '#7C5CFA',
          boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
          zIndex: 100,
          '&:hover': { bgcolor: '#5B3FD7' },
        }}
        disableElevation
      >
        Intervue Poll
      </Button>
      
      <Grid container spacing={4} sx={{ width: '100%', pt: { xs: 10, sm: 18 }, pb: 7, px: { xs: 2, sm: 6 } }}>
        <Grid item xs={12} md={8}>
        <Typography variant="h3" fontWeight={400} color="#111" sx={{ mb: 1, letterSpacing: '-1px', fontSize: { xs: '2rem', sm: '2.8rem' } }}>
          Let's <Box component="span" fontWeight={700}>Get Started</Box>
        </Typography>
        <Typography variant="body1" color="#757575" sx={{ mb: 4, fontSize: { xs: '1rem', sm: '1.2rem' }, maxWidth: 600 }}>
          you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
        </Typography>
          
          <Paper elevation={2} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(44,44,44,0.06)', mb: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={600} color="#111" sx={{ mb: 3 }}>
                Teacher Dashboard
              </Typography>
              
              <Typography variant="body1" color="#757575" sx={{ mb: 5 }}>
                Create a new poll question or view previous poll results
                </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, justifyContent: 'center', gap: 3 }}>
              <Button
                variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNewQuestion}
                sx={{
                  background: 'linear-gradient(90deg, #7765DA 0%, #4F00CE 100%)',
                  color: '#fff',
                  borderRadius: 999,
                  py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #4F00CE 0%, #7765DA 100%)',
                  },
                }}
              >
                  Create New Question
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={handleViewHistory}
                  sx={{
                    borderColor: '#7C5CFA',
                    color: '#7C5CFA',
                    borderRadius: 999,
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#4F00CE',
                      color: '#4F00CE',
                      bgcolor: '#f5f4fa'
                    },
                  }}
                >
                  View Poll History
              </Button>
              </Box>
          </Box>
        </Paper>
        </Grid>
        
        {/* Students list */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(44,44,44,0.06)' }}>
            <Typography variant="h5" fontWeight={700} color="#111" sx={{ mb: 3 }}>
              Connected Students ({students.length})
            </Typography>
            
            {students.length === 0 ? (
              <Typography variant="body1" color="#757575" sx={{ py: 3, textAlign: 'center' }}>
                No students connected yet. Waiting for students to join...
              </Typography>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {students.map((student, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="kick" 
                        onClick={() => handleKickStudent(student.name)}
                        sx={{ color: '#E91E63' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{ 
                      py: 1.5, 
                      borderBottom: '1px solid #eee',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <PersonIcon sx={{ mr: 2, color: '#7C5CFA' }} />
                    <ListItemText 
                      primary={student.name} 
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherDashboard;
