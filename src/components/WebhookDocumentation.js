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
                  {t('webhookDocs.webhookFlow')}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('webhookDocs.step1')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ↓
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('webhookDocs.step2')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ↓
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('webhookDocs.step3')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ↓
                  </Typography>
                  <Typography variant="body2">
                    {t('webhookDocs.step4')}
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
              {t('webhookDocs.basicConfiguration')}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              {t('webhookDocs.webhookUrlStep')}
            </Typography>
            <Typography paragraph>
              {t('webhookDocs.webhookUrlDescription')}
            </Typography>

            <CodeBlock 
              code="https://sua-aplicacao.com/webhook/whatsapp"
              language="text"
              id="webhook-url"
              title={t('webhookDocs.urlExample')}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              {t('webhookDocs.receivingEndpoint')}
            </Typography>
            <Typography paragraph>
              {t('webhookDocs.receivingEndpointDescription')}
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
              title={t('webhookDocs.endpointExample')}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              {t('webhookDocs.systemConfiguration')}
            </Typography>
            <Typography paragraph>
              {t('webhookDocs.systemConfigurationDescription')}
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
          {t('webhookDocs.availableEvents')}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📨 {t('webhookDocs.messageEvents')}
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>MESSAGES_UPSERT</strong> - {t('webhookDocs.messageUpsertRaw')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {t('webhookDocs.messageUpsertDescription')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip label={t('webhookDocs.originalPayload')} color="primary" size="small" />
                      <Chip label={t('webhookDocs.noFilters')} color="secondary" size="small" sx={{ ml: 1 }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('webhookDocs.payload')}:
                    </Typography>
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
                      id="event-messages-upsert-payload"
                    />
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>new-message</strong> - {t('webhookDocs.newMessage')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {t('webhookDocs.newMessageDescription')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip label={t('webhookDocs.processed')} color="success" size="small" />
                      <Chip label={t('webhookDocs.withFilters')} color="info" size="small" sx={{ ml: 1 }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('webhookDocs.payload')}:
                    </Typography>
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
                      id="event-new-message-payload"
                    />
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>message-sent</strong> - {t('webhookDocs.messageSent')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {t('webhookDocs.messageSentDescription')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip label={t('webhookDocs.sending')} color="warning" size="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('webhookDocs.payload')}:
                    </Typography>
                    <CodeBlock 
                      code={`{
  "event": "message-sent",
  "data": {
    "messageId": "3EB0C767D26B4A8F5A6F",
    "chatId": "556293557070@s.whatsapp.net",
    "content": "Mensagem enviada com sucesso!",
    "fromMe": true,
    "timestamp": "2025-01-23T15:30:00.000Z",
    "messageType": "text",
    "status": "sent"
  },
  "instanceName": "teste2",
  "timestamp": "2025-01-23T15:30:00.000Z",
  "source": "evolution-api"
}`}
                      language="json"
                      id="event-message-sent-payload"
                    />
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👥 {t('webhookDocs.contactEvents')}
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>new-contact</strong> - {t('webhookDocs.newContact')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {t('webhookDocs.newContactDescription')}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('webhookDocs.payload')}:
                    </Typography>
                    <CodeBlock 
                      code={`{
  "event": "new-contact",
  "data": {
    "chatId": "556293557070@s.whatsapp.net",
    "name": "João Silva",
    "phone": "556293557070",
    "isGroup": false,
    "timestamp": "2025-01-23T15:30:00.000Z"
  },
  "instanceName": "teste2",
  "timestamp": "2025-01-23T15:30:00.000Z",
  "source": "evolution-api"
}`}
                      language="json"
                      id="event-new-contact-payload"
                    />
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>contact-update</strong> - {t('webhookDocs.contactUpdate')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {t('webhookDocs.contactUpdateDescription')}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('webhookDocs.payload')}:
                    </Typography>
                    <CodeBlock 
                      code={`{
  "event": "contact-update",
  "data": {
    "chatId": "556293557070@s.whatsapp.net",
    "oldName": "João",
    "newName": "João Silva",
    "phone": "556293557070",
    "timestamp": "2025-01-23T15:30:00.000Z"
  },
  "instanceName": "teste2",
  "timestamp": "2025-01-23T15:30:00.000Z",
  "source": "evolution-api"
}`}
                      language="json"
                      id="event-contact-update-payload"
                    />
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography><strong>chat-update</strong> - {t('webhookDocs.chatUpdate')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {t('webhookDocs.chatUpdateDescription')}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('webhookDocs.payload')}:
                    </Typography>
                    <CodeBlock 
                      code={`{
  "event": "chat-update",
  "data": {
    "chatId": "556293557070@s.whatsapp.net",
    "updateType": "kanban-move",
    "oldColumn": "novo",
    "newColumn": "andamento",
    "timestamp": "2025-01-23T15:30:00.000Z"
  },
  "instanceName": "teste2",
  "timestamp": "2025-01-23T15:30:00.000Z",
  "source": "evolution-api"
}`}
                      language="json"
                      id="event-chat-update-payload"
                    />
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Typography variant="h5" gutterBottom>
          {t('webhookDocs.practicalExamples')}
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>{t('webhookDocs.example1')}:</strong> MESSAGES_UPSERT - {t('webhookDocs.originalPayload')}</Typography>
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
              title={t('webhookDocs.payloadMessagesUpsert')}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>{t('webhookDocs.example2')}:</strong> {t('webhookDocs.newMessageProcessed')}</Typography>
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
              title={t('webhookDocs.payloadNewMessage')}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>{t('webhookDocs.example3')}:</strong> {t('webhookDocs.processingInPython')}</Typography>
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
              title={t('webhookDocs.exampleInPythonFlask')}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><strong>{t('webhookDocs.example4')}:</strong> {t('webhookDocs.processingInNodejs')}</Typography>
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
              title={t('webhookDocs.exampleInNodejsExpress')}
            />
          </AccordionDetails>
        </Accordion>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <Typography variant="h5" gutterBottom>
          {t('webhookDocs.sendMessagesViaAPI')}
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>📤 {t('webhookDocs.sendMessages')}</AlertTitle>
          {t('webhookDocs.sendMessagesDescription')}
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔐 {t('webhookDocs.authentication')}
            </Typography>
            <Typography paragraph>
              {t('webhookDocs.authenticationDescription')}
            </Typography>

            <CodeBlock 
              code={`Authorization: Bearer SEU_TOKEN_AQUI`}
              language="text"
              id="auth-header"
              title={t('webhookDocs.authenticationHeader')}
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 {t('webhookDocs.howToGetToken')}
            </Typography>
            <Typography paragraph>
              {t('webhookDocs.howToGetTokenDescription')}
            </Typography>

            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>{t('webhookDocs.viaWebInterface')}</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  <strong>{t('webhookDocs.stepByStep')}:</strong>
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary={t('webhookDocs.step1Login')}
                      secondary={`${t('webhookDocs.access')} ${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3500'}/login`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={t('webhookDocs.step2DevTools')}
                      secondary={t('webhookDocs.step2DevToolsDescription')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={t('webhookDocs.step3Application')}
                      secondary={`${t('webhookDocs.step3Chrome')}: Application → Local Storage → ${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3500'}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={t('webhookDocs.step4Token')}
                      secondary={t('webhookDocs.step4TokenDescription')}
                    />
                  </ListItem>
                </List>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>💡 {t('webhookDocs.tip')}</AlertTitle>
                  {t('webhookDocs.tokenSaved')}
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>{t('webhookDocs.viaLoginAPI')}</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {t('webhookDocs.loginViaAPIDescription')}
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
                  title={t('webhookDocs.loginViaCurl')}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><strong>{t('webhookDocs.viaBrowserConsole')}</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {t('webhookDocs.executeInConsole')}
                </Typography>

                <CodeBlock 
                  code={`// No console do navegador (F12 → Console)
console.log('Token:', localStorage.getItem('token'));`}
                  language="javascript"
                  id="console-token"
                  title={t('webhookDocs.getTokenViaConsole')}
                />

                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>{t('webhookDocs.result')}:</strong> {t('webhookDocs.tokenWillBeDisplayed')}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>⚠️ {t('webhookDocs.important')}</AlertTitle>
              <Typography variant="body2">
                • {t('webhookDocs.tokenExpires')}<br/>
                • {t('webhookDocs.useInstanceOwnerToken')}<br/>
                • {t('webhookDocs.keepTokenSecure')}<br/>
                • {t('webhookDocs.useEnvironmentVariables')}
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📱 {t('webhookDocs.sendEndpoint')}
            </Typography>
            <Typography paragraph>
              {t('webhookDocs.sendEndpointDescription')}
            </Typography>

            <CodeBlock 
              code={`POST /api/messages/:instanceName/text`}
              language="text"
              id="send-endpoint"
              title={t('webhookDocs.sendEndpoint')}
            />

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              {t('webhookDocs.urlParameters')}:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary=":instanceName" 
                  secondary={t('webhookDocs.instanceNameDescription')}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 {t('webhookDocs.sendPayload')}
            </Typography>
            <Typography paragraph>
              {t('webhookDocs.sendPayloadDescription')}
            </Typography>

            <CodeBlock 
              code={`{
  "number": "556293557070@s.whatsapp.net",
  "text": "Olá! Esta é uma mensagem enviada via API"
}`}
              language="json"
              id="send-payload"
              title={t('webhookDocs.sendPayload')}
            />

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              {t('webhookDocs.requiredFields')}:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="number" 
                  secondary={t('webhookDocs.numberDescription')} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="text" 
                  secondary={t('webhookDocs.textDescription')} 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 {t('webhookDocs.practicalExample')}
            </Typography>
            <Typography paragraph>
              {t('webhookDocs.practicalExampleDescription')}
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
          {t('webhookDocs.kanbanCardMovement')}
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>⚡ {t('webhookDocs.realTimeUpdate')}</AlertTitle>
          {t('webhookDocs.realTimeUpdateDescription')}
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('webhookDocs.endpoint')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>PUT</strong> /api/chats/:instanceName/:chatId/kanban-column
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('webhookDocs.authentication')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Header: <code>Authorization: Bearer &lt;token&gt;</code>
                </Typography>

                <Typography variant="h6" gutterBottom>
                  <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('webhookDocs.parameters')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="instanceName" 
                      secondary={t('webhookDocs.instanceNameDescription')} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="chatId" 
                      secondary={t('webhookDocs.chatIdDescription')} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="column" 
                      secondary={t('webhookDocs.columnDescription')} 
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
                  {t('webhookDocs.validColumns')}
                </Typography>
                <List dense>
                  <ListItem>
                    <Chip label="novo" size="small" color="primary" sx={{ mr: 1 }} />
                    <ListItemText primary={t('webhookDocs.newContact')} />
                  </ListItem>
                  <ListItem>
                    <Chip label="andamento" size="small" color="warning" sx={{ mr: 1 }} />
                    <ListItemText primary={t('webhookDocs.inProgress')} />
                  </ListItem>
                  <ListItem>
                    <Chip label="carrinho" size="small" color="info" sx={{ mr: 1 }} />
                    <ListItemText primary={t('webhookDocs.abandonedCart')} />
                  </ListItem>
                  <ListItem>
                    <Chip label="aprovado" size="small" color="success" sx={{ mr: 1 }} />
                    <ListItemText primary={t('webhookDocs.approved')} />
                  </ListItem>
                  <ListItem>
                    <Chip label="reprovado" size="small" color="error" sx={{ mr: 1 }} />
                    <ListItemText primary={t('webhookDocs.rejected')} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          {t('webhookDocs.usageExamples')}
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
              {t('webhookDocs.nativeN8nIntegration')}
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>🎉 {t('webhookDocs.newFeature')}!</AlertTitle>
              {t('webhookDocs.newFeatureDescription')}
            </Alert>

            <Typography variant="h6" gutterBottom>
              {t('webhookDocs.howToUse')}:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary={t('webhookDocs.step1Access')}
                  secondary={t('webhookDocs.step1AccessDescription')}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={t('webhookDocs.step2Click')}
                  secondary={t('webhookDocs.step2ClickDescription')}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={t('webhookDocs.step3Configure')}
                  secondary={t('webhookDocs.step3ConfigureDescription')}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={t('webhookDocs.step4Select')}
                  secondary={t('webhookDocs.step4SelectDescription')}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={t('webhookDocs.step5Test')}
                  secondary={t('webhookDocs.step5TestDescription')}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={t('webhookDocs.step6Activate')}
                  secondary={t('webhookDocs.step6ActivateDescription')}
                />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              {t('webhookDocs.availableResources')}:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    🔧 {t('webhookDocs.individualConfiguration')}
                  </Typography>
                  <Typography variant="body2">
                    {t('webhookDocs.individualConfigurationDescription')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    📡 {t('webhookDocs.specificEvents')}
                  </Typography>
                  <Typography variant="body2">
                    {t('webhookDocs.specificEventsDescription')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    🎯 {t('webhookDocs.advancedFilters')}
                  </Typography>
                  <Typography variant="body2">
                    {t('webhookDocs.advancedFiltersDescription')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    📊 {t('webhookDocs.monitoring')}
                  </Typography>
                  <Typography variant="body2">
                    {t('webhookDocs.monitoringDescription')}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={7}>
        <Typography variant="h5" gutterBottom>
          {t('webhookDocs.troubleshooting')}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  ❌ {t('webhookDocs.commonProblems')}
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{t('webhookDocs.webhookNotReceivingData')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      <strong>{t('webhookDocs.possibleCauses')}:</strong>
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary={`• ${t('webhookDocs.urlNotPubliclyAccessible')}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={`• ${t('webhookDocs.integrationNotActive')}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={`• ${t('webhookDocs.eventsNotEnabled')}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={`• ${t('webhookDocs.firewallBlockingRequests')}`} />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{t('webhookDocs.error500InWebhook')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      <strong>{t('webhookDocs.solutions')}:</strong>
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary={`• ${t('webhookDocs.checkServerLogs')}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={`• ${t('webhookDocs.validateDataFormat')}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary={`• ${t('webhookDocs.implementErrorHandling')}`} />
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
                  ✅ {t('webhookDocs.goodPractices')}
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary={t('webhookDocs.alwaysReturnStatus200')}
                      secondary={t('webhookDocs.alwaysReturnStatus200Description')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary={t('webhookDocs.implementTimeout')}
                      secondary={t('webhookDocs.implementTimeoutDescription')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary={t('webhookDocs.validateReceivedData')}
                      secondary={t('webhookDocs.validateReceivedDataDescription')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary={t('webhookDocs.useHTTPS')}
                      secondary={t('webhookDocs.useHTTPSDescription')}
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
              🔍 {t('webhookDocs.debugAndLogs')}
            </Typography>
            
            <Typography paragraph>
              {t('webhookDocs.debugAndLogsDescription')}
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
