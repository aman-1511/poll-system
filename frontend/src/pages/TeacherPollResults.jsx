import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import HistoryIcon from '@mui/icons-material/History';
import PollIcon from '@mui/icons-material/Poll';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import socket from '../utils/socket';
import { setPollResults, setPollStatus, clearPoll } from '../slices/pollSlice';
import { useNavigate } from 'react-router-dom';

const TeacherPollResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activePoll = useSelector(state => state.poll.activePoll);
  const results = useSelector(state => state.poll.results);
  const pollStatus = useSelector(state => state.poll.pollStatus);
  const studentAnswers = useSelector(state => state.poll.studentAnswers);
  const students = useSelector(state => state.participants.students);
  
  const [selectedHistoryPoll, setSelectedHistoryPoll] = useState(null);

  useEffect(() => {
    const handleResults = (results) => {
      console.log('Received poll results:', results);
      dispatch(setPollResults(results));
    };
    
    const handleTimeout = () => {
      dispatch(setPollStatus('completed'));
    };
    
    socket.on('poll:results', handleResults);
    socket.on('poll:timeout', handleTimeout);
    
    return () => {
      socket.off('poll:results', handleResults);
      socket.off('poll:timeout', handleTimeout);
    };
  }, [dispatch]);

  const handleNewQuestion = () => {
    dispatch(clearPoll());
    navigate('/teacher');
  };
  
  const handleViewHistory = () => {
    navigate('/poll-history');
  };
  
  const handleCloseHistory = () => {
    setSelectedHistoryPoll(null);
  };

  if (!activePoll && !selectedHistoryPoll) {
    return (
      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5">No active poll. Please create a new poll.</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/teacher')}
          sx={{ ml: 2 }}
        >
          Create Poll
        </Button>
      </Container>
    );
  }

  const displayPoll = selectedHistoryPoll || activePoll;
  
  // Use history poll results if viewing history
  const displayResults = selectedHistoryPoll ? 
    (selectedHistoryPoll.results || {}) : 
    results;

  // Calculate totals for percentage calculation
  const totalVotes = Object.values(displayResults).reduce((sum, count) => sum + count, 0);

  const isPollInProgress = pollStatus === 'active' && !selectedHistoryPoll;

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', bgcolor: '#fff', p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Button
        variant="outlined"
        startIcon={<HistoryIcon />}
        onClick={handleViewHistory}
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 40 },
          right: { xs: 16, sm: 80 },
          borderRadius: 999,
          px: 3,
          py: 1,
          fontWeight: 600,
          fontSize: '1rem',
          color: '#7C5CFA',
          border: '2px solid #7C5CFA',
          boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
          zIndex: 100,
          bgcolor: '#fff',
          '&:hover': { borderColor: '#4F00CE', color: '#4F00CE', background: '#f7f4ff' },
        }}
      >
        View Poll History
      </Button>
      
      <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', pt: { xs: 10, sm: 14 }, pb: 7 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700} color="#4F00CE">
            {selectedHistoryPoll ? 'Historical Poll Results' : 
              (isPollInProgress ? 'Live Results' : 'Final Results')}
          </Typography>
          {!selectedHistoryPoll && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isPollInProgress && <CircularProgress size={24} color="primary" />}
              <Typography variant="body1" fontWeight={600} color={isPollInProgress ? "#4F00CE" : "#333"}>
                {studentAnswers} of {students.length} students answered
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight={600} color="#333">
            Active Question
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
            {displayPoll.question}
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
          {displayPoll.options.map((option, optIndex) => {
            if (!option) return null;
            
            const voteCount = (displayResults && displayResults[option]) || 0;
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            
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
        
        {selectedHistoryPoll ? (
          <Button
            variant="contained"
            onClick={handleCloseHistory}
            sx={{
              background: 'linear-gradient(90deg, #7765DA 0%, #4F00CE 100%)',
              color: '#fff',
              borderRadius: 999,
              py: 1.2,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
              width: { xs: '100%', sm: 'auto' },
              mt: 2,
              '&:hover': {
                background: 'linear-gradient(90deg, #4F00CE 0%, #7765DA 100%)',
              },
            }}
          >
            Back to Current Poll
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNewQuestion}
            startIcon={<PollIcon />}
            disabled={isPollInProgress && studentAnswers < students.length}
            sx={{
              background: 'linear-gradient(90deg, #7765DA 0%, #4F00CE 100%)',
              color: '#fff',
              borderRadius: 999,
              py: 1.2,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(79,0,206,0.08)',
              width: { xs: '100%', sm: 'auto' },
              mt: 2,
              '&:hover': {
                background: 'linear-gradient(90deg, #4F00CE 0%, #7765DA 100%)',
              },
            }}
          >
            {isPollInProgress && studentAnswers < students.length ? 
              'Waiting for all responses...' : 
              '+ Ask a new question'}
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default TeacherPollResults; 