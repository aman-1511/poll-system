import React from 'react';
import { Paper, List, ListItem, ListItemText, Typography, Box, Chip } from '@mui/material';
import { useSelector } from 'react-redux';

const Participants = () => {
  const participants = useSelector((state) => state.participants.list);

  return (
    <Paper elevation={3} sx={{ height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">Participants ({participants.length})</Typography>
      </Box>
      <List>
        {participants.map((participant) => (
          <ListItem key={participant.id}>
            <ListItemText
              primary={participant.name}
              secondary={participant.role}
            />
            <Chip
              label={participant.role}
              color={participant.role === 'teacher' ? 'primary' : 'default'}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Participants; 