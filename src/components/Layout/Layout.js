import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      background: 'linear-gradient(135deg, #111b21 0%, #1a1a2e 100%)',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          position: 'relative',
          background: 'transparent'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
