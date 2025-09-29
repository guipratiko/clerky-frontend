import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Grid,
  Paper,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  // Button,
  IconButton,
  // Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  // PlayArrow as PlayIcon,
  Check as CheckIcon2,
  Webhook as WebhookIcon,
  Send as SendIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  CopyAll as CopyIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';

// Códigos de exemplo para Kanban
const kanbanJavaScriptCode = `const moveChatToColumn = async (instanceName, chatId, column, token) => {
  try {
    const response = await fetch(\`\${process.env.REACT_APP_API_URL}/api/chats/\${instanceName}/\${chatId}/kanban-column\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({ column })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Chat movido com sucesso:', result.data);
    } else {
      console.error('❌ Erro ao mover chat:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    throw error;
  }
};

// Exemplo de uso
const token = 'seu_token_aqui';
const instanceName = 'teste2';
const chatId = '556293557070@s.whatsapp.net';
const column = 'andamento';

moveChatToColumn(instanceName, chatId, column, token);`;

const kanbanPythonCode = `import requests
import json

def move_chat_to_column(instance_name, chat_id, column, token):
    url = f"{process.env.REACT_APP_API_URL}/api/chats/{instance_name}/{chat_id}/kanban-column"
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    data = {
        'column': column
    }
    
    try:
        response = requests.put(url, headers=headers, json=data)
        result = response.json()
        
        if result.get('success'):
            print(f"✅ Chat movido com sucesso: {result['data']}")
        else:
            print(f"❌ Erro ao mover chat: {result.get('error')}")
            
        return result
        
    except Exception as error:
        print(f"❌ Erro na requisição: {error}")
        raise error

# Exemplo de uso
token = "seu_token_aqui"
instance_name = "teste2"
chat_id = "556293557070@s.whatsapp.net"
column = "andamento"

move_chat_to_column(instance_name, chat_id, column, token)`;

const kanbanCurlCode = `# Mover chat para "Em Andamento"
curl -X PUT "\${process.env.REACT_APP_API_URL}/api/chats/teste2/556293557070@s.whatsapp.net/kanban-column" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -d '{"column": "andamento"}'

# Mover chat para "Aprovado"
curl -X PUT "\${process.env.REACT_APP_API_URL}/api/chats/teste2/556293557070@s.whatsapp.net/kanban-column" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -d '{"column": "aprovado"}'`;

const WebhookDocumentation = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState(0);
  const [copiedCode, setCopiedCode] = useState({});

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode({ ...copiedCode, [id]: true });
      toast.success(t('webhookDocs.codeCopied'));
      setTimeout(() => {
        setCopiedCode({ ...copiedCode, [id]: false });
      }, 2000);
    });
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const CodeBlock = ({ code, language = 'json', id, title }) => (
    <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
      {title && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={() => copyToClipboard(code, id)}
            color={copiedCode[id] ? 'success' : 'default'}
          >
            {copiedCode[id] ? <CheckIcon2 /> : <ContentCopyIcon />}
          </IconButton>
        </Box>
      )}
      <Box component="pre" sx={{ 
        backgroundColor: '#2d3748', 
        color: '#e2e8f0', 
        p: 2, 
        borderRadius: 1,
        overflow: 'auto',
        fontSize: '0.875rem',
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        margin: 0
      }}>
        {code}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <WebhookIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('webhookDocs.title')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t('webhookDocs.subtitle')}
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>🚀 {t('webhookDocs.n8nAvailable')}!</AlertTitle>
        {t('webhookDocs.n8nDescription')}
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={t('webhookDocs.tabs.overview')} />
          <Tab label={t('webhookDocs.tabs.configuration')} />
          <Tab label={t('webhookDocs.tabs.events')} />
          <Tab label={t('webhookDocs.tabs.examples')} />
          <Tab label={t('webhookDocs.tabs.sendMessages')} />
          <Tab label={t('webhookDocs.tabs.kanban')} />
          <Tab label={t('webhookDocs.tabs.n8nIntegration')} />
          <Tab label={t('webhookDocs.tabs.troubleshooting')} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {t('webhookDocs.whatAreWebhooks')}
                </Typography>
                <Typography paragraph>
                  {t('webhookDocs.webhooksDescription')}
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  {t('webhookDocs.webhooksAdvantages')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><SpeedIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={t('webhookDocs.realTime')} secondary={t('webhookDocs.realTimeDescription')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={t('webhookDocs.secure')} secondary={t('webhookDocs.secureDescription')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SendIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={t('webhookDocs.efficient')} secondary={t('webhookDocs.efficientDescription')} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fluxo de Webhook
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    1. Evento acontece no WhatsApp
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ↓
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    2. Evolution API envia para nosso sistema
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ↓
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    3. Processamos e enviamos para seu webhook
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ↓
                  </Typography>
                  <Typography variant="body2">
                    4. Sua aplicação recebe os dados
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Configuração Básica
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              1. URL do Webhook
            </Typography>
            <Typography paragraph>
              Configure uma URL pública que receberá os dados via HTTP POST. 
              Sua aplicação deve estar acessível via internet.
            </Typography>

            <CodeBlock 
              code="https://sua-aplicacao.com/webhook/whatsapp"
              language="text"
              id="webhook-url"
              title="Exemplo de URL"
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              2. Endpoint de Recebimento
            </Typography>
            <Typography paragraph>
              Crie um endpoint que aceite requisições POST e processe os dados recebidos.
            </Typography>

            <CodeBlock 
              code={`// Exemplo em Node.js/Express
app.post('/webhook/whatsapp', (req, res) => {
  const { event, data, instanceName, timestamp } = req.body;
  
  console.log('Webhook recebido:', {
    event,
    instanceName,
    timestamp,
    data
  });
  
  // Processar dados aqui
  processWebhookData(event, data);
  
  res.status(200).json({ success: true });
});`}
              language="javascript"
              id="webhook-endpoint"
              title="Exemplo de Endpoint"
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              3. Configuração no Sistema
            </Typography>
            <Typography paragraph>
              Use nossa interface de integração N8N ou configure manualmente via API.
            </Typography>

            <CodeBlock 
              code={`POST /api/n8n-integration
{
  "webhookUrl": "https://sua-aplicacao.com/webhook/whatsapp",
  "webhookSecret": "seu-secret-opcional",
  "instanceName": "sua-instancia",
  "events": {
    "messageUpsert": true,
    "newMessage": true,
    "messageSent": true
  },
  "isActive": true
}`}
              language="json"
              id="webhook-config"
              title="Configuração via API"
            />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h5" gutterBottom>
          Eventos Disponíveis
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📨 Eventos de Mensagem
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>MESSAGES_UPSERT</strong> - Message Upsert (Raw)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      Dados exatos recebidos do Evolution API, sem modificações.
                    </Typography>
                    <Chip label="Payload Original" color="primary" size="small" />
                    <Chip label="Sem Filtros" color="secondary" size="small" sx={{ ml: 1 }} />
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>new-message</strong> - Nova Mensagem</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      Mensagens processadas pelo sistema com dados enriquecidos.
                    </Typography>
                    <Chip label="Processado" color="success" size="small" />
                    <Chip label="Com Filtros" color="info" size="small" sx={{ ml: 1 }} />
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>message-sent</strong> - Mensagem Enviada</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      Quando você envia uma mensagem através do sistema.
                    </Typography>
                    <Chip label="Envio" color="warning" size="small" />
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👥 Eventos de Contato
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>new-contact</strong> - Novo Contato</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      Quando um novo contato é adicionado ao WhatsApp.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>contact-update</strong> - Atualização de Contato</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      Quando informações de um contato são atualizadas.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>chat-update</strong> - Atualização de Chat</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      Quando uma conversa é movida entre colunas do Kanban.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Typography variant="h5" gutterBottom>
          Exemplos Práticos
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>Exemplo 1:</strong> MESSAGES_UPSERT - Payload Original</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CodeBlock 
              code={`{
  "event": "MESSAGES_UPSERT",
  "data": {
    "key": {
      "remoteJid": "556293557070@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D26B4A8F5A6F"
    },
    "message": {
      "conversation": "Olá, como está?"
    },
    "messageTimestamp": 1640995200,
    "status": "RECEIVED"
  },
  "instanceName": "teste2",
  "timestamp": "2025-01-23T15:30:00.000Z",
  "source": "evolution-api"
}`}
              language="json"
              id="example-messages-upsert"
              title="Payload MESSAGES_UPSERT"
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>Exemplo 2:</strong> Nova Mensagem Processada</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CodeBlock 
              code={`{
  "event": "new-message",
  "data": {
    "messageId": "3EB0C767D26B4A8F5A6F",
    "chatId": "556293557070@s.whatsapp.net",
    "content": "Olá, como está?",
    "fromMe": false,
    "timestamp": "2025-01-23T15:30:00.000Z",
    "messageType": "text",
    "contact": {
      "name": "João Silva",
      "phone": "556293557070"
    }
  },
  "instanceName": "teste2",
  "timestamp": "2025-01-23T15:30:00.000Z",
  "source": "evolution-api"
}`}
              language="json"
              id="example-new-message"
              title="Payload Nova Mensagem"
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>Exemplo 3:</strong> Processamento em Python</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CodeBlock 
              code={`from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/webhook/whatsapp', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        
        event = data.get('event')
        instance_name = data.get('instanceName')
        webhook_data = data.get('data')
        
        print(f"Evento recebido: {event}")
        print(f"Instância: {instance_name}")
        print(f"Dados: {json.dumps(webhook_data, indent=2)}")
        
        # Processar baseado no tipo de evento
        if event == 'MESSAGES_UPSERT':
            process_message_upsert(webhook_data)
        elif event == 'new-message':
            process_new_message(webhook_data)
        elif event == 'contact-update':
            process_contact_update(webhook_data)
        
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Erro ao processar webhook: {e}")
        return jsonify({'error': str(e)}), 500

def process_message_upsert(data):
    # Processar dados brutos do Evolution API
    message = data.get('message', {})
    key = data.get('key', {})
    
    print(f"Mensagem recebida de: {key.get('remoteJid')}")
    print(f"Conteúdo: {message.get('conversation', '')}")

def process_new_message(data):
    # Processar mensagem já processada pelo sistema
    content = data.get('content', '')
    contact = data.get('contact', {})
    
    print(f"Nova mensagem de {contact.get('name')}: {content}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)`}
              language="python"
              id="example-python"
              title="Exemplo em Python/Flask"
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>Exemplo 4:</strong> Processamento em Node.js</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CodeBlock 
              code={`const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook/whatsapp', (req, res) => {
  try {
    const { event, data, instanceName, timestamp } = req.body;
    
    console.log(\`Evento recebido: \${event}\`);
    console.log(\`Instância: \${instanceName}\`);
    console.log(\`Timestamp: \${timestamp}\`);
    
    // Processar baseado no tipo de evento
    switch(event) {
      case 'MESSAGES_UPSERT':
        processMessageUpsert(data);
        break;
      case 'new-message':
        processNewMessage(data);
        break;
      case 'contact-update':
        processContactUpdate(data);
        break;
      default:
        console.log(\`Evento não reconhecido: \${event}\`);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

function processMessageUpsert(data) {
  const message = data.message || {};
  const key = data.key || {};
  
  console.log(\`Mensagem recebida de: \${key.remoteJid}\`);
  console.log(\`Conteúdo: \${message.conversation || ''}\`);
}

function processNewMessage(data) {
  const content = data.content || '';
  const contact = data.contact || {};
  
  console.log(\`Nova mensagem de \${contact.name}: \${content}\`);
}

app.listen(3500, () => {
  console.log('Webhook server rodando na porta 3500');
});`}
              language="javascript"
              id="example-nodejs"
              title="Exemplo em Node.js/Express"
            />
          </AccordionDetails>
        </Accordion>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <Typography variant="h5" gutterBottom>
          Envio de Mensagens via API
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>📤 Envio de Mensagens</AlertTitle>
          Você pode enviar mensagens através de instâncias específicas de usuários usando nossa API REST.
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔐 Autenticação
            </Typography>
            <Typography paragraph>
              Para enviar mensagens, você precisa de um token de autenticação válido. 
              Use o token do usuário proprietário da instância.
            </Typography>

            <CodeBlock 
              code={`Authorization: Bearer SEU_TOKEN_AQUI`}
              language="text"
              id="auth-header"
              title="Header de Autenticação"
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Como Obter o Token
            </Typography>
            <Typography paragraph>
              Existem várias formas de obter o token de autenticação:
            </Typography>

            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>1. Via Interface Web (Recomendado)</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  <strong>Passo a passo:</strong>
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Faça login na interface web"
                      secondary={`Acesse ${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3500'}/login`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Abra o DevTools do navegador"
                      secondary="Pressione F12 ou Ctrl+Shift+I"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Vá para a aba 'Application' ou 'Storage'"
                      secondary={`No Chrome: Application → Local Storage → ${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3500'}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="4. Procure pela chave 'token'"
                      secondary="Copie o valor do token"
                    />
                  </ListItem>
                </List>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>💡 Dica</AlertTitle>
                  O token fica salvo no localStorage do navegador após o login.
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>2. Via API de Login</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Faça login via API para obter o token programaticamente:
                </Typography>

                <CodeBlock 
                  code={`// Exemplo em JavaScript
const axios = require('axios');

async function obterToken() {
  try {
    const response = await axios.post(\`\${process.env.REACT_APP_API_URL}/api/auth/login\`, {
      email: 'admin@clerky.com.br',
      password: 'sua_senha_aqui'
    });

    const token = response.data.token;
    console.log('Token obtido:', token);
    return token;
  } catch (error) {
    console.error('Erro no login:', error.response?.data);
  }
}

obterToken();`}
                  language="javascript"
                  id="login-api"
                  title="Login via API"
                />

                <CodeBlock 
                  code={`# Exemplo em Python
import requests

def obter_token():
    url = f"{process.env.REACT_APP_API_URL}/api/auth/login"
    
    payload = {
        'email': 'admin@clerky.com.br',
        'password': 'sua_senha_aqui'
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        token = response.json()['token']
        print('Token obtido:', token)
        return token
    except requests.exceptions.RequestException as e:
        print('Erro no login:', e)

obter_token()`}
                  language="python"
                  id="login-api-python"
                  title="Login via API (Python)"
                />

                <CodeBlock 
                  code={`# Exemplo em cURL
curl -X POST "\${process.env.REACT_APP_API_URL}/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@clerky.com.br",
    "password": "sua_senha_aqui"
  }'`}
                  language="bash"
                  id="login-curl"
                  title="Login via cURL"
                />
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>3. Via Console do Navegador</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Execute este comando no console do navegador (F12 → Console):
                </Typography>

                <CodeBlock 
                  code={`// No console do navegador (F12 → Console)
console.log('Token:', localStorage.getItem('token'));`}
                  language="javascript"
                  id="console-token"
                  title="Obter Token via Console"
                />

                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Resultado:</strong> O token será exibido no console.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>⚠️ Importante</AlertTitle>
              <Typography variant="body2">
                • O token expira após um tempo (geralmente 24h)<br/>
                • Use sempre o token do usuário proprietário da instância<br/>
                • Mantenha o token seguro e não o compartilhe<br/>
                • Para produção, use variáveis de ambiente
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📱 Endpoint de Envio
            </Typography>
            <Typography paragraph>
              Use o endpoint abaixo para enviar mensagens através de uma instância específica:
            </Typography>

            <CodeBlock 
              code={`POST /api/messages/:instanceName/text`}
              language="text"
              id="send-endpoint"
              title="Endpoint de Envio"
            />

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Parâmetros da URL:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary=":instanceName" 
                  secondary="Nome da instância (ex: teste2)" 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Payload de Envio
            </Typography>
            <Typography paragraph>
              Estrutura do corpo da requisição para envio de mensagens:
            </Typography>

            <CodeBlock 
              code={`{
  "number": "556293557070@s.whatsapp.net",
  "text": "Olá! Esta é uma mensagem enviada via API"
}`}
              language="json"
              id="send-payload"
              title="Payload de Envio"
            />

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Campos obrigatórios:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="number" 
                  secondary="Número do destinatário no formato WhatsApp (ex: 556293557070@s.whatsapp.net)" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="text" 
                  secondary="Conteúdo da mensagem de texto a ser enviada" 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Exemplo Prático
            </Typography>
            <Typography paragraph>
              Exemplo completo de como enviar uma mensagem para a instância "teste2" do usuário "admin@clerky.com.br":
            </Typography>

            <CodeBlock 
              code={`// Exemplo em JavaScript/Node.js
const axios = require('axios');

async function enviarMensagem() {
  try {
    const response = await axios.post(
      \`\${process.env.REACT_APP_API_URL}/api/messages/teste2/text\`,
      {
        number: '556293557070@s.whatsapp.net',
        text: 'Olá! Esta mensagem foi enviada via API da instância teste2'
      },
      {
        headers: {
          'Authorization': 'Bearer SEU_TOKEN_DO_USUARIO_ADMIN',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Mensagem enviada:', response.data);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response?.data);
  }
}

enviarMensagem();`}
              language="javascript"
              id="example-send-js"
              title="Exemplo em JavaScript"
            />

            <CodeBlock 
              code={`# Exemplo em Python
import requests

def enviar_mensagem():
    url = f"{process.env.REACT_APP_API_URL}/api/messages/teste2/text"
    
    headers = {
        'Authorization': 'Bearer SEU_TOKEN_DO_USUARIO_ADMIN',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'number': '556293557070@s.whatsapp.net',
        'text': 'Olá! Esta mensagem foi enviada via API da instância teste2'
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print('Mensagem enviada:', response.json())
    except requests.exceptions.RequestException as e:
        print('Erro ao enviar mensagem:', e)

enviar_mensagem()`}
              language="python"
              id="example-send-python"
              title="Exemplo em Python"
            />

            <CodeBlock 
              code={`# Exemplo em cURL
curl -X POST "${process.env.REACT_APP_API_URL}/api/messages/teste2/text" \\
  -H "Authorization: Bearer SEU_TOKEN_DO_USUARIO_ADMIN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "556293557070@s.whatsapp.net",
    "text": "Olá! Esta mensagem foi enviada via API da instância teste2"
  }'`}
              language="bash"
              id="example-send-curl"
              title="Exemplo em cURL"
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📝 Tipo de Mensagem
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>ℹ️ Informação</AlertTitle>
              Este endpoint é específico para envio de mensagens de <strong>texto simples</strong>.
            </Alert>

            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle1" gutterBottom>
                📝 Exemplo de Mensagem de Texto
              </Typography>
              <CodeBlock 
                code={`{
  "number": "556293557070@s.whatsapp.net",
  "text": "Mensagem de texto simples"
}`}
                language="json"
                id="text-message"
                title="Mensagem de Texto"
              />
            </Paper>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✅ Resposta da API
            </Typography>
            <Typography paragraph>
              A API retorna uma resposta de sucesso quando a mensagem é enviada:
            </Typography>

            <CodeBlock 
              code={`{
  "success": true,
  "data": {
    "messageId": "3EB0C767D26B4A8F5A6F",
    "number": "556293557070@s.whatsapp.net",
    "text": "Olá! Esta mensagem foi enviada via API da instância teste2",
    "timestamp": "2025-01-23T15:30:00.000Z",
    "status": "sent"
  },
  "message": "Mensagem enviada com sucesso"
}`}
              language="json"
              id="success-response"
              title="Resposta de Sucesso"
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ❌ Tratamento de Erros
            </Typography>
            <Typography paragraph>
              Possíveis erros e como tratá-los:
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>401 - Não Autorizado</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CodeBlock 
                  code={`{
  "success": false,
  "error": "Token de acesso requerido"
}`}
                  language="json"
                  id="error-401"
                  title="Erro 401"
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Solução:</strong> Verifique se o token de autenticação está correto e válido.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>403 - Acesso Negado</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CodeBlock 
                  code={`{
  "success": false,
  "error": "Usuário não tem permissão para usar esta instância"
}`}
                  language="json"
                  id="error-403"
                  title="Erro 403"
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Solução:</strong> Use o token do usuário proprietário da instância.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>404 - Instância Não Encontrada</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CodeBlock 
                  code={`{
  "success": false,
  "error": "Instância não encontrada"
}`}
                  language="json"
                  id="error-404"
                  title="Erro 404"
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Solução:</strong> Verifique se o nome da instância está correto.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>⚠️ Importante</AlertTitle>
          <Typography variant="body2">
            • Use sempre o token do usuário proprietário da instância<br/>
            • Certifique-se de que a instância está conectada ao WhatsApp<br/>
            • O número de destino deve estar no formato correto (ex: 556293557070@s.whatsapp.net)<br/>
            • Este endpoint é específico para mensagens de texto simples
          </Typography>
        </Alert>
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <Typography variant="h5" gutterBottom>
          Movimentação de Cards no Kanban
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>⚡ Atualização em Tempo Real</AlertTitle>
          Os cards se movem instantaneamente no Kanban quando você usa este webhook. 
          Não é necessário atualizar a página!
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Endpoint
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>PUT</strong> /api/chats/:instanceName/:chatId/kanban-column
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Autenticação
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Header: <code>Authorization: Bearer &lt;token&gt;</code>
                </Typography>

                <Typography variant="h6" gutterBottom>
                  <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Parâmetros
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="instanceName" 
                      secondary="Nome da instância (ex: teste2)" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="chatId" 
                      secondary="ID do chat (ex: 556293557070@s.whatsapp.net)" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="column" 
                      secondary="Coluna de destino no body JSON" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Colunas Válidas
                </Typography>
                <List dense>
                  <ListItem>
                    <Chip label="novo" size="small" color="primary" sx={{ mr: 1 }} />
                    <ListItemText primary="Novo Contato" />
                  </ListItem>
                  <ListItem>
                    <Chip label="andamento" size="small" color="warning" sx={{ mr: 1 }} />
                    <ListItemText primary="Em Andamento" />
                  </ListItem>
                  <ListItem>
                    <Chip label="carrinho" size="small" color="info" sx={{ mr: 1 }} />
                    <ListItemText primary="Carrinho Abandonado" />
                  </ListItem>
                  <ListItem>
                    <Chip label="aprovado" size="small" color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="Aprovado" />
                  </ListItem>
                  <ListItem>
                    <Chip label="reprovado" size="small" color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Reprovado" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Exemplos de Uso
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">JavaScript/Fetch</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                onClick={() => copyToClipboard(kanbanJavaScriptCode, 'kanban-js')}
              >
                {copiedCode['kanban-js'] ? <CheckIcon2 /> : <CopyIcon />}
              </IconButton>
              <CodeBlock code={kanbanJavaScriptCode} language="javascript" />
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Python/Requests</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                onClick={() => copyToClipboard(kanbanPythonCode, 'kanban-python')}
              >
                {copiedCode['kanban-python'] ? <CheckIcon2 /> : <CopyIcon />}
              </IconButton>
              <CodeBlock code={kanbanPythonCode} language="python" />
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">cURL</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                onClick={() => copyToClipboard(kanbanCurlCode, 'kanban-curl')}
              >
                {copiedCode['kanban-curl'] ? <CheckIcon2 /> : <CopyIcon />}
              </IconButton>
              <CodeBlock code={kanbanCurlCode} language="bash" />
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Como Funciona a Atualização em Tempo Real
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔄 Fluxo de Atualização
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Webhook executado" 
                      secondary="Backend atualiza kanbanColumn no banco" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. WebSocket enviado" 
                      secondary="Evento chat-updated para todos os clientes" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Frontend processa" 
                      secondary="Remove chat da coluna atual" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="4. Chat movido" 
                      secondary="Adiciona na nova coluna baseada no kanbanColumn" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="5. Visual atualizado" 
                      secondary="Card aparece na nova posição instantaneamente" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ✅ Benefícios
                </Typography>
                <List dense>
                  <ListItem>
                    <CheckIcon sx={{ mr: 1, color: 'green' }} />
                    <ListItemText primary="Atualização instantânea" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon sx={{ mr: 1, color: 'green' }} />
                    <ListItemText primary="Sem necessidade de refresh" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon sx={{ mr: 1, color: 'green' }} />
                    <ListItemText primary="Sincronização entre usuários" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon sx={{ mr: 1, color: 'green' }} />
                    <ListItemText primary="Preservação de dados" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon sx={{ mr: 1, color: 'green' }} />
                    <ListItemText primary="Mapeamento automático" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Integração N8N Nativa
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>🎉 Nova Funcionalidade!</AlertTitle>
              Agora você pode configurar integrações N8N diretamente na interface do sistema!
            </Alert>

            <Typography variant="h6" gutterBottom>
              Como Usar:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="1. Acesse /n8n-integration no menu lateral"
                  secondary="Navegue até a seção de integrações N8N"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2. Clique em 'Nova Integração'"
                  secondary="Configure sua primeira integração"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3. Configure a URL do webhook N8N"
                  secondary="Ex: https://seu-n8n.com/webhook/abc123"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4. Selecione os eventos desejados"
                  secondary="Escolha quais eventos enviar para o N8N"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5. Teste a integração"
                  secondary="Use o botão de teste para verificar conectividade"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6. Ative quando estiver funcionando"
                  secondary="Sua integração estará ativa e enviando dados"
                />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Recursos Disponíveis:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    🔧 Configuração Individual
                  </Typography>
                  <Typography variant="body2">
                    Cada usuário pode ter suas próprias integrações N8N
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    📡 Eventos Específicos
                  </Typography>
                  <Typography variant="body2">
                    Escolha exatamente quais eventos enviar
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    🎯 Filtros Avançados
                  </Typography>
                  <Typography variant="body2">
                    Configure filtros para controlar os dados enviados
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    📊 Monitoramento
                  </Typography>
                  <Typography variant="body2">
                    Acompanhe estatísticas e status das integrações
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={7}>
        <Typography variant="h5" gutterBottom>
          Troubleshooting
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  ❌ Problemas Comuns
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Webhook não recebe dados</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      <strong>Possíveis causas:</strong>
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="• URL não é acessível publicamente" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Integração não está ativa" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Eventos não estão habilitados" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Firewall bloqueando requisições" />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Erro 500 no webhook</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      <strong>Soluções:</strong>
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="• Verifique logs do seu servidor" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Valide formato dos dados recebidos" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Implemente tratamento de erros" />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success">
                  ✅ Boas Práticas
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Sempre retorne status 200"
                      secondary="Para confirmar recebimento do webhook"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Implemente timeout"
                      secondary="Processe dados de forma assíncrona"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Valide dados recebidos"
                      secondary="Verifique estrutura antes de processar"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Use HTTPS"
                      secondary="Para segurança na transmissão"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Debug e Logs
            </Typography>
            
            <Typography paragraph>
              Para debugar problemas, verifique os logs do sistema:
            </Typography>

            <CodeBlock 
              code={`// Logs do sistema mostram:
📡 N8N: Enviando MESSAGES_UPSERT para N8N: {...}
✅ N8N: Webhook enviado com sucesso para https://seu-webhook.com
❌ N8N: Falha ao enviar webhook: Connection timeout`}
              language="text"
              id="debug-logs"
              title="Exemplo de Logs"
            />

            <Typography paragraph sx={{ mt: 2 }}>
              <strong>Dica:</strong> Use o botão "Testar" na interface de integração 
              para verificar se sua URL está funcionando corretamente.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default WebhookDocumentation;
