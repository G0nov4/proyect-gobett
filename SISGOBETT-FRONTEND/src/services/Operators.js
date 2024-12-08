import axios from 'axios';
import config from '../config';

// Función para obtener todos los operadores
const getOperators = async () => {
    try {
        const response = await axios.get(`${config.apiURL}operators`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener operadores:', error);
        throw error;
    }
};

// Función para obtener un operador por ID
const getOperator = async (id) => {
    try {
        const response = await axios.get(`${config.apiURL}operators/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener operador:', error);
        throw error;
    }
};

// Función para crear un nuevo operador
const createOperator = async (data) => {
    try {
        const newOperator = {
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            role: data.role || "operator",
            status: data.status || true
        };
        
        const response = await axios.post(`${config.apiURL}operators`, { data: newOperator }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear operador:', error);
        throw error;
    }
};

// Función para actualizar un operador
const updateOperator = async ({id, data}) => {
    try {
        const updatedOperator = {
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            role: data.role || "operator",
            status: data.status || true
        };

        const response = await axios.put(`${config.apiURL}operators/${id}`, { data: updatedOperator }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar operador:', error);
        throw error;
    }
};

// Función para eliminar un operador
const deleteOperator = async (id) => {
    try {
        const response = await axios.delete(`${config.apiURL}operators/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar operador:', error);
        throw error;
    }
};

export {
    getOperators,
    getOperator, 
    createOperator,
    updateOperator,
    deleteOperator
};
