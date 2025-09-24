import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const AudioPlayer = ({ 
  audioUrl, 
  fileName = 'Áudio', 
  duration = 0, 
  isFromMe = false,
  timestamp,
  onDownload
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [isPlayingRequested, setIsPlayingRequested] = useState(false);
  
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Formatar tempo em MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatar timestamp da mensagem
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Carregar áudio
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;

    const audio = audioRef.current;
    setIsLoading(true);
    setError(null);

    // Configurar para suportar OGG/OPUS
    audio.crossOrigin = 'anonymous';

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
    };

    const handleError = (e) => {
      console.error('Erro ao carregar áudio:', e);
      setError('Erro ao carregar áudio');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    // Definir volume inicial
    audio.volume = isMuted ? 0 : volume;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, volume, isMuted]);

  // Atualizar progresso durante reprodução
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current || isPlayingRequested) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsPlayingRequested(false);
      } else {
        setIsPlayingRequested(true);
        
        // Pausar qualquer reprodução anterior antes de iniciar nova
        audioRef.current.pause();
        audioRef.current.currentTime = currentTime;
        
        // Aguardar um pequeno delay para evitar conflitos
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await audioRef.current.play();
        setIsPlaying(true);
        setIsPlayingRequested(false);
      }
    } catch (err) {
      setIsPlayingRequested(false);
      
      // Ignorar erros de interrupção (AbortError)
      if (err.name === 'AbortError') {
        console.log('Reprodução interrompida pelo usuário');
        return;
      }
      
      console.error('Erro ao reproduzir áudio:', err);
      setError('Erro ao reproduzir áudio');
      setIsPlaying(false);
    }
  };

  // Atualizar posição do áudio
  const handleSeek = (event, newValue) => {
    if (!audioRef.current) return;
    
    const newTime = (newValue / 100) * audioDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.volume = newMuted ? 0 : volume;
  };

  // Ajustar volume
  const handleVolumeChange = (event, newValue) => {
    if (!audioRef.current) return;
    
    const newVolume = newValue / 100;
    setVolume(newVolume);
    audioRef.current.volume = isMuted ? 0 : newVolume;
  };

  // Download do áudio
  const handleDownload = () => {
    if (onDownload && audioUrl) {
      onDownload(audioUrl, fileName);
    } else if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = fileName || 'audio.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Calcular porcentagem do progresso
  const progressPercentage = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 200,
        maxWidth: 300,
        p: 2,
        background: isFromMe 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
          : 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header com nome do arquivo e timestamp */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
          <VolumeIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {fileName}
          </Typography>
        </Box>
        {timestamp && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
            {formatMessageTime(timestamp)}
          </Typography>
        )}
      </Box>

      {/* Controles principais */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Botão Play/Pause */}
        <IconButton
          onClick={togglePlayPause}
          disabled={isLoading || !!error}
          sx={{
            background: isPlaying 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(255,255,255,0.1)',
            color: '#fff',
            width: 40,
            height: 40,
            '&:hover': {
              background: isPlaying
                ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                : 'rgba(255,255,255,0.2)',
            },
            '&:disabled': {
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          {isLoading ? (
            <LinearProgress 
              size={20} 
              sx={{ 
                color: 'inherit',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }
              }} 
            />
          ) : isPlaying ? (
            <PauseIcon sx={{ fontSize: 20 }} />
          ) : (
            <PlayIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>

        {/* Barra de progresso */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 35 }}>
            {formatTime(currentTime)}
          </Typography>
          
          <Slider
            value={progressPercentage}
            onChange={handleSeek}
            disabled={isLoading || !!error || audioDuration === 0}
            sx={{
              flex: 1,
              color: '#667eea',
              '& .MuiSlider-track': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: 4,
              },
              '& .MuiSlider-rail': {
                background: 'rgba(255,255,255,0.2)',
                height: 4,
              },
              '& .MuiSlider-thumb': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: 16,
                height: 16,
                '&:hover': {
                  boxShadow: '0 0 0 8px rgba(102, 126, 234, 0.16)',
                },
              },
            }}
          />
          
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 35 }}>
            {formatTime(audioDuration)}
          </Typography>
        </Box>

        {/* Controles de volume e download */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Botão Mute */}
          <Tooltip title={isMuted ? 'Ativar som' : 'Desativar som'}>
            <IconButton
              onClick={toggleMute}
              size="small"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: '#fff',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {isMuted ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>

          {/* Botão Download */}
          <Tooltip title="Baixar áudio">
            <IconButton
              onClick={handleDownload}
              size="small"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: '#4caf50',
                  background: 'rgba(76, 175, 80, 0.1)'
                }
              }}
            >
              <DownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Controle de volume (expandido) */}
      {!isMuted && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <VolumeIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />
          <Slider
            value={volume * 100}
            onChange={handleVolumeChange}
            sx={{
              flex: 1,
              color: '#4caf50',
              '& .MuiSlider-track': {
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                border: 'none',
                height: 3,
              },
              '& .MuiSlider-rail': {
                background: 'rgba(255,255,255,0.2)',
                height: 3,
              },
              '& .MuiSlider-thumb': {
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                width: 12,
                height: 12,
              },
            }}
          />
        </Box>
      )}

      {/* Mensagem de erro */}
      {error && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#f44336', 
            textAlign: 'center',
            mt: 1,
            display: 'block'
          }}
        >
          {error}
        </Typography>
      )}

      {/* Elemento de áudio oculto */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        style={{ display: 'none' }}
      />
    </Box>
  );
};

export default AudioPlayer;
