import axios from 'axios';
import { useQuery, useMutation } from 'react-query';
import config from '../config';

// Función para obtener los usuarios
const fetchUsers = async (_, orderBy = 'id', orderType = 'asc', filters = {}) => {
    const { data } = await axios.get(`${config.apiURL}users/operators`, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`
        },
        params: {
            sort: `${orderBy}:${orderType}`,
            ...filters
        },
  
    });
    return data.data;
};

// Función para crear un nuevo usuario
const createUser = async (values) => {
    const newUser = {
        complete_name: values.complete_name || "",
        username: values.username || "",
        ci: values.ci || "",
        email: values.email || "",
        phone: values.phone || "",
        password: values.password || "",
    };

    console.log('icono Usuario', newUser)

    const { data } = await axios.post(`${config.apiURL}users/operators`, { data: newUser }, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`
        }
    });
    return data;
};

// Función para actualizar un usuario
const updateUser = async ({ id, ...updatedData }) => {
    const updatedUser = {
        complete_name: updatedData.complete_name || "",
        username: updatedData.username || "",
        ci: updatedData.ci || "",
        email: updatedData.email || "",
        phone: updatedData.phone || "",
        password: updatedData.password || "",
    };
    console.log('icono Usuario', updatedUser)
    const { data } = await axios.put(`${config.apiURL}users/operators/${id}`, { data: updatedUser }, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`
        }
    });
    
    return data;
};

// Función para eliminar un usuario
const deleteUser = async (id) => {
    const { data } = await axios.delete(`${config.apiURL}users/operators/${id}`, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`
        }
    });
    return data;
};

// Hook personalizado para obtener los usuarios con React Query
export const useUsers = (orderBy = 'id', orderType = 'asc', filters = {}) => {
    return useQuery(['users', orderBy, orderType, filters], () => 
        fetchUsers(null, orderBy, orderType, filters)
    );
};

// Hook personalizado para crear un nuevo usuario con React Query
export const useCreateUser = () => {
    return useMutation(createUser);
};

// Hook personalizado para actualizar un usuario con React Query
export const useUpdateUser = () => {
    return useMutation(updateUser);
};

// Hook personalizado para eliminar un usuario con React Query
export const useDeleteUser = () => {
    return useMutation(deleteUser);
}; 