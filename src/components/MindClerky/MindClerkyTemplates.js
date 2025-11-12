import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const MindClerkyTemplates = ({ templates = [], onRefresh, onUseTemplate }) => {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <AutoAwesomeIcon color="warning" />
          <Typography variant="h6" fontWeight={600}>
            Templates MindClerky
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Use funis prontos para acelerar a criação de fluxos. Você pode personalizar cada template dentro do builder.
        </Typography>

        <Stack spacing={2}>
          {templates.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum template disponível. Crie um fluxo e salve como template para reutilizar depois.
            </Typography>
          ) : (
            templates.map((template) => (
              <Box
                key={template._id}
                sx={{
                  borderRadius: 2,
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  p: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {template.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(template.updatedAt).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {template.description || 'Template personalizado criado no MindClerky.'}
                  </Typography>
                  <Divider />
                  <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {template.nodes?.length || 0} nós • {template.edges?.length || 0} conexões
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileCopyIcon />}
                      onClick={() => onUseTemplate?.(template)}
                    >
                      Usar template
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onRefresh}>
          Atualizar biblioteca
        </Button>
      </CardActions>
    </Card>
  );
};

export default MindClerkyTemplates;

