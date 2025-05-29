import React from 'react';
import { Box, Typography, Paper, LinearProgress, Stack } from '@mui/material';

const PollResultCard = ({ poll, questionNumber }) => {
  // Function to calculate percentage for each option
  const getPercent = (option, results) => {
    if (!results) return 0;
    
    const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    
    return Math.round(((results[option] || 0) / totalVotes) * 100);
  };
  
  // Function to get the count of votes for an option
  const getCount = (option, results) => {
    return results && results[option] ? results[option] : 0;
  };
  
  if (!poll || !poll.question || !Array.isArray(poll.options) || poll.options.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
        Question {questionNumber || ""}
      </Typography>
      
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            bgcolor: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            p: 2, 
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          {poll.question}
        </Typography>
        
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            {poll.options.map((option, optIndex) => {
              if (!option) return null;
              
              const percentage = getPercent(option, poll.results);
              const voteCount = getCount(option, poll.results);
              
              return (
                <Box key={`${option}-${optIndex}`} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                        height: 18,
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
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default PollResultCard; 