import React, { useState, useMemo } from 'react';
import { Badge, Button, Card, Col, DatePicker, Divider, Modal, Radio, Row, Space, Spin, Statistic, Table, Typography, message, Alert, Input } from 'antd';
import { BarChartOutlined, CalendarOutlined, PrinterOutlined, ShoppingCartOutlined, UserOutlined, ClockCircleOutlined, DollarOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePayments } from '../../services/Payments';
import {
  groupAndSortPayments,
  calculateDailyTotal,
  getDailyTransactionsCount,
  calculateAverageTransaction,
  getDateRange,
  getFilteredPayments,
} from '../../utils/movementsUtils';

import { generatePaymentsReport, printReport } from '../../utils/operator/reportsUtils';
import './Movements.css';
import { debounce } from 'lodash';


const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const Movements = () => {
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState([])
  const [reportType, setReportType] = useState('day');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [customDateRange, setCustomDateRange] = useState(null);
  const [activeFilter, setActiveFilter] = useState('day');
  const [searchText, setSearchText] = useState('');

  const { data: paymentsData, isLoading: isLoadingPayments } = usePayments(
    'payment_date',
    'desc',
    currentPage,
    pageSize
  );

  const columns = [
    {
      title: <Space><ClockCircleOutlined /> Fecha y Hora</Space>,
      dataIndex: ['attributes', 'payment_date'],
      key: 'time',
      render: (date, record) => {
        if (record.isHeader) {
          return (
            <Text strong style={{ fontSize: '14px' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </Text>
          );
        }
        return (
          <Space direction="vertical" size={0}>
            <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
            <Text type="secondary">{dayjs(record.attributes.createdAt).format('HH:mm')}</Text>
          </Space>
        );
      },
      width: '150px'
    },
    {
      title: <Space><ShoppingCartOutlined /> Tipo de Venta</Space>,
      key: 'salesType',
      render: (record) => {
        if (record.isHeader) return null;
        const salesType = record.attributes.sale?.data?.attributes?.sales_type;
        const delivery = record.attributes.sale?.data?.attributes?.delivery;
        
        const getTypeIcon = (type) => {
          switch(type) {
            case 'PEDIDO':
              return <ShoppingCartOutlined style={{ color: '#1890ff' }} />;
            case 'VENTA DIRECTA':
              return <DollarOutlined style={{ color: '#52c41a' }} />;
            default:
              return <DollarOutlined style={{ color: '#faad14' }} />;
          }
        };

        const getDeliveryBadge = (deliveryType) => {
          if (!deliveryType) return null;
          const color = deliveryType === 'EN DOMICILIO' ? 'blue' : 'green';
          return <Badge color={color} text={deliveryType} />;
        };

        return (
          <Space direction="vertical" size={0}>
            <Space>
              {getTypeIcon(salesType)}
              <Text>{salesType || 'PAGO DIRECTO'}</Text>
            </Space>
            {delivery && getDeliveryBadge(delivery)}
          </Space>
        );
      },
      width: '150px'
    },
    {
      title: <Space><UserOutlined /> Cliente</Space>,
      key: 'client',
      render: (record) => {
        if (record.isHeader) return null;
        const client = record.attributes.sale?.data?.attributes?.client?.data?.attributes;
        return client ? (
          <Space direction="vertical" size={0}>
            <Text strong>{`${client.name} ${client.last_name}`}</Text>
            {client.phone_1 && (
              <Text type="secondary" copyable style={{fontSize: '12px'}}>
                {client.phone_1}
              </Text>
            )}
          </Space>
        ) : <Text type="secondary">Cliente General</Text>;
      },
      width: '150px'
    },
    {
      title: <Space><DollarOutlined /> Monto</Space>,
      key: 'amount',
      render: (record) => {
        if (record.isHeader) {
          return (
            <Text strong style={{ color: '#1890ff' }}>
              Total del día: Bs. {record.attributes.totalAmount.toFixed(2)}
            </Text>
          );
        }
        return (
          <Text strong style={{ color: '#52c41a' }}>
            Bs. {record.attributes.amount?.toFixed(2)}
          </Text>
        );
      },
      width: '150px'
    },
    {
      title: <Space><FileTextOutlined /> Notas</Space>,
      dataIndex: ['attributes', 'notes'],
      key: 'notes',
      render: (notes, record) => {
        if (record.isHeader) return null;
        return notes || '-';
      },
      width: '150px'
    }
  ];

  const handleReportTypeChange = (e) => {
    const type = e.target.value;
    setReportType(type);
    
    const endDate = dayjs();
    let startDate;

    switch (type) {
      case 'day':
        startDate = dayjs().startOf('day');
        break;
      case 'week':
        startDate = dayjs().startOf('week');
        break;
      case 'month':
        startDate = dayjs().startOf('month');
        break;
      case 'year':
        startDate = dayjs().startOf('year');
        break;
      default:
        startDate = endDate;
    }

    setDateRange([startDate, endDate]);
  };

  const generateAndPrintReport = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.error('Por favor seleccione un rango de fechas');
      return;
    }


    setIsReportModalVisible(false);
  };

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
    if (filterType !== 'custom') {
      const [start, end] = getDateRange(filterType);
      setDateRange([start, end]);
      setCustomDateRange(null);
    }
  };

  const handleCustomDateChange = (dates) => {
    if (dates) {
      setActiveFilter('custom');
      setCustomDateRange(dates);
      setDateRange(dates);
    }
  };

  const getFilteredData = () => {
    if (!paymentsData?.data) return [];
    
    let filteredByDate = getFilteredPayments(paymentsData.data, dateRange);
    
    // Filtrar por búsqueda de cliente si hay texto
    if (searchText) {
      filteredByDate = filteredByDate.filter(payment => {
        const client = payment.attributes.sale?.data?.attributes?.client?.data?.attributes;
        if (!client) return false;
        
        const searchLower = searchText.toLowerCase();
        const fullName = `${client.name} ${client.last_name}`.toLowerCase();
        const phone = client.phone_1 || '';
        
        return fullName.includes(searchLower) || 
               phone.includes(searchLower);
      });
    }

    return groupAndSortPayments(filteredByDate);
  };

  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchText(value), 300),
    []
  );

  if (isLoadingPayments) return <Spin spinning={isLoadingPayments} />;

  return (
    <>
      <Row >
        <Col span={24} style={{ padding: '0px 10px' }}>
         <Row justify={'space-between'} align={'middle'}>

            <Title level={4} style={{ textTransform: 'uppercase', padding: 0, margin:'10px 0px' }}>MOVIMIENTOS</Title>

            <Space>
              <Input.Search
                placeholder="Buscar por cliente o teléfono"
                allowClear
                enterButton={<SearchOutlined />}
                onChange={(e) => debouncedSearch(e.target.value)}
                style={{ 
            
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}
              />
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={() => setIsReportModalVisible(true)}
              >
                Generar Reporte
              </Button>
            </Space>
        </Row>
        </Col>

        {searchText && (
          <Col span={24} style={{ padding: '10px' }}>
            <Alert
              message={
                <Space>
                  <SearchOutlined />
                  {`Buscando: "${searchText}"`}
                </Space>
              }
              type="info"
              showIcon={false}
              style={{ 
                textAlign: 'center',
                borderRadius: '6px'
              }}
              action={
                <Button 
                  size="small" 
                  type="text" 
                  onClick={() => setSearchText('')}
                >
                  Limpiar búsqueda
                </Button>
              }
            />
          </Col>
        )}

        <Col span={24} style={{ padding: '10px' }}>
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={[8, 8]} justify="center" align="middle">
                    <Col>
                      <Space wrap>
                        {[
                          { key: 'day', label: 'Día', icon: <CalendarOutlined /> },
                          { key: 'week', label: 'Semana', icon: <BarChartOutlined /> },
                          { key: 'month', label: 'Mes', icon: <BarChartOutlined /> },
                          { key: 'year', label: 'Año', icon: <BarChartOutlined /> },
                        ].map(({ key, label, icon }) => (
                          <Button
                            key={key}
                            type={activeFilter === key ? 'primary' : 'default'}
                            onClick={() => handleFilterChange(key)}
                            icon={icon}
                            style={{
                              borderRadius: '6px',
                              boxShadow: activeFilter === key ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                              transition: 'all 0.3s'
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </Space>
                    </Col>
                    <Col>
                      <RangePicker
                        value={customDateRange}
                        onChange={handleCustomDateChange}
                        format="DD/MM/YYYY"
                        placeholder={['Fecha inicio', 'Fecha fin']}
                        style={{
                          borderRadius: '6px',
                          boxShadow: activeFilter === 'custom' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                        }}
                        ranges={{
                          'Última Semana': [dayjs().subtract(7, 'day'), dayjs()],
                          'Último Mes': [dayjs().subtract(1, 'month'), dayjs()],
                          'Último Año': [dayjs().subtract(1, 'year'), dayjs()],
                        }}
                      />
                    </Col>
                  </Row>
                  
                  {dateRange?.length === 2 && (
                    <Alert
                      message={
                        <Space>
                          <CalendarOutlined />
                          {`Mostrando registros del ${dateRange[0].format('DD/MM/YYYY')} al ${dateRange[1].format('DD/MM/YYYY')}`}
                        </Space>
                      }
                      type="info"
                      showIcon={false}
                      style={{ 
                        textAlign: 'center',
                        borderRadius: '6px',
                        marginTop: '10px'
                      }}
                    />
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24} style={{ padding: '0px 10px' }}>
          <Table
            size='small'
            columns={columns}
            dataSource={getFilteredData()}
            loading={isLoadingPayments}
            rowKey={(record) => record.id || record.date}

            scroll={{
              y: 55 * 6,
              x: 400
            }}
            rowClassName={(record) => record.isHeader ? 'date-header-row' : ''}
            locale={{
              emptyText: searchText 
                ? 'No se encontraron movimientos para esta búsqueda'
                : 'No hay movimientos en este período'
            }}
          />
        </Col>
      </Row>

      <Modal
        title={<Space><BarChartOutlined /> Generar Reporte</Space>}
        visible={isReportModalVisible}
        onCancel={() => setIsReportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsReportModalVisible(false)}>
            Cancelar
          </Button>,
          <Button
            key="generate"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={generateAndPrintReport}
          >
            Imprimir Reporte
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Seleccione el período:</Text>
            <Radio.Group 
              onChange={handleReportTypeChange} 
              value={reportType}
              style={{ marginTop: 10, width: '100%' }}

            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio.Button value="day" style={{ width: '100%', textAlign: 'center' }}>
                  Hoy
                </Radio.Button>
                <Radio.Button value="week" style={{ width: '100%', textAlign: 'center' }}>
                  Esta Semana
                </Radio.Button>
                <Radio.Button value="month" style={{ width: '100%', textAlign: 'center' }}>
                  Este Mes
                </Radio.Button>
                <Radio.Button value="year" style={{ width: '100%', textAlign: 'center' }}>
                  Este Año
                </Radio.Button>
              </Space>
            </Radio.Group>
          </div>
          
          <div>
            <Text strong>O seleccione un rango personalizado:</Text>
            <RangePicker
              style={{ width: '100%', marginTop: 10 }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
            />
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default Movements;