// English translations
export const en = {
  // Auth
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    loginTitle: 'Sign in to access your account',
    registerTitle: 'Create Account',
    registerSubtitle: 'Register to access the WhatsApp system',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    registerHere: 'Register here',
    goToLogin: 'Sign in',
    createAccount: 'Create Account',
    allFieldsRequired: 'All fields are required',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordsNotMatch: 'Passwords do not match',
    loginSuccess: 'Login successful!',
    registerSuccess: 'Registration successful!',
    loginError: 'Login error',
    registerError: 'Registration error',
    logoutSuccess: 'Logout successful!',
    secureSystem: 'Secure system with administrative approval',
    accountApproval: 'Your account has been created successfully and is awaiting administrator approval.',
    approvalNotification: 'You will receive an email notification when your account is approved.',
    afterApproval: 'After approval, you will be able to login and start using the system.',
    goToLoginButton: 'Go to Login',
    accountNeedsApproval: 'Your account will need to be approved by an administrator before it can be used.',
    passwordStrength: 'Password strength',
    passwordWeak: 'Weak',
    passwordRegular: 'Regular',
    passwordGood: 'Good',
    passwordStrong: 'Strong'
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    instances: 'Connection Manager',
    chat: 'Chat',
    kanban: 'Kanban',
    contacts: 'Contacts',
    campaigns: 'Mass Dispatch',
    analytics: 'Analytics',
    settings: 'Settings',
    admin: 'Admin',
    webhooks: 'N8N Integrations',
    documentation: 'Webhook Documentation',
    home: 'Home'
  },

  // Home Page
  home: {
    title: 'Connection Manager',
    subtitle: 'Complete platform for managing multiple WhatsApp Business instances with Evolution API',
    manageConnections: 'Manage Connections',
    openChat: 'Open Chat',
    mainFeatures: 'Main Features',
    featuresDescription: 'Discover all the features that make this platform the best choice for your business',
    quickAccess: 'Quick Access to Instances',
    stats: {
      activeInstances: 'Active Instances',
      totalInstances: 'Total Instances',
      disconnected: 'Disconnected',
      connecting: 'Connecting'
    },
    features: {
      whatsappConnections: {
        title: 'WhatsApp Connections',
        description: 'Manage multiple WhatsApp Business instances centrally'
      },
      advancedDashboard: {
        title: 'Advanced Dashboard',
        description: 'Monitor metrics, statistics and real-time performance'
      },
      integratedCrm: {
        title: 'Integrated CRM',
        description: 'Kanban system for lead management and sales pipeline'
      },
      highPerformance: {
        title: 'High Performance',
        description: 'Fast message processing with real-time WebSocket'
      },
      security: {
        title: 'Security',
        description: 'Secure connections and protected data with advanced encryption'
      },
      support247: {
        title: '24/7 Support',
        description: 'Complete technical assistance and detailed documentation'
      }
    }
  },

  // WhatsApp
  whatsapp: {
    title: 'WhatsApp Web',
    loadingInstance: 'Loading instance...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting'
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    open: 'Open',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm'
  },

  // App
  app: {
    name: 'Clerky CRM v1.0'
  },

  // Instance Manager
  instanceManager: {
    title: 'Connection Manager',
    subtitle: 'Manage your WhatsApp Business instances',
    addInstance: 'Add Instance',
    refresh: 'Refresh',
    instanceName: 'Instance Name',
    status: 'Status',
    actions: 'Actions',
    connect: 'Connect',
    disconnect: 'Disconnect',
    restart: 'Restart',
    delete: 'Delete',
    qrCode: 'QR Code',
    token: 'Token',
    copyToken: 'Copy Token',
    tokenCopied: 'Token copied!',
    createInstance: 'Create Instance',
    cancel: 'Cancel',
    instanceCreated: 'Instance created successfully!',
    instanceDeleted: 'Instance deleted successfully!',
    instanceConnected: 'Instance connected successfully!',
    instanceDisconnected: 'Instance disconnected successfully!',
    instanceRestarted: 'Instance restarted successfully!',
    confirmDelete: 'Are you sure you want to delete this instance?',
    noInstances: 'No instances found',
    createFirstInstance: 'Create your first instance to get started'
  },

  // Mass Dispatch
  massDispatch: {
    title: 'Mass Dispatch',
    subtitle: 'Send messages to multiple contacts',
    selectInstance: 'Select Instance',
    message: 'Message',
    contacts: 'Contacts',
    addContact: 'Add Contact',
    removeContact: 'Remove Contact',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    sent: 'Sent',
    failed: 'Failed',
    totalContacts: 'Total Contacts',
    successRate: 'Success Rate',
    messageSent: 'Message sent successfully!',
    messageFailed: 'Failed to send message',
    noContacts: 'No contacts added',
    addAtLeastOneContact: 'Add at least one contact'
  },

  // N8N Integration
  n8nIntegration: {
    title: 'N8N Integrations',
    subtitle: 'Configure integrations with N8N',
    addIntegration: 'Add Integration',
    webhookUrl: 'Webhook URL',
    webhookSecret: 'Webhook Secret',
    isActive: 'Active',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    test: 'Test',
    integrationCreated: 'Integration created successfully!',
    integrationUpdated: 'Integration updated successfully!',
    integrationDeleted: 'Integration deleted successfully!',
    integrationTested: 'Integration tested successfully!',
    noIntegrations: 'No integrations found',
    createFirstIntegration: 'Create your first integration'
  },

  // Webhook Documentation
  webhookDocs: {
    title: 'Webhook Documentation',
    subtitle: 'Complete webhook integration guide',
    overview: 'Overview',
    authentication: 'Authentication',
    events: 'Events',
    examples: 'Examples',
    testing: 'Testing',
    webhookUrl: 'Webhook URL',
    webhookSecret: 'Webhook Secret',
    eventTypes: 'Event Types',
    payload: 'Payload',
    response: 'Response',
    statusCodes: 'Status Codes',
    rateLimiting: 'Rate Limiting',
    security: 'Security',
    troubleshooting: 'Troubleshooting'
  }
};
