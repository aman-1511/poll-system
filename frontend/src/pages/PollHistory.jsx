import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Button, CircularProgress, LinearProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import socket from '../utils/socket';

const PollHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pollHistory, setPollHistory] = useState([]);

  useEffect(() => {
    // Fetch poll history when component mounts
    setLoading(true);
    
    socket.emit('polls:history', {}, (response) => {
      setLoading(false)
      if (response && response.error) {
        console.error('Error fetching poll history:', response.error);
      } else if (response && response.polls) {
        console.log('Received poll history:', response.polls);
        
        // Ensure we have valid poll data
        const validPolls = response.polls.filter(poll => 
          poll && poll.question && poll.options && Array.isArray(poll.options) && poll.options.length > 0
        );
        
        setPollHistory(validPolls);
      } else {
        console.log('No polls received or invalid response format:', response);
      }
    });
  }, []);

  const handleBack = () => {
    navigate('/teacher');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h5" sx={{ mt: 3 }}>Loading poll history...</Typography>
      </Container>
    );
  }

  if (pollHistory.length === 0) {
    return (
      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5">No poll history available</Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 3 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100vh',
        overflow: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        maxWidth: '100%',
      }}
    >
      <Typography 
        variant="h3" 
        component="h1" 
        align="center" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 5,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        View Poll History
      </Typography>
      
      {pollHistory.map((poll, index) => (
        <Box 
          key={poll.id || index} 
          sx={{ 
            mb: 6,
            maxWidth: '900px',
            mx: 'auto'
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 2,
              fontWeight: 500,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Question {index + 1}
          </Typography>
          
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
              mb: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
          >
            <Box 
              sx={{ 
                bgcolor: 'rgba(0,0,0,0.8)', 
                color: 'white', 
                p: 2,
              }}
            >
              <Typography variant="h6" fontWeight="medium">
                {poll.question}
              </Typography>
            </Box>
            
            <Box sx={{ p: 2 }}>
              {poll.options.map((option, optIndex) => {
                if (!option) return null;
                
                const totalVotes = Object.values(poll.results || {}).reduce((sum, count) => sum + count, 0);
                const voteCount = (poll.results && poll.results[option]) || 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                
                return (
                  <Box key={`${option}-${optIndex}`} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                      <Box 
                        sx={{ 
                          bgcolor: '#7C5CFA',
                          color: 'white',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          flexShrink: 0
                        }}
                      >
                        {optIndex + 1}
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {option}
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        ml: { xs: 0, sm: 4 },
                        mt: 0.5
                      }}
                    >
                      <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#eae6fd',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#7C5CFA',
                              borderRadius: 5
                            }
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color="#7C5CFA"
                        sx={{ 
                          minWidth: 45,
                          textAlign: 'right',
                          mr: 1
                        }}
                      >
                        {percentage}%
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                      >
                        ({voteCount} votes)
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      ))}
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4, 
          pb: 4 
        }}
      >
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ 
            borderRadius: 2,
            borderColor: '#7C5CFA',
            color: '#7C5CFA',
            px: 3,
            py: 1,
            '&:hover': {
              borderColor: '#4F00CE',
              background: '#f7f4ff'
            }
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default PollHistory; 