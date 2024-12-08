import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import config from '../config';
// Obtener todas las ventas
const fetchSales = async (_, orderBy = 'id', orderType = 'asc', filters = {}) => {
    try {
        const response = await axios.get(`${config.apiURL}sales`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            },
            params: {
               
                populate: [
                    'client',
                    'detail.fabric',
                    'detail.color', 
                    'promo',
                    'payments',
                    'branch'
                ],
                ...filters,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        throw error;
    }
};

// Crear una nueva venta
const createSale = async (saleData) => {

    // Validaciones
    if (!saleData.detail || saleData.detail.length === 0) {
        throw new Error('La venta debe tener al menos un detalle');
    }

    if (saleData.total_sale <= 0) {
        throw new Error('El total de la venta debe ser mayor a 0');
    }

    if (saleData.delivery === 'EN DOMICILIO' && !saleData.address) {
        throw new Error('La dirección es requerida para entregas a domicilio');
    }

    // Validar detalles
    saleData.detail.forEach(item => {
        if (item.quantity <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }
        if (item.unitPrice <= 0) {
            throw new Error('El precio unitario debe ser mayor a 0');
        }
        if (!item.isRoll && item.cuts > item.quantity) {
            throw new Error('El número de cortes no puede ser mayor que la cantidad');
        }
    });

    try {
        const response = await axios.post(`${config.apiURL}sales`, {
            data: saleData
        }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear venta:', error);
        throw error;
    }
};

// Actualizar una venta
const updateSale = async ({ id, ...updateData }) => {
    if (!id) {
        throw new Error('Se requiere ID para actualizar');
    }

    try {
        const response = await axios.put(`${config.apiURL}sales/${id}`, {
            data: updateData
        }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar venta:', error);
        throw error;
    }
};

// Eliminar una venta
const deleteSale = async (id) => {
    if (!id) {
        throw new Error('Se requiere ID para eliminar');
    }

    try {
        const response = await axios.delete(`${config.apiURL}sales/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        throw error;
    }
};

// Actualizar el estado de una venta
export const updateSaleStatus = async ({id, newStatus}) => {
    console.log(newStatus);
    try {
        const response = await axios.put(`${config.apiURL}sales/${id}/status`, {
            data: { status: newStatus }
        }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar estado de venta:', error);
        throw error;
    }
};



export const useSales = (orderBy, orderType, filters) => {
    return useQuery(['sales', orderBy, orderType, filters], 
        () => fetchSales(null, orderBy, orderType, filters));
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation(createSale, {
        onSuccess: () => {
            queryClient.invalidateQueries('sales');
        }
    });
};

export const useUpdateSale = () => {
    const queryClient = useQueryClient();
    return useMutation(updateSale, {
        onSuccess: () => {
            queryClient.invalidateQueries('sales');
        }
    });
};

export const useDeleteSale = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteSale, {
        onSuccess: () => {
            queryClient.invalidateQueries('sales');
        }
    });
};

// Hook personalizado para actualizar estado
export const useUpdateSaleStatus = () => {
    const queryClient = useQueryClient();
    return useMutation(updateSaleStatus, {
        onSuccess: () => {
            queryClient.invalidateQueries('sales');
        }
    });
};
