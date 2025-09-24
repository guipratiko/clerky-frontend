import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

// Tema personalizado do WhatsApp
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00a884', // Verde WhatsApp
      light: '#26d367',
      dark: '#008069',
    },
    secondary: {
      main: '#8696a0',
    },
    background: {
      default: '#111b21',
      paper: '#202c33',
    },
    text: {
      primary: '#e9edef',
      secondary: '#8696a0',
    },
    divider: '#313d43',
    success: {
      main: '#00a884',
    },
    error: {
      main: '#f15c6d',
    },
    warning: {
      main: '#ffab00',
    },
    info: {
      main: '#54ddf7',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '24px',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#202c33',
            color: '#e9edef',
            border: '1px solid #313d43',
          },
          success: {
            iconTheme: {
              primary: '#00a884',
              secondary: '#e9edef',
            },
          },
          error: {
            iconTheme: {
              primary: '#f15c6d',
              secondary: '#e9edef',
            },
          },
        }}
      />
    </ThemeProvider>
  </React.StrictMode>
);
