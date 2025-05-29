import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  FormControl,
  MenuItem,
  Select,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import socket from '../utils/socket';

const TeacherQuestion = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State for the form
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add more options
  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  // Update option text
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please add at least 2 options');
      return;
    }
    
    setIsSubmitting(true);
    
    // Send the question to the server
    socket.emit('question:ask', {
      question: question.trim(),
      options: validOptions,
      timeout: parseInt(timeLimit, 10)
    }, (response) => {
      setIsSubmitting(false);
      
      if (response && response.error) {
        alert(response.error);
      } else {
        // Navigate to results page
        navigate('/teacher/results');
      }
    });
  };

  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#7C5CFA',
            borderRadius: 20,
            px: 2,
            py: 0.5,
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': { bgcolor: '#6A4DE0' }
          }}
        >
          Intervue Poll
        </Button>
        
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            mt: 2, 
            mb: 1
          }}
        >
          Let's Get Started
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          you'll have the ability to create and manage polls, ask questions, and monitor 
          your students' responses in real-time.
        </Typography>
      </Box>
      
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 2,
          mb: 4
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="medium">
              Enter your question
            </Typography>
            
            <FormControl sx={{ minWidth: 140 }}>
              <Select
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                displayEmpty
                size="small"
                sx={{ 
                  borderRadius: 1,
                  '& .MuiSelect-select': { pr: 4 }
                }}
                IconComponent={() => (
                  <Box 
                    component="span" 
                    sx={{ 
                      position: 'absolute', 
                      right: 8, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      display: 'flex'
                    }}
                  >
                    ▼
                  </Box>
                )}
              >
                <MenuItem value={30}>30 seconds</MenuItem>
                <MenuItem value={60}>60 seconds</MenuItem>
                <MenuItem value={90}>90 seconds</MenuItem>
                <MenuItem value={120}>2 minutes</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            fullWidth
            placeholder="Rahul Bajaj"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            variant="outlined"
            multiline
            minRows={2}
            sx={{ 
              mb: 4,
              bgcolor: '#f5f5f5',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)'
              }
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="medium">
              Edit Options
            </Typography>
            
            <Typography variant="h6" fontWeight="medium">
              Is it Correct?
            </Typography>
          </Box>
          
          <RadioGroup name="correct-answer">
            {options.map((option, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: '#7C5CFA',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    mr: 2
                  }}
                >
                  {index + 1}
                </Box>
                
                <TextField
                  fullWidth
                  placeholder="Rahul Bajaj"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  variant="outlined"
                  sx={{ 
                    bgcolor: '#f5f5f5',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    }
                  }}
                />
                
                <FormControlLabel
                  value={`${index}`}
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: '#7C5CFA',
                        },
                      }}
                    />
                  }
                  label=""
                  labelPlacement="start"
                />
              </Box>
            ))}
          </RadioGroup>
          
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddOption}
            disabled={options.length >= 6}
            sx={{
              textTransform: 'none',
              color: '#7C5CFA',
              fontWeight: 'medium',
              mt: 1,
              mb: 3
            }}
          >
            Add More option
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                bgcolor: '#7C5CFA',
                borderRadius: 20,
                px: 4,
                py: 1,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#6A4DE0' }
              }}
            >
              Ask Question
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TeacherQuestion; 