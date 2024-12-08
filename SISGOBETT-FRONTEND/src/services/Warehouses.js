import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import config from '../config';

// Función para obtener todos los almacenes
const fetchWarehouses = async (_, orderBy = 'id', orderType = 'asc', filters = {}) => {
    try {
        const response = await axios.get(`${config.apiURL}warehouses`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            },
            params: {
                filters: filters,
                sort: `${orderBy}:${orderType}`,
                    populate: {
                        rolls: {
                            populate: {
                                fabric: true,
                                color: true
                            }
                        }
                    
                }
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener almacenes:', error);
        throw error;
    }
};

// Función para crear un nuevo almacén
const createWarehouse = async (warehouseData) => {
    try {
        const response = await axios.post(`${config.apiURL}warehouses`, {
            data: warehouseData
        }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear almacén:', error);
        throw error;
    }
};

// Función para actualizar un almacén
const updateWarehouse = async ({ id, data }) => {
    try {
        const response = await axios.put(`${config.apiURL}warehouses/${id}`, {
            data: data
        }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar almacén:', error);
        throw error;
    }
};

// Función para eliminar un almacén
const deleteWarehouse = async (id) => {
    try {
        const response = await axios.delete(`${config.apiURL}warehouses/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar almacén:', error);
        throw error;
    }
};

// Función para obtener un almacén específico
const fetchWarehouseById = async (id) => {
    try {
        const response = await axios.get(`${config.apiURL}warehouses/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            },
            params: {
                populate: {
                    rolls: {
                        populate: {
                            fabric: true
                        }
                    }
                }
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener el almacén:', error);
        throw error;
    }
};

// Hooks personalizados
export const useWarehouses = (orderBy, orderType, filters) => {
    return useQuery(['warehouses', orderBy, orderType, filters],
        () => fetchWarehouses(null, orderBy, orderType, filters));
};

export const useCreateWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation(createWarehouse, {
        onSuccess: () => {
            queryClient.invalidateQueries('warehouses');
        }
    });
};

export const useUpdateWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation(updateWarehouse, {
        onSuccess: () => {
            queryClient.invalidateQueries('warehouses');
        }
    });
};

export const useDeleteWarehouse = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteWarehouse, {
        onSuccess: () => {
            queryClient.invalidateQueries('warehouses');
        }
    });
};

export const useWarehouseById = (id) => {
    return useQuery(['warehouse', id], () => fetchWarehouseById(id), {
        enabled: !!id
    });
}; 