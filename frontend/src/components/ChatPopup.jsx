import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Tab, Tabs, TextField, Button, IconButton, Badge, Chip } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatIcon from '@mui/icons-material/Chat';
import { addMessage, toggleChat, clearUnread } from '../slices/chatSlice';
import { sendChatMessage, kickStudent } from '../utils/socket';

const ChatPopup = () => {
  const [tab, setTab] = useState(0);
  const [message, setMessage] = useState('');
  const messageContainerRef = useRef(null);
  
  const dispatch = useDispatch();
  const chat = useSelector(state => state.chat.messages);
  const isOpen = useSelector(state => state.chat.isOpen);
  const unreadCount = useSelector(state => state.chat.unreadCount);
  const students = useSelector(state => state.participants.students);
  const user = useSelector(state => state.user);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messageContainerRef.current && isOpen && tab === 0) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [chat, isOpen, tab]);

  const handleSend = () => {
    if (message.trim()) {
      // Only send to server, don't dispatch locally
      // Let the server broadcast to all clients, including the sender
      sendChatMessage(user.name, message.trim(), user.role)
        .then(() => {
          // Message sent successfully
          setMessage('');
        })
        .catch(error => {
          console.error('Error sending message:', error);
          alert(`Failed to send message: ${error}`);
        });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleChat = () => {
    dispatch(toggleChat());
    if (!isOpen) {
      dispatch(clearUnread());
    }
  };

  const handleKickStudent = (name) => {
    if (window.confirm(`Are you sure you want to kick ${name}?`)) {
      kickStudent(name)
        .then(() => {
          console.log(`Student ${name} kicked`);
        })
        .catch(err => {
          console.error('Error kicking student:', err);
          alert(`Failed to kick student: ${err}`);
        });
    }
  };

  const getRoleColor = (role) => {
    return role === 'teacher' ? '#E91E63' : '#7C5CFA';
  };
  
  const getRoleLabel = (role) => {
    return role === 'teacher' ? 'Teacher' : 'Student';
  };

  // If no user name or role, don't render anything
  if (!user?.name || !user?.role) {
    return null;
  }

  return (
    <>
      {/* Floating chat button */}
      <Badge 
        badgeContent={unreadCount} 
        color="error"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <IconButton
          onClick={handleToggleChat}
          sx={{
            position: 'fixed',
            right: 40,
            bottom: 40,
            bgcolor: isOpen ? '#6A4DE0' : '#7C5CFA',
            color: '#fff',
            zIndex: 2000,
            width: 56,
            height: 56,
            boxShadow: '0 2px 12px rgba(79,0,206,0.3)',
            '&:hover': { bgcolor: '#5B3FD7' },
            transition: 'all 0.2s ease',
            transform: isOpen ? 'scale(0.9)' : 'scale(1)',
          }}
          size="large"
          aria-label="open chat"
        >
          {isOpen ? <ChatIcon fontSize="large" /> : <ChatBubbleOutlineIcon fontSize="large" />}
        </IconButton>
      </Badge>
      
      {/* Popup */}
      {isOpen && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            right: 40,
            bottom: 100,
            width: 370,
            maxWidth: '95vw',
            borderRadius: 3,
            p: 0,
            zIndex: 2100,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.2s ease',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', bgcolor: '#fff' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ minHeight: 48, flex: 1 }}
              TabIndicatorProps={{ style: { background: '#7C5CFA', height: 3 } }}
            >
              <Tab label="Chat" sx={{ fontWeight: 600, minWidth: 120 }} />
              <Tab label="Participants" sx={{ fontWeight: 600, minWidth: 120 }} />
            </Tabs>
            <IconButton onClick={handleToggleChat} sx={{ mr: 1 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13 5L5 13M5 5l8 8" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </IconButton>
          </Box>
          
          {/* Chat Panel */}
          {tab === 0 && (
            <>
              <Box 
                sx={{ 
                  p: 2, 
                  minHeight: 260, 
                  maxHeight: 320, 
                  overflowY: 'auto', 
                  bgcolor: '#faf9ff',
                  display: 'flex',
                  flexDirection: 'column'
                }} 
                ref={messageContainerRef}
              >
                {chat.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    No messages yet. Start a conversation!
                  </Typography>
                )}
                
                {chat.map((msg, idx) => (
                  <Box key={idx} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.from === user.name ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mb: 0.5
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: getRoleColor(msg.role), 
                        fontWeight: 600,
                      }}>
                        {msg.from === user.name ? 'You' : msg.from}
                      </Typography>
                      <Chip
                        label={getRoleLabel(msg.role)}
                        size="small"
                        sx={{
                          bgcolor: getRoleColor(msg.role),
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 20,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{
                      bgcolor: msg.from === user.name ? '#7C5CFA' : (msg.role === 'teacher' ? '#E91E63' : '#222'),
                      color: '#fff',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: 220,
                      fontSize: '1rem',
                      alignSelf: msg.from === user.name ? 'flex-end' : 'flex-start',
                    }}>
                      {msg.message}
                    </Box>
                    
                    <Typography variant="caption" sx={{ 
                      color: '#888', 
                      fontSize: '0.7rem',
                      alignSelf: msg.from === user.name ? 'flex-end' : 'flex-start',
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              {/* Message input */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                borderTop: '1px solid #eee',
                bgcolor: 'white'
              }}>
                <TextField
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{ mr: 1 }}
                  InputProps={{
                    sx: { borderRadius: 4 }
                  }}
                />
                <Button
                  onClick={handleSend}
                  variant="contained"
                  color="primary"
                  disabled={!message.trim()}
                  sx={{ 
                    minWidth: 'auto', 
                    borderRadius: 999,
                    bgcolor: '#7C5CFA',
                    '&:hover': { bgcolor: '#6A4DE0' }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </Box>
            </>
          )}
          
          {/* Participants Panel */}
          {tab === 1 && (
            <Box sx={{ minHeight: 260, maxHeight: 400, overflowY: 'auto', p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                {user.role === 'teacher' ? 'Students Connected' : 'Participants'}
              </Typography>
              {students.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No students connected yet.
                </Typography>
              ) : (
                <Box component="ul" sx={{ 
                  p: 0, 
                  m: 0, 
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  {students.map((student, idx) => (
                    <Box
                      component="li"
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: '#f5f5f5',
                        border: '1px solid #eee'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {student.name}
                      </Typography>
                      
                      {user.role === 'teacher' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleKickStudent(student.name)}
                          sx={{ minWidth: 'auto', py: 0.5 }}
                        >
                          Kick
                        </Button>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}
    </>
  );
};

export default ChatPopup; 