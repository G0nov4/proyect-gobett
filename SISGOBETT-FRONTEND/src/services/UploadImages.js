import axios from 'axios';
import { useQuery, useMutation } from 'react-query';
import config from '../config';
// Función para obtener las categorías
const fetchImages = async (_, orderBy = 'id', orderType = 'asc', filters = {}) => {
    console.log("data")
    const { data } = await axios.get(`${config.apiURL}upload/files`, {
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
const createImages = async (values) => {
    console.log(JSON.stringify(values.get('files')))
    const { data } = await axios.post(`${config.apiURL}upload`, { files: values }, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`,
            "Content-Type": 'multipart/form-data'
        },
    }).catch((err)=>{
        console.log("--------------",err)
    })
    
    return data;
};

// Función para actualizar una categoría
const updateImage = async (id, updatedDataImage) => {
    const { data } = await axios.put(`${config.apiURL}categories/${id}`, { data: updatedDataImage }, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`
        }
    });
    return data;
};

// Función para eliminar una categoría
const deleteImage = async (id) => {
    const { data } = await axios.delete(`${config.apiURL}upload/files/${id}`, {
        headers: {
            Authorization: `Bearer ${config.tokenKey}`
        }
    });
    return data;
};

// Hook personalizado para obtener las categorías con React Query
export const useUploadImage =  (orderBy = 'id', orderType = 'asc', filters = {}) => {
    return  useQuery('UploadImage', fetchImages);
};

// Hook personalizado para crear una nueva categoría con React Query
export const useCreateImage = () => {
    return useMutation(createImages);
};

// Hook personalizado para actualizar una categoría con React Query
export const useUpdateImage = () => {
    return useMutation(updateImage);    
};

// Hook personalizado para eliminar una categoría con React Query
export const useDeleteImage = () => {
    return useMutation(deleteImage);
};