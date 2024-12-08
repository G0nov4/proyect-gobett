import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, List, Select, message, Tag } from 'antd';
import { FileTextOutlined, SwapOutlined } from '@ant-design/icons';
import { useWarehouses } from '../../services/Warehouses';
import styles from './Transfers.module.css';

const { Option } = Select;

const Transfers = () => {
  const [sourceWarehouse, setSourceWarehouse] = useState(null);
  const [targetWarehouse, setTargetWarehouse] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [targetKeys, setTargetKeys] = useState([]);
    const [fabricsData, setFabricsData] = useState([])
  // Obtener lista de almacenes
  const { data: warehousesData, isLoading: isLoadingWarehouses } = useWarehouses();

  // Actualizar los datos cuando cambie cualquier almacén
  useEffect(() => {
    if (warehousesData?.data) {
      let allRolls = [];
      let targetRollKeys = [];

      // Obtener rollos del almacén origen
      if (sourceWarehouse) {
        const sourceWarehouseData = warehousesData.data.find(w => w.id === sourceWarehouse);
        const sourceRolls = sourceWarehouseData?.attributes?.rolls?.data || [];
        allRolls = sourceRolls.map(roll => ({
          key: roll.id.toString(),
          title: roll.attributes.code,
          description: `Metraje: ${roll.attributes.roll_footage}m - Estado: ${roll.attributes.status}`,
          chosen: false,
          disabled: roll.attributes.status !== 'DISPONIBLE',
          originalData: roll,
          color: roll.attributes.color?.data?.attributes?.color || '#999'
        }));
      }

      // Obtener rollos del almacén destino
      if (targetWarehouse) {
        const targetWarehouseData = warehousesData.data.find(w => w.id === targetWarehouse);
        const targetRolls = targetWarehouseData?.attributes?.rolls?.data || [];
        targetRollKeys = targetRolls.map(roll => roll.id.toString());
        
        // Agregar rollos del almacén destino a la lista completa
        const targetRollsFormatted = targetRolls.map(roll => ({
          key: roll.id.toString(),
          title: roll.attributes.code,
          description: `Metraje: ${roll.attributes.roll_footage}m - Estado: ${roll.attributes.status}`,
          chosen: false,
          disabled: roll.attributes.status !== 'DISPONIBLE',
          originalData: roll,
          color: roll.attributes.color?.data?.attributes?.color || '#999'
        }));
        
        // Agregar solo los rollos que no están ya en la lista
        targetRollsFormatted.forEach(roll => {
          if (!allRolls.find(r => r.key === roll.key)) {
            allRolls.push(roll);
          }
        });
      }

      setAvailableItems(allRolls);
      setTargetKeys(targetRollKeys);
    }
  }, [sourceWarehouse, targetWarehouse, warehousesData]);

  const handleItemSelect = (item) => {
    setSelectedItems(prev => [...prev, item]);
    setAvailableItems(prev => prev.filter(i => i.key !== item.key));
  };

  const handleItemRemove = (item) => {
    setSelectedItems(prev => prev.filter(i => i.key !== item.key));
    setAvailableItems(prev => [...prev, item]);
  };

  const handleSourceWarehouseChange = (value) => {
    setSourceWarehouse(value);
    setTargetKeys([]); // Limpiar selección al cambiar el almacén
    setSelectedItems([]);
  };

  const handleTargetWarehouseChange = (value) => {
    setTargetWarehouse(value);
  };

  const handleTransfer = async () => {
    if (!sourceWarehouse || !targetWarehouse || targetKeys.length === 0) {
      message.error('Por favor selecciona almacenes y rollos para transferir');
      return;
    }

    // Datos simplificados para el traspaso
    const transferData = {
      rolls: targetKeys.map(key => parseInt(key)),
      warehouse_id: targetWarehouse
    };

    console.log('Datos del traspaso:', transferData);
    message.success('Traspaso realizado con éxito');
    
    // Limpiar selección
    setTargetKeys([]);
    setSelectedItems([]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Gestión de Traspasos</h1>
          <p>Realiza traspasos de telas entre almacenes</p>
        </div>
        <Button 
          icon={<FileTextOutlined />}
          className={styles.historyButton}
        >
          Historial
        </Button>
      </div>

      <Row gutter={[16, 16]} className={styles.warehouseSelectors}>
        <Col xs={24} md={12}>
          <Select
            placeholder="Almacén origen"
            className={styles.warehouseSelect}
            onChange={handleSourceWarehouseChange}
          >
            {warehousesData?.data?.map(warehouse => (
              <Option 
                key={warehouse.id} 
                value={warehouse.id}
                disabled={warehouse.id === targetWarehouse}
              >
                {warehouse.attributes.name} 
                {warehouse.attributes.status !== 'ACTIVO' && ` (${warehouse.attributes.status})`}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={12}>
          <Select
            placeholder="Almacén destino"
            className={styles.warehouseSelect}
            onChange={handleTargetWarehouseChange}
          >
            {warehousesData?.data?.map(warehouse => (
              <Option 
                key={warehouse.id} 
                value={warehouse.id}
                disabled={warehouse.id === sourceWarehouse}
              >
                {warehouse.attributes.name}
                {warehouse.attributes.status !== 'ACTIVO' && ` (${warehouse.attributes.status})`}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.transferArea}>
        <Col xs={24} lg={12}>
          <Card title="Productos Disponibles" className={styles.productCard}>
            <List
              dataSource={availableItems}
              renderItem={item => (
                <List.Item
                  key={item.key}
                  actions={[
                    <Button 
                      type="primary" 
                      onClick={() => handleItemSelect(item)}
                      size="small"
                    >
                      Seleccionar
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div 
                        className={styles.colorBox} 
                        style={{ backgroundColor: item.color }}
                      />
                    }
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Productos a Transferir" 
            className={styles.productCard}
            extra={
              <Button
                type="primary"
                icon={<SwapOutlined />}
                onClick={handleTransfer}
                disabled={selectedItems.length === 0}
              >
                Transferir
              </Button>
            }
          >
            <List
              dataSource={selectedItems}
              renderItem={item => (
                <List.Item
                  key={item.key}
                  actions={[
                    <Button 
                      danger 
                      onClick={() => handleItemRemove(item)}
                      size="small"
                    >
                      Remover
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div 
                        className={styles.colorBox} 
                        style={{ backgroundColor: item.color }}
                      />
                    }
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Transfers;