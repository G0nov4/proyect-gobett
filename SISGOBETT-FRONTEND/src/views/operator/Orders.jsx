import React, { useState, useMemo } from 'react';
import { Button,  Input, Spin } from 'antd';
import { CalendarOutlined, ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, UnorderedListOutlined, SyncOutlined, SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import OrderList from '../../components/operator/OrderList';
import './Orders.css';
import { useSales, useUpdateSaleStatus } from '../../services/Sales';
import { message } from 'antd';

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const { data: sales, isLoading } = useSales('createdAt', 'desc', {
    filters: {
      sales_type: {
        $eq: 'PEDIDO'
      },

    }
  });
  console.log(sales)
  const updateSaleStatusMutation = useUpdateSaleStatus();

  const getFilteredSales = useMemo(() => {
    if (!sales?.data) return [];
    
    return sales.data.filter(sale => {
      const matchesSearch = searchText.toLowerCase() === '' || 
        sale.attributes.client?.data?.attributes?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        sale.attributes.client?.data?.attributes?.phone_1?.includes(searchText);

      const matchesStatus = filterStatus === 'all' || 
        sale.attributes.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [sales, searchText, filterStatus]);

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      await updateSaleStatusMutation.mutateAsync({
        id: saleId,
        newStatus
      }).then(() => {
        message.success('Estado de la venta actualizado exitosamente');
      }).catch((error) => {
        console.log(error);
        message.error(` ${error.response.data.error.message}`);
      });
    } catch (error) {
      message.error('Error al actualizar el estado de la venta');
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <div className="orders-dashboard">
      
      <div className="dashboard-filters">
        <Input.Search
          placeholder="Buscar por cliente o teléfono..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
          suffix={<SearchOutlined />}
        />
        
        <div className="status-filters">
          <Button 
            className={`filter-btn status-all ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
            style={{
              color: filterStatus === 'all' ? '#fff' : '#4F646F',
              borderColor: '#4F646F',
              backgroundColor: filterStatus === 'all' ? '#4F646F' : 'transparent',
              fontWeight: filterStatus === 'all' ? '600' : '400'
            }}
          >
            <UnorderedListOutlined /> Todos
          </Button>
          <Button 
            className={`filter-btn status-pending ${filterStatus === 'PENDIENTE' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PENDIENTE')}
            style={{
              color: filterStatus === 'PENDIENTE' ? '#fff' : '#faad14',
              borderColor: '#faad14',
              backgroundColor: filterStatus === 'PENDIENTE' ? '#faad14' : 'transparent',
              fontWeight: filterStatus === 'PENDIENTE' ? '600' : '400'
            }}
          >
            <SyncOutlined spin={filterStatus === 'PENDIENTE'} /> En Proceso
          </Button>
          <Button 
            className={`filter-btn status-completed ${filterStatus === 'COMPLETADO' ? 'active' : ''}`}
            onClick={() => setFilterStatus('COMPLETADO')}
            style={{
              color: filterStatus === 'COMPLETADO' ? '#fff' : '#52c41a',
              borderColor: '#52c41a',
              backgroundColor: filterStatus === 'COMPLETADO' ? '#52c41a' : 'transparent',
              fontWeight: filterStatus === 'COMPLETADO' ? '600' : '400'
            }}
          >
            <CheckCircleOutlined /> Completados
          </Button>
          <Button
            className={`filter-btn status-cancelled ${filterStatus === 'CANCELADO' ? 'active' : ''}`}
            onClick={() => setFilterStatus('CANCELADO')}
            style={{
              color: filterStatus === 'CANCELADO' ? '#fff' : '#ff4d4f',
              borderColor: '#ff4d4f',
              backgroundColor: filterStatus === 'CANCELADO' ? '#ff4d4f' : 'transparent',
              fontWeight: filterStatus === 'CANCELADO' ? '600' : '400'
            }}
          >
            <CloseCircleOutlined /> Cancelados
          </Button>
        </div>
      </div>

      <OrderList 
        salesList={getFilteredSales}
        handleStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Orders;