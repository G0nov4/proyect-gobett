import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import config from '../config';

// Función para obtener las telas
const fetchFabrics = async (_, orderBy = 'id', orderType = 'asc', filters = {}) => {
    try {
        const response = await axios.get(`${config.apiURL}fabrics?populate[0]=colors&populate[1]=rolls.color&populate[2]=categories&populate[3]=supplier&populate[4]=fabric_images`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            },
            params: {
                sort: `${orderBy}:${orderType}`,
                ...filters
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const getFabricById = async (id) => {
    try {
        const response = await axios.get(`${config.apiURL}fabrics/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            },
            params: {
                populate: {
                    colors: true,
                    rolls: {
                        populate: {
                            color: true,
                            warehouse: {
                                fields: ['name', 'id']
                            },
                            branch: {
                                fields: ['name', 'id']
                            }
                        }
                    },
                    categories: true,
                    supplier: true,
                    fabric_images: true
                }
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener la tela:', error);
        throw error;
    }
};

// Función para crear una nueva tela
const createFabric = async (values) => {
 
    try {
        const newFabric = {
          data: {
            name: values.name || "",
            description: values.description || "",
            cost:  values.cost || 0,
            arrive_date:  values.arrive_date || new Date().toISOString(),
            availability_status:  values.available_status || true,
            height:  values.height || 0,
            retail_price:  values.retail_price || 0,
            wholesale_price:  values.wholesale_price || 0,
            wholesale_price_assorted:  values.wholesale_price_assorted || 0,
            price_per_roll:  values.price_per_roll || 0,
            price_per_roll_assorted: values.price_per_roll_assorted || 0,
            rolls:  values.rolls || [],
            categories:  values.categories || [],
            supplier:  values.supplier || {},
            weight:  values.weight || 0,
            code:  values.code || "",
            colors:  values.colors || [],
            fabric_images: values.fabric_images?.map(file => file.id) || []
          }
        }
        
 
        console.log("Nueva Tela:",newFabric)
        const response = await axios.post(`${config.apiURL}fabrics`, newFabric, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Función para actualizar una tela
const updateFabric = async ({id, data}) => {
    console.log("Data:",data)
    try {
        const newFabric = {
          
                name: data.name || "",
                description: data.description || "",
                cost: data.cost || 0,
                arrive_date: data.arrive_date || new Date().toISOString(),
                availability_status: data.available_status || true,
                height: data.height || 0,
                retail_price: data.retail_price || 0,
                wholesale_price: data.wholesale_price || 0,
                wholesale_price_assorted: data.wholesale_price_assorted || 0,
                price_per_roll: data.price_per_roll || 0,
                price_per_roll_assorted: data.price_per_roll_assorted || 0,
                rolls: data.rolls || [],
                categories: data.categories || [],
                supplier: data.supplier || {},
                weight: data.weight || 0,
            code: data.code || "",
                colors: data.colors || [],

                fabric_images: data.fabric_images?.map(file => file.id) || []
            
        }
        const response = await axios.put(`${config.apiURL}fabrics/${id}`, { data: newFabric }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Función para eliminar una tela
const deleteFabric = async (id) => {
    try {
        const response = await axios.delete(`${config.apiURL}fabrics/${id}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};


// Hook personalizado para obtener las telas con React Query
export const useFabrics =  (orderBy = 'id', orderType = 'asc', filters = {}) => {
    return  useQuery('fabrics', fetchFabrics);
};

// Hook personalizado para crear una nueva tela con React Query
export const useCreateFabric = () => {
    return useMutation(createFabric);
};

// Hook personalizado para actualizar una tela con React Query
export const useUpdateFabric = () => {
    return useMutation(updateFabric);
};

// Hook personalizado para eliminar una tela con React Query
export const useDeleteFabric = () => {
    return useMutation(deleteFabric);
};


export const useGetFabricById = (id) => {
    return useQuery(
        ['fabric', id],
        () => getFabricById(id),
        {
            onError: (error) => {
                console.error('Error en la consulta:', error);
            }
        }
    );
};
