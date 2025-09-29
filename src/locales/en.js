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
      addAtLeastOneContact: 'Add at least one contact',
      status: {
        draft: 'Draft',
        validating: 'Validating',
        ready: 'Ready',
        running: 'Running',
        paused: 'Paused',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      schedule: {
        start: 'Start',
        pause: 'Pause',
        resume: 'Resume',
        timeRemaining: 'Time remaining',
        startSending: 'Start Sending',
        startDate: 'Start Date'
      },
      progress: {
        label: 'Progress'
      },
      stats: {
        title: 'Statistics',
        total: 'Total',
        sent: 'Sent',
        failed: 'Failed',
        pending: 'Pending'
      },
      form: {
        numbers: 'Numbers (one per line)',
        enableScheduling: 'Enable scheduling',
        cancel: 'Cancel',
        createDispatch: 'Create Dispatch'
      },
      // Success messages
      dispatchCreated: 'Dispatch created successfully!',
      dispatchStarted: 'Dispatch started!',
      dispatchPaused: 'Dispatch paused!',
      dispatchResumed: 'Dispatch resumed!',
      dispatchCancelled: 'Dispatch cancelled!',
      dispatchDeleted: 'Dispatch deleted!',
      scheduledDispatchStarted: 'Scheduled dispatch started!',
      scheduledDispatchCancelled: 'Scheduled dispatch cancelled!',
      templateCreated: 'Template created successfully!',
      templateDeleted: 'Template deleted successfully!',
      // Error messages
      dispatchCreateError: 'Error creating dispatch',
      dispatchStartError: 'Error starting dispatch',
      dispatchPauseError: 'Error pausing dispatch',
      dispatchResumeError: 'Error resuming dispatch',
      dispatchCancelError: 'Error cancelling dispatch',
      dispatchDeleteError: 'Error deleting dispatch',
      scheduledDispatchNotFound: 'Scheduled dispatch not found',
      scheduledDispatchTimeError: 'Dispatch scheduled for {time}. {hours}h {minutes}min remaining.',
      scheduledDispatchStartError: 'Error starting scheduled dispatch',
      scheduledDispatchCancelError: 'Error cancelling scheduled dispatch',
      templateCreateError: 'Error creating template',
      templateDeleteError: 'Error deleting template',
      // Confirmations
      confirmCancelScheduled: 'Are you sure you want to cancel this scheduled dispatch?',
      confirmCancelDispatch: 'Are you sure you want to cancel this dispatch?',
      confirmDeleteDispatch: 'Are you sure you want to delete this dispatch?',
      confirmDeleteTemplate: 'Are you sure you want to delete this template?',
      // Interface
      deleteTemplate: 'Delete template',
      noDescription: 'No description',
      numbers: 'numbers',
      waiting: 'Waiting',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      // Template types
      templateTypes: {
        text: 'Text',
        image: 'Image',
        imageCaption: 'Image + Caption',
        audio: 'Audio',
        file: 'File',
        fileCaption: 'File + Caption',
        unknown: 'Unknown'
      }
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
    testFailed: 'Test failed',
    noIntegrations: 'No N8N integrations configured',
    createFirstIntegration: 'Create First Integration',
    newIntegration: 'New N8N Integration',
    editIntegration: 'Edit N8N Integration',
    tabs: {
      basic: 'Basic Configuration',
      events: 'Events',
      filters: 'Filters',
      advanced: 'Advanced Settings'
    },
    // Additional messages
    testMessage: 'N8N integration test',
    integrationToggled: 'Integration {status} successfully!',
    activated: 'activated',
    deactivated: 'deactivated',
    integrationDeleteError: 'Error deleting integration',
    integrationTestError: 'Error testing integration',
    integrationToggleError: 'Error changing integration status',
    // Interface
    allInstances: 'All Instances',
    activate: 'Activate',
    deactivate: 'Deactivate',
    active: 'Active',
    inactive: 'Inactive',
    webhook: 'Webhook',
    lastTest: 'Last Test',
    webhooksSent: 'Webhooks Sent',
    // Event labels
    eventLabels: {
      newMessage: 'New Message',
      messageSent: 'Message Sent',
      messageUpsert: 'Message Upsert',
      newContact: 'New Contact',
      contactUpdate: 'Contact Update',
      chatUpdate: 'Chat Update',
      connectionUpdate: 'Connection Update',
      qrCodeUpdate: 'QR Code Update'
    }
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
    troubleshooting: 'Troubleshooting',
    codeCopied: 'Code copied!',
    tabs: {
      overview: 'Overview',
      configuration: 'Configuration',
      events: 'Events',
      examples: 'Examples',
      sendMessages: 'Send Messages',
      kanban: 'Kanban',
      n8nIntegration: 'N8N Integration',
      troubleshooting: 'Troubleshooting'
    },
    // Additional content
    n8nAvailable: 'N8N Integration Available',
    n8nDescription: 'You can now configure N8N integrations directly in the interface! Access /n8n-integration to configure automatic webhooks.',
    whatAreWebhooks: 'What are Webhooks?',
    webhooksDescription: 'Webhooks are a form of real-time communication between applications. When something happens on our platform (like a new message), we automatically send the data to your application via HTTP POST.',
    webhooksAdvantages: 'Webhook Advantages:',
    realTime: 'Real Time',
    realTimeDescription: 'Receive data instantly when events occur',
    secure: 'Secure',
    secureDescription: 'Direct communication between servers, without public exposure',
    efficient: 'Efficient',
    efficientDescription: 'No need to constantly poll to check for changes'
  }
};
