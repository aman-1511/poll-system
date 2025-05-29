import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, Tabs, Tab, TextField } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const DebugPanel = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState(0);
  const [filterId, setFilterId] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };
  
  const filteredData = filterId ? 
    data.filter(item => (item.id?.includes(filterId) || item._id?.includes(filterId))) : 
    data;

  return (
    <>
      <Button 
        variant="outlined" 
        color="error"
        size="small"
        startIcon={<BugReportIcon />}
        onClick={handleOpen}
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20,
          zIndex: 9999,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          bgcolor: 'white'
        }}
      >
        Debug {data.length > 0 ? `(${data.length})` : ''}
      </Button>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center">
            <BugReportIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Debug Information 
            </Typography>
            <Chip 
              label={`${data.length} items`} 
              color="primary" 
              size="small" 
              sx={{ ml: 1 }} 
            />
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="JSON View" />
          <Tab label="Table View" />
          <Tab label="IDs" />
        </Tabs>
        
        <DialogContent dividers>
          {tab === 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                  label="Filter by ID"
                  variant="outlined"
                  size="small"
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                  sx={{ width: 300 }}
                />
                <Button 
                  startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  color={copied ? "success" : "primary"}
                  variant="outlined"
                >
                  {copied ? "Copied!" : "Copy JSON"}
                </Button>
              </Box>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  maxHeight: '500px', 
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  borderRadius: 1
                }}
              >
                <pre>{JSON.stringify(filteredData, null, 2)}</pre>
              </Paper>
            </>
          )}
          
          {tab === 1 && (
            <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Index</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Question</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Options</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Votes</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{index}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.id || item._id || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.question || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {Array.isArray(item.options) ? item.options.join(', ') : 'N/A'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {item.results ? Object.values(item.results).reduce((a, b) => a + b, 0) : 0}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.status || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
          
          {tab === 2 && (
            <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Poll IDs (useful for debugging)
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {data.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{index}:</strong> {item.id || item._id || 'N/A'}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button 
            color="primary" 
            onClick={() => {
              console.log('Debug data:', data);
              alert(`Logged ${data.length} items to console`);
            }}
          >
            Log to Console
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DebugPanel; 