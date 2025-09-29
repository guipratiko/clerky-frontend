import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import {
  Language as LanguageIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';
import { useI18n } from '../contexts/I18nContext';

const LanguageSelector = () => {
  const { language, changeLanguage } = useI18n();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    handleClose();
  };

  const getLanguageFlag = (lang) => {
    switch (lang) {
      case 'pt':
        return '🇧🇷';
      case 'en':
        return '🇺🇸';
      default:
        return '🌐';
    }
  };

  const getLanguageName = (lang) => {
    switch (lang) {
      case 'pt':
        return 'Português';
      case 'en':
        return 'English';
      default:
        return 'Language';
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          '&:hover': {
            color: '#00a884',
            backgroundColor: 'rgba(0,168,132,0.1)'
          }
        }}
        title="Change Language"
      >
        <LanguageIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            background: 'rgba(30, 30, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            minWidth: 180
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => handleLanguageChange('pt')}
          selected={language === 'pt'}
          sx={{
            color: language === 'pt' ? '#00a884' : 'rgba(255,255,255,0.8)',
            '&:hover': {
              backgroundColor: 'rgba(0,168,132,0.1)'
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0,168,132,0.2)'
            }
          }}
        >
          <ListItemIcon>
            <Typography sx={{ fontSize: '1.2rem' }}>
              {getLanguageFlag('pt')}
            </Typography>
          </ListItemIcon>
          <ListItemText primary={getLanguageName('pt')} />
        </MenuItem>

        <MenuItem
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
          sx={{
            color: language === 'en' ? '#00a884' : 'rgba(255,255,255,0.8)',
            '&:hover': {
              backgroundColor: 'rgba(0,168,132,0.1)'
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0,168,132,0.2)'
            }
          }}
        >
          <ListItemIcon>
            <Typography sx={{ fontSize: '1.2rem' }}>
              {getLanguageFlag('en')}
            </Typography>
          </ListItemIcon>
          <ListItemText primary={getLanguageName('en')} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelector;
