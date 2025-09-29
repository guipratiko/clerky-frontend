// Portuguese translations
export const pt = {
  // Auth
  auth: {
    login: 'Entrar',
    register: 'Registrar',
    logout: 'Sair',
    email: 'Email',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    name: 'Nome Completo',
    loginTitle: 'Faça login para acessar sua conta',
    registerTitle: 'Criar Conta',
    registerSubtitle: 'Registre-se para acessar o sistema WhatsApp',
    noAccount: 'Não tem uma conta?',
    hasAccount: 'Já tem uma conta?',
    registerHere: 'Registre-se aqui',
    goToLogin: 'Faça login',
    createAccount: 'Criar Conta',
    allFieldsRequired: 'Todos os campos são obrigatórios',
    nameRequired: 'Nome é obrigatório',
    emailRequired: 'Email é obrigatório',
    emailInvalid: 'Email inválido',
    passwordRequired: 'Senha é obrigatória',
    passwordMinLength: 'Senha deve ter pelo menos 6 caracteres',
    passwordsNotMatch: 'Senhas não coincidem',
    loginSuccess: 'Login realizado com sucesso!',
    registerSuccess: 'Registro realizado com sucesso!',
    loginError: 'Erro ao fazer login',
    registerError: 'Erro ao fazer registro',
    logoutSuccess: 'Logout realizado com sucesso!',
    secureSystem: 'Sistema seguro com aprovação administrativa',
    accountApproval: 'Sua conta foi criada com sucesso e está aguardando aprovação do administrador.',
    approvalNotification: 'Você receberá uma notificação por email quando sua conta for aprovada.',
    afterApproval: 'Após a aprovação, você poderá fazer login e começar a usar o sistema.',
    goToLoginButton: 'Ir para Login',
    accountNeedsApproval: 'Sua conta precisará ser aprovada por um administrador antes de poder ser utilizada.',
    passwordStrength: 'Força da senha',
    passwordWeak: 'Fraca',
    passwordRegular: 'Regular',
    passwordGood: 'Boa',
    passwordStrong: 'Forte'
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    instances: 'Gerenciador de Conexões',
    chat: 'Chat',
    kanban: 'Kanban',
    contacts: 'Contatos',
    campaigns: 'Disparo em Massa',
    analytics: 'Analytics',
    settings: 'Configurações',
    admin: 'Admin',
    webhooks: 'Integrações N8N',
    documentation: 'Documentação de Webhooks',
    home: 'Início'
  },

  // Home Page
  home: {
    title: 'Gerenciador de Conexões',
    subtitle: 'Plataforma completa para gerenciamento de múltiplas instâncias WhatsApp Business com Evolution API',
    manageConnections: 'Gerenciar Conexões',
    openChat: 'Abrir Chat',
    mainFeatures: 'Recursos Principais',
    featuresDescription: 'Descubra todas as funcionalidades que fazem desta plataforma a melhor escolha para seu negócio',
    quickAccess: 'Acesso Rápido às Instâncias',
    stats: {
      activeInstances: 'Instâncias Ativas',
      totalInstances: 'Total de Instâncias',
      disconnected: 'Desconectadas',
      connecting: 'Conectando'
    },
    features: {
      whatsappConnections: {
        title: 'Conexões WhatsApp',
        description: 'Gerencie múltiplas instâncias do WhatsApp Business de forma centralizada'
      },
      advancedDashboard: {
        title: 'Dashboard Avançado',
        description: 'Monitore métricas, estatísticas e performance em tempo real'
      },
      integratedCrm: {
        title: 'CRM Integrado',
        description: 'Sistema Kanban para gestão de leads e pipeline de vendas'
      },
      highPerformance: {
        title: 'Alta Performance',
        description: 'Processamento rápido de mensagens com WebSocket em tempo real'
      },
      security: {
        title: 'Segurança',
        description: 'Conexões seguras e dados protegidos com criptografia avançada'
      },
      support247: {
        title: 'Suporte 24/7',
        description: 'Assistência técnica completa e documentação detalhada'
      }
    }
  },

  // WhatsApp
  whatsapp: {
    title: 'WhatsApp Web',
    loadingInstance: 'Carregando instância...',
    connected: 'Conectado',
    disconnected: 'Desconectado',
    connecting: 'Conectando'
  },

  // Common
  common: {
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Informação',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    search: 'Buscar',
    filter: 'Filtrar',
    refresh: 'Atualizar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    close: 'Fechar',
    open: 'Abrir',
    yes: 'Sim',
    no: 'Não',
    confirm: 'Confirmar'
  },

  // App
  app: {
    name: 'Clerky CRM v1.0'
  },

  // Instance Manager
  instanceManager: {
    title: 'Gerenciador de Conexões',
    subtitle: 'Gerencie suas instâncias do WhatsApp Business',
    addInstance: 'Adicionar Instância',
    refresh: 'Atualizar',
    instanceName: 'Nome da Instância',
    status: 'Status',
    actions: 'Ações',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    restart: 'Reiniciar',
    delete: 'Excluir',
    qrCode: 'QR Code',
    token: 'Token',
    copyToken: 'Copiar Token',
    tokenCopied: 'Token copiado!',
    createInstance: 'Criar Instância',
    cancel: 'Cancelar',
    instanceCreated: 'Instância criada com sucesso!',
    instanceDeleted: 'Instância excluída com sucesso!',
    instanceConnected: 'Instância conectada com sucesso!',
    instanceDisconnected: 'Instância desconectada com sucesso!',
    instanceRestarted: 'Instância reiniciada com sucesso!',
    confirmDelete: 'Tem certeza que deseja excluir esta instância?',
    noInstances: 'Nenhuma instância encontrada',
    createFirstInstance: 'Crie sua primeira instância para começar'
  },

    // Mass Dispatch
    massDispatch: {
      title: 'Disparo em Massa',
      subtitle: 'Envie mensagens para múltiplos contatos',
      selectInstance: 'Selecionar Instância',
      message: 'Mensagem',
      contacts: 'Contatos',
      addContact: 'Adicionar Contato',
      removeContact: 'Remover Contato',
      sendMessage: 'Enviar Mensagem',
      sending: 'Enviando...',
      sent: 'Enviado',
      failed: 'Falhou',
      totalContacts: 'Total de Contatos',
      successRate: 'Taxa de Sucesso',
      messageSent: 'Mensagem enviada com sucesso!',
      messageFailed: 'Falha ao enviar mensagem',
      noContacts: 'Nenhum contato adicionado',
      addAtLeastOneContact: 'Adicione pelo menos um contato',
      status: {
        draft: 'Rascunho',
        validating: 'Validando',
        ready: 'Pronto',
        running: 'Executando',
        paused: 'Pausado',
        completed: 'Concluído',
        cancelled: 'Cancelado'
      },
      schedule: {
        start: 'Início',
        pause: 'Pausa',
        resume: 'Retorno',
        timeRemaining: 'Faltam',
        startSending: 'Início do Envio',
        startDate: 'Data de Início'
      },
      progress: {
        label: 'Progresso'
      },
      stats: {
        title: 'Estatísticas',
        total: 'Total',
        sent: 'Enviadas',
        failed: 'Falhas',
        pending: 'Pendentes'
      },
      form: {
        numbers: 'Números (um por linha)',
        enableScheduling: 'Ativar agendamento',
        cancel: 'Cancelar',
        createDispatch: 'Criar Disparo'
      },
      // Mensagens de sucesso
      dispatchCreated: 'Disparo criado com sucesso!',
      dispatchStarted: 'Disparo iniciado!',
      dispatchPaused: 'Disparo pausado!',
      dispatchResumed: 'Disparo retomado!',
      dispatchCancelled: 'Disparo cancelado!',
      dispatchDeleted: 'Disparo deletado!',
      scheduledDispatchStarted: 'Disparo agendado iniciado!',
      scheduledDispatchCancelled: 'Disparo agendado cancelado!',
      templateCreated: 'Template criado com sucesso!',
      templateDeleted: 'Template excluído com sucesso!',
      // Mensagens de erro
      dispatchCreateError: 'Erro ao criar disparo',
      dispatchStartError: 'Erro ao iniciar disparo',
      dispatchPauseError: 'Erro ao pausar disparo',
      dispatchResumeError: 'Erro ao retomar disparo',
      dispatchCancelError: 'Erro ao cancelar disparo',
      dispatchDeleteError: 'Erro ao deletar disparo',
      scheduledDispatchNotFound: 'Disparo agendado não encontrado',
      scheduledDispatchTimeError: 'Disparo agendado para {time}. Faltam {hours}h {minutes}min.',
      scheduledDispatchStartError: 'Erro ao iniciar disparo agendado',
      scheduledDispatchCancelError: 'Erro ao cancelar disparo agendado',
      templateCreateError: 'Erro ao criar template',
      templateDeleteError: 'Erro ao excluir template',
      // Confirmações
      confirmCancelScheduled: 'Tem certeza que deseja cancelar este disparo agendado?',
      confirmCancelDispatch: 'Tem certeza que deseja cancelar este disparo?',
      confirmDeleteDispatch: 'Tem certeza que deseja deletar este disparo?',
      confirmDeleteTemplate: 'Tem certeza que deseja excluir este template?',
      // Interface
      deleteTemplate: 'Excluir template',
      noDescription: 'Sem descrição',
      numbers: 'números',
      waiting: 'Aguardando',
      start: 'Iniciar',
      pause: 'Pausar',
      resume: 'Retomar',
      // Tipos de template
      templateTypes: {
        text: 'Texto',
        image: 'Imagem',
        imageCaption: 'Imagem + Legenda',
        audio: 'Áudio',
        file: 'Arquivo',
        fileCaption: 'Arquivo + Legenda',
        unknown: 'Desconhecido'
      }
    },

  // N8N Integration
  n8nIntegration: {
    title: 'Integrações N8N',
    subtitle: 'Configure integrações com N8N',
    addIntegration: 'Adicionar Integração',
    webhookUrl: 'URL do Webhook',
    webhookSecret: 'Segredo do Webhook',
    isActive: 'Ativo',
    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Excluir',
    test: 'Testar',
    integrationCreated: 'Integração criada com sucesso!',
    integrationUpdated: 'Integração atualizada com sucesso!',
    integrationDeleted: 'Integração excluída com sucesso!',
    integrationTested: 'Integração testada com sucesso!',
    testFailed: 'Teste falhou',
    noIntegrations: 'Nenhuma integração N8N configurada',
    createFirstIntegration: 'Criar Primeira Integração',
    newIntegration: 'Nova Integração N8N',
    editIntegration: 'Editar Integração N8N',
    tabs: {
      basic: 'Configuração Básica',
      events: 'Eventos',
      filters: 'Filtros',
      advanced: 'Configurações Avançadas'
    },
    // Mensagens adicionais
    testMessage: 'Teste de integração N8N',
    integrationToggled: 'Integração {status} com sucesso!',
    activated: 'ativada',
    deactivated: 'desativada',
    integrationDeleteError: 'Erro ao deletar integração',
    integrationTestError: 'Erro ao testar integração',
    integrationToggleError: 'Erro ao alterar status da integração',
    // Interface
    allInstances: 'Todas as Instâncias',
    activate: 'Ativar',
    deactivate: 'Desativar',
    active: 'Ativa',
    inactive: 'Inativa',
    webhook: 'Webhook',
    lastTest: 'Último Teste',
    webhooksSent: 'Webhooks Enviados',
    // Labels de eventos
    eventLabels: {
      newMessage: 'Nova Mensagem',
      messageSent: 'Mensagem Enviada',
      messageUpsert: 'Message Upsert',
      newContact: 'Novo Contato',
      contactUpdate: 'Contato Update',
      chatUpdate: 'Chat Update',
      connectionUpdate: 'Conexão Update',
      qrCodeUpdate: 'QR Code Update'
    }
  },

  // Webhook Documentation
  webhookDocs: {
    title: 'Documentação de Webhooks',
    subtitle: 'Guia completo de integração via webhooks',
    overview: 'Visão Geral',
    authentication: 'Autenticação',
    events: 'Eventos',
    examples: 'Exemplos',
    testing: 'Testando',
    webhookUrl: 'URL do Webhook',
    webhookSecret: 'Segredo do Webhook',
    eventTypes: 'Tipos de Eventos',
    payload: 'Payload',
    response: 'Resposta',
    statusCodes: 'Códigos de Status',
    rateLimiting: 'Limitação de Taxa',
    security: 'Segurança',
    troubleshooting: 'Solução de Problemas',
    codeCopied: 'Código copiado!',
    tabs: {
      overview: 'Visão Geral',
      configuration: 'Configuração',
      events: 'Eventos',
      examples: 'Exemplos',
      sendMessages: 'Envio de Mensagens',
      kanban: 'Kanban',
      n8nIntegration: 'N8N Integration',
      troubleshooting: 'Troubleshooting'
    },
    // Conteúdo adicional
    n8nAvailable: 'Integração N8N Disponível',
    n8nDescription: 'Agora você pode configurar integrações N8N diretamente na interface! Acesse /n8n-integration para configurar webhooks automáticos.',
    whatAreWebhooks: 'O que são Webhooks?',
    webhooksDescription: 'Webhooks são uma forma de comunicação em tempo real entre aplicações. Quando algo acontece em nossa plataforma (como uma nova mensagem), enviamos automaticamente os dados para sua aplicação via HTTP POST.',
    webhooksAdvantages: 'Vantagens dos Webhooks:',
    realTime: 'Tempo Real',
    realTimeDescription: 'Receba dados instantaneamente quando eventos acontecem',
    secure: 'Seguro',
    secureDescription: 'Comunicação direta entre servidores, sem exposição pública',
    efficient: 'Eficiente',
    efficientDescription: 'Não precisa fazer polling constante para verificar mudanças'
  }
};
