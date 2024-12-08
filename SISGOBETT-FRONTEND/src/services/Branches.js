import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import config from '../config';


// Función para obtener todas las sucursales
const fetchBranches = async (_, orderBy = 'id', orderType = 'asc', filters = {}) => {
    try {
        const response = await axios.get(`${config.apiURL}branches`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            },
            params: {
                filters: filters,
                sort: `${orderBy}:${orderType}`,
            },
            
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        throw error;
    }
};

// Función para crear una nueva sucursal
const createBranch = async (branchData) => {
    try {
        const response = await axios.post(`${config.apiURL}branches`, {
            data: branchData
        }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear sucursal:', error);
        throw error;
    }
};

// Función para actualizar una sucursal
const updateBranch = async ({ id, data }) => {

    console.log(id,data)
    try {
        const response = await axios.put(`${config.apiURL}branches/${id}`, {
            data: data
        }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar sucursal:', error);
        throw error;
    }
};

// Función para eliminar una sucursal
const deleteBranch = async (id) => {
    try {
        const response = await axios.delete(`${config.apiURL}branches/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar sucursal:', error);
        throw error;
    }
};

// Función para obtener una sucursal específica
const fetchBranchById = async (id) => {
    try {
        const response = await axios.get(`${config.apiURL}branches/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            },
            params: {
                populate: '*'  // Si necesitas traer relaciones
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener la sucursal:', error);
        throw error;
    }
};

// Hooks personalizados
export const useBranches = (orderBy, orderType, filters) => {
    return useQuery(['branches', orderBy, orderType, filters],
        () => fetchBranches(null, orderBy, orderType, filters));
};

export const useCreateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation(createBranch, {
        onSuccess: () => {
            queryClient.invalidateQueries('branches');
        }
    });
};

export const useUpdateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation(updateBranch, {
        onSuccess: () => {
            queryClient.invalidateQueries('branches');
        }
    });
};

export const useDeleteBranch = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteBranch, {
        onSuccess: () => {
            queryClient.invalidateQueries('branches');
        }
    });
};

// Hook personalizado para obtener una sucursal
export const useBranch = (id) => {
    return useQuery(
        ['branch', id],
        () => fetchBranchById(id),
        {
            enabled: !!id, // Solo se ejecuta si hay un ID
            refetchOnWindowFocus: false,
            staleTime: 30000,
        }
    );
};