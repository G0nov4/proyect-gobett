import axios from 'axios';
import { useQuery, useMutation } from 'react-query';
import config from '../config';

// Función para obtener las categorías
const fetchSuppliers = async (_, orderBy = 'id', orderType = 'asc', filters = {}) => {
   
  const { data } = await axios.get(`${config.apiURL}suppliers?populate=*`, {
    headers: {
      Authorization: `Bearer ${config.tokenKey}`
    },
    params: {
      sort: `${orderBy}:${orderType}`,
      ...filters
    }
  });                
  
  return data;
};

// Función para crear una nueva categoría
const createSupplier = async (values) => {
  console.log(values)
  const { data } = await axios.post(`${config.apiURL}suppliers`, { data: values }, {
    headers: {
      Authorization: `Bearer ${config.tokenKey}`
    }
  });
  return data;
};

// Función para actualizar una categoría
const updateSupplier = async (id, updatedDataPromotion) => {
  const { data } = await axios.put(`${config.apiURL}suppliers/${id}`, { data: updatedDataPromotion }, {
    headers: {
      Authorization: `Bearer ${config.tokenKey}`
    }
  });
  return data;
};

// Función para eliminar una categoría
const deleteSupplier = async (id) => {
  const { data } = await axios.delete(`${config.apiURL}suppliers/${id}`, {
    headers: {
      Authorization: `Bearer ${config.tokenKey}`
    }
  });
  return data;
};

// Hook personalizado para obtener las categorías con React Query
export const useSuppliers = (orderBy = 'id', orderType = 'asc', filters = {}) => {
  return useQuery(['suppliers'], fetchSuppliers)
};

// Hook personalizado para crear una nueva categoría con React Query
export const useCreateSupplier = () => {
  return useMutation(createSupplier)
};

// Hook personalizado para actualizar una categoría con React Query
export const useUpdateSupplier = () => {
  return useMutation(updateSupplier);
};

// Hook personalizado para eliminar una categoría con React Query
export const useDeleteSupplier = () => {
  return useMutation(deleteSupplier);
};