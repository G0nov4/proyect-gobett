import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import config from '../config';

const fetchPromos = async (orderBy = 'id', orderType = 'asc', filters = {}) => {
    try {
        const response = await axios.get(`${config.apiURL}promos`, {
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

const createPromo = async (values) => {
    try {
        const response = await axios.post(`${config.apiURL}promos`, { data: values }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const updatePromo = async (dataPromo) => {
    const updatedDataPromo = {
        "promotion_name": dataPromo.promotion_name,
        "discount": dataPromo.discount,
        "start_date": dataPromo.start_date,
        "end_date": dataPromo.end_date,
        "promotion_type": dataPromo.promotion_type,
        "description": dataPromo.description,
        "code": dataPromo.code
    }
    try {
        const response = await axios.put(`${config.apiURL}promos/${dataPromo.id}`, { data: updatedDataPromo }, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const deletePromo = async (idPromo) => {
    try {
        const response = await axios.delete(`${config.apiURL}promos/${idPromo}`, {
            headers: {
                Authorization: `Bearer ${config.tokenKey}`
            }
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const usePromos = (orderBy = 'id', orderType = 'asc', filters = {}) => {
    return useQuery('promotions', () => fetchPromos(orderBy, orderType, filters));
};

export const useCreatePromo = () => {
    const  queryPromo = useQueryClient()
    return useMutation(createPromo,{
        onSuccess: () =>{
            queryPromo.invalidateQueries('promotions')
        },
        onError: () => {

        }
    });
};

export const useUpdatePromo = () => {
    const  queryPromo = useQueryClient()
    return useMutation(updatePromo,{
        onSuccess: () =>{
            queryPromo.invalidateQueries('promotions')
        },
        onError: () => {

        }
    });
};

export const useDeletePromo = () => {
    const  queryPromo = useQueryClient()
    return useMutation(deletePromo,{
        onSuccess: () =>{
            queryPromo.invalidateQueries('promotions')
        },
        onError: () => {

        }
    });
};
