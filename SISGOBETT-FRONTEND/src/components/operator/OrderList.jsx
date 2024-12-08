import React, { useState } from 'react';
import { Table, 
  Select, 
  Space,
  Button,
  Typography,
  Tooltip,
  Tag,
  Modal,
  message
} from 'antd';
import { formatDate } from '../../utils/dateUtils';
import './OrderList.css';
import { CalendarOutlined, PhoneOutlined, UserOutlined,DollarOutlined,IdcardOutlined,TagsOutlined,AppstoreOutlined,PrinterOutlined,DollarCircleOutlined,CheckCircleOutlined,ClockCircleOutlined,EyeOutlined, CloseCircleOutlined, TagOutlined, ScissorOutlined, ColumnHeightOutlined, BarcodeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { BsRulers } from "react-icons/bs";
import { FaRulerHorizontal } from "react-icons/fa";
import SaleDetailModal from '../Modals/SaleDetailModal';
import PaymentModal from './PaymentModal';

const { Text } = Typography;

const ExpandedDetails = ({ detail }) => {
  if (!detail || !Array.isArray(detail)) return null;
  
  return (
    <Table
      size="small"
      pagination={false}
      dataSource={detail}
      columns={[
        {
          title: <Space><TagOutlined /> Producto</Space>,
          key: 'product',
          width: '25%',
          render: (_, record) => {
            const fabricName = record.fabric?.data?.attributes?.name || 'Tela sin nombre';
            const fabricCode = record.fabric?.data?.attributes?.code || 'Sin código';
            
            return (
              <Space direction="vertical" size={0}>
                <Space>
                  <div>
                    <Text strong>{fabricName}</Text>
                    <br />
                    <Text type="secondary" style={{fontSize: '12px'}}>{fabricCode}</Text>
                  </div>
                </Space>
              </Space>
            );
          }
        },
        {
          title: <Space><TagOutlined /> Color</Space>,
          key: 'color',
          width: '25%',
          render: (_, record) => {
            const colorName = record.color?.data?.attributes?.name || 'Sin color';
            const colorCode = record.color?.data?.attributes?.code || 'Sin código';
            const colorData = record.color?.data?.attributes;

            return (
              <Space align="center">
                <div style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: colorData?.color || '#f0f0f0',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
                <Space direction="vertical" size={0}>
                  <Text strong>{colorName}</Text>
                  <Text type="secondary">#{colorCode}</Text>
                </Space>
              </Space>
            );
          }
        },
        {
          title: <Space>Tipo</Space>,
          key: 'quantity',
          width: '10%',
          align: 'center',
          render: (_, record) => (
            <Tag color={record.sales_unit === "POR METRO" ? "green" : "purple"}>
              {record.sales_unit || 'No especificado'}
            </Tag>
          )
        },
        {
          title: <Space><BsRulers /> Cantidad</Space>,
          key: 'quantity',
          width: '10%',
          align: 'right',
          render: (_, record) => (
            <Space>
              <span>{record.quantity_meterage || 0} m</span>
            </Space>
          )
        },
        {
          title: <Space><ScissorOutlined /> Cortes</Space>,
          key: 'cuts',
          width: '5%',
          responsive: ['sm'],
          align: 'center',
          render: (_, record) => record.cuts || 0
        },
        {
          title: <Space><DollarOutlined /> Precio Unit.</Space>,
          key: 'unit_price',
          width: '12.5%',
          responsive: ['sm'],
          align: 'right',
          render: (_, record) => `${Number(record.unit_price || 0).toFixed(2)} Bs.`
        },
        {
          title: <Space><DollarOutlined /> Subtotal</Space>,
          key: 'subtotal',
          width: '12.5%',
          align: 'right',
          responsive: ['lg', 'md'],
          render: (_, record) => {
            const price = Number(record.unit_price || 0);
            const quantity = Number(record.quantity_meterage || 0);
            const subtotal = price * quantity;
            return `${subtotal.toFixed(2)} Bs.`;
          }
        }
      ]}
    />
  );
};



const OrderList = ({ salesList, handleStatusChange }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const handleCompleteSale = async (orderId) => {
    try {
      await handleStatusChange(orderId, 'COMPLETADO');
      message.success('Pedido completado exitosamente');
      setDetailModalVisible(false);
    } catch (error) {
      message.error('Error al completar el pedido');
    }
  };

  const handleCancelSale = async (orderId) => {
    try {
      await handleStatusChange(orderId, 'CANCELADO');
      message.success('Pedido cancelado exitosamente');
      setDetailModalVisible(false);
    } catch (error) {
      message.error('Error al cancelar el pedido');
    }
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleAddPayment = (orderId) => {
    setSelectedOrder(salesList.find(sale => sale.id === orderId));
    setPaymentModalVisible(true);
  };

  const calculateTotal = (details) => {
    return details?.reduce((sum, item) => 
      sum + (Number(item.quantity_meterage) * Number(item.unit_price)), 0
    ) || 0;
  };

  const calculateTotalPaid = (payments) => {
    return payments?.data?.reduce((sum, payment) => 
      sum + (Number(payment.attributes.amount) || 0), 0
    ) || 0;
  };

  const columns = [
    {
      title: <Space><IdcardOutlined /> ID</Space>,
      dataIndex: 'id',
      key: 'id',
      width: '80px',
    },
    {
      title: <Space><UserOutlined /> Cliente</Space>,
      dataIndex: ['attributes', 'client', 'data', 'attributes'],
      key: 'client',

      render: (client) => (
        <Space direction="vertical" size={0}>
          <Text strong>{client?.name || 'Cliente normal'}</Text>
          <Space>
            <PhoneOutlined />
            <Text type="secondary">{client?.phone_1 || 'Sin teléfono'}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: <Space><CalendarOutlined /> Fecha</Space>,
      dataIndex: ['attributes', 'createdAt'],
      key: 'date',

      render: (date) => (
        <Space>
          <ClockCircleOutlined />
          {formatDate(date)}
        </Space>
      ),
    },
    {
      title: <Space><DollarOutlined /> Total (Bs.)</Space>,
      dataIndex: 'attributes',
      key: 'total',
      render: (attributes) => {
        const total = calculateTotal(attributes.detail);
        const totalPagado = attributes.payments?.data?.reduce((sum, payment) => 
          sum + (Number(payment.attributes.amount) || 0), 0) || 0;
        const isPaid = totalPagado >= total;
        const remaining = total - totalPagado;

        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: isPaid ? '#52c41a' : undefined }}>
              {total.toFixed(2)} Bs.
            </Text>
            {!isPaid && (
              <Text type="danger" style={{ fontSize: '12px' }}>
                Falta: {remaining.toFixed(2)} Bs.
              </Text>
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Pagado: {totalPagado.toFixed(2)} Bs.
            </Text>
          </Space>
        );
      },
    },
    {
      title: <Space><TagsOutlined style={{color: '#1890ff'}} /> Estado</Space>,
      key: 'status',
      render: (_, record) => (
        record.attributes.status !== 'CANCELADO' ? (
          <Select
            defaultValue={record.attributes.status === 'COMPLETADO' ? 'COMPLETADO' : 'PENDIENTE'}
            onChange={(value) => handleStatusChange(record.id, value)}
            className={`status-select ${record.attributes.status}`}
          >
            <Select.Option value="PENDIENTE">
              <ClockCircleOutlined style={{color: '#ff4d4f'}} /> PENDIENTE
            </Select.Option>
            <Select.Option value="COMPLETADO">
              <CheckCircleOutlined style={{color: '#52c41a'}} /> COMPLETADO
            </Select.Option>
          </Select>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            CANCELADO
          </Tag>
        )
      ),
    },
    {
      title: <Space><AppstoreOutlined /> Acciones</Space>,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles" color='#4F646F'>
            <Button
              icon={<EyeOutlined />}
              size='small'
              style={{
                color: '#4F646F',
                borderColor: '#4F646F'
              }}
              onClick={() => showOrderDetails(record)}
            />
          </Tooltip>
          
          <Tooltip title="Imprimir" color='#F8BD25'>
            <Button
              icon={<PrinterOutlined />}
              size='small'
              style={{
                color: '#F8BD25',
                borderColor: '#F8BD25'
              }}
              onClick={() => showOrderDetails(record)}
            />
          </Tooltip>
          
          {record.attributes.status !== 'COMPLETADO' && (
            <Tooltip title="Registrar pago" color='#52c41a'>
              <Button
                icon={<DollarCircleOutlined />}
                size='small'
                style={{
                  color: '#52c41a',
                  borderColor: '#52c41a'
                }}
                onClick={() => handleAddPayment(record.id)}
              />
            </Tooltip>
          )}

          {record.attributes.status !== 'CANCELADO' && (
            <Tooltip title="Cancelar pedido" color='#ff4d4f'>
              <Button
                icon={<CloseCircleOutlined />}
                size='small'
                style={{
                  color: '#ff4d4f',
                  borderColor: '#ff4d4f'
                }}
                onClick={() => handleCancelOrder(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: '¿Estás seguro de cancelar este pedido?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, cancelar',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // Aquí iría tu llamada a la API para actualizar el estado
          await handleStatusChange(orderId, 'CANCELADO');
          message.success('Pedido cancelado exitosamente');
        } catch (error) {
          message.error('Error al cancelar el pedido');
        }
      },
    });
  };

  return (
    <div className="orders-container">
      
      <Table 
        scroll={{ x: 700 }}
        size='small'
        columns={columns}
        dataSource={salesList}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <ExpandedDetails detail={record.attributes.detail} />
          ),
          expandRowByClick: true
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} pedidos`,
          responsive: true,
          size: "small"
        }}
        className="orders-table"
      />

      {/* Modal de Detalles */}
      <SaleDetailModal
        visible={detailModalVisible}
        sale={selectedOrder}
        onClose={() => setDetailModalVisible(false)}
        onCompleteSale={handleCompleteSale}
        onCancelSale={handleCancelSale}
        onAddPayment={handleAddPayment}
      />

      {/* Modal de Pagos */}
      <PaymentModal
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        sale={selectedOrder}
        totalToPay={selectedOrder ? calculateTotal(selectedOrder.attributes.detail) : 0}
        totalPaid={selectedOrder ? calculateTotalPaid(selectedOrder.attributes.payments) : 0}
        onSuccess={() => {
          setPaymentModalVisible(false);
          // Aquí podrías agregar una función para recargar los datos
        }}
      />
    </div>
  );
};

export default OrderList;
