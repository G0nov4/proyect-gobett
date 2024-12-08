

// Luego definimos la configuración
const config = {
    apiURL: process.env.REACT_APP_API_URL || 'http://localhost:1337',
    
    // Token key para localStorage
    tokenKey: 'sisgobett_token', // Valor fijo en lugar de usar localStorage
    
    // Datos de la empresa
    company: {
        name: 'SISGOBETT',
        legalName: 'GOBETT S.R.L.',
        nit: '1234567890',
        address: 'Av. Principal #123, La Paz',
        phone: '+591 12345678',
        email: 'contacto@gobett.com',
        website: 'www.gobett.com',
        logo: '/assets/Logo Gobett.png',
        
        // Configuración de facturación
        billing: {
            currency: 'BOB',
            taxRate: 0.13, // 13% IVA
            defaultPaymentTerms: 30, // días
        },
        
        // Configuración de documentos
        documents: {
            invoicePrefix: 'FAC',
            orderPrefix: 'ORD',
            transferPrefix: 'TRF',
        },
        
        // Configuración de sistema
        system: {
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm',
            timezone: 'America/La_Paz',
            language: 'es',
            defaultPageSize: 10,
        },
        
        // Configuración de notificaciones
        notifications: {
            email: {
                enabled: true,
                sender: 'notificaciones@gobett.com',
            },
            sms: {
                enabled: false,
            },
        },
        
        // Configuración de almacenes
        warehouses: {
            defaultLocation: 'CENTRAL',
            minStockAlert: 100, // metros
            maxStockLimit: 10000, // metros
        },
        
        // Configuración de ventas
        sales: {
            minOrderAmount: 50, // BOB
            wholesaleMinAmount: 1000, // BOB
            discountLevels: [
                { amount: 5000, discount: 0.05 },
                { amount: 10000, discount: 0.10 },
                { amount: 20000, discount: 0.15 },
            ],
        },
    },
    
    // Configuración de endpoints
    endpoints: {
        auth: {
            login: 'auth/local',
            register: 'auth/local/register'
        },
        suppliers: 'suppliers',
        clients: 'clients',
        products: 'products',
        categories: 'categories',
        orders: 'orders',
        warehouses: 'warehouses',
        transfers: 'transfers',
        sales: 'sales',
        reports: 'reports'
    },

    // Configuración de paginación por defecto
    pagination: {
        pageSize: 10,
        defaultPage: 1
    }
};

// Función para obtener datos de la empresa
export const getCompanyData = () => config.company;

// Función para actualizar datos de la empresa
export const updateCompanyData = (newData) => {
    config.company = {
        ...config.company,
        ...newData
    };
    localStorage.setItem('companyData', JSON.stringify(config.company));
    return config.company;
};

// Función para obtener configuración específica
export const getConfig = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], config);
};

// Función para validar si un valor está dentro de los límites configurados
export const isWithinLimits = (value, type) => {
    switch(type) {
        case 'stock':
            return value >= config.company.warehouses.minStockAlert && 
                   value <= config.company.warehouses.maxStockLimit;
        case 'order':
            return value >= config.company.sales.minOrderAmount;
        default:
            return true;
    }
};

// Función para calcular descuentos basados en el monto
export const calculateDiscount = (amount) => {
    const level = config.company.sales.discountLevels
        .reverse()
        .find(level => amount >= level.amount);
    return level ? level.discount : 0;
};

// Función para formatear moneda
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: config.company.billing.currency
    }).format(amount);
};

// Función para formatear fecha según configuración
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-BO', {
        dateStyle: 'medium',
        timeZone: config.company.system.timezone
    }).format(new Date(date));
};

export default config;
