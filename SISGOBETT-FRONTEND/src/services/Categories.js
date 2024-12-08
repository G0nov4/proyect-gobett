import axios from 'axios';
import { useQuery, useMutation } from 'react-query';
import config from '../config';
// Función para obtener las categorías
const fetchCategories = async (orderBy = 'id', orderType = 'asc', filters) => {
    console.log('Fetching with params:', { orderBy, orderType, filters });
    const { data } = await axios.get(`${config.apiURL}categories`, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`
        },
        params: {
            sort: `${orderBy}:${orderType}`,
            ...filters
        }
    });
    return data.data;
};

// Función para crear una nueva categoría
const createCategory = async (values) => {
    try {
        const { data } = await axios.post(
            `${config.apiURL}categories`, 
            { data: values }, // Aseguramos que los datos estén en el formato correcto
            {
                headers: {
                    Authorization: `Bearer ${config.tokenKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return data.data; // Retornamos data.data para consistencia con el formato de respuesta
    } catch (error) {
        throw new Error(error.response?.data?.error?.message || 'Error al crear la categoría');
    }
};

// Función para actualizar una categoría
const updateCategory = async ({ id, data }) => {
    const { data: response } = await axios.put(`${config.apiURL}categories/${id}`, 
        { data },  // Envolvemos data en un objeto
        {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        }
    );
    return response;
};

// Función para eliminar una categoría
const deleteCategory = async (id) => {
    const { data } = await axios.delete(`${config.apiURL}categories/${id}`, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`
        }
    });
    return data;
};

// Hook personalizado para obtener las categorías con React Query
export const useCategories = (orderBy = 'id', orderType = 'asc', filters = {}) => {
    return useQuery(['categories', orderBy, orderType, filters], () =>
        fetchCategories(orderBy, orderType, filters)
    );
};

// Hook personalizado para crear una nueva categoría con React Query
export const useCreateCategory = () => {
    return useMutation(createCategory);
};

// Hook personalizado para actualizar una categoría con React Query
export const useUpdateCategory = () => {
    return useMutation(updateCategory);
};

// Hook personalizado para eliminar una categoría con React Query
export const useDeleteCategory = () => {
    return useMutation(deleteCategory);
};