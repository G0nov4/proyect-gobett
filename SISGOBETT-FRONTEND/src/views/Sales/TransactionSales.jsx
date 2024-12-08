import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Row, Col, Card, Input, Typography, Tag, Dropdown, Menu, Checkbox, Divider, DatePicker, Modal, Select } from 'antd';
import { SearchOutlined, DollarOutlined,  UserOutlined, CalendarOutlined, HomeOutlined, CheckCircleOutlined, ClockCircleOutlined, TagOutlined, FileTextOutlined, ShoppingCartOutlined, BarChartOutlined, PercentageOutlined, CloseCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { pdf } from '@react-pdf/renderer';

import { useSales, useUpdateSaleStatus } from '../../services/Sales';

import SaleDetailModal from '../../components/Modals/SaleDetailModal';
import { updateSaleStatus } from '../../services/Sales';
import { message } from 'antd';
import { generatePeriodSalesReport } from '../../utils/admin/PeriodSalesReport';
import { generatePeriodClientsReport } from '../../utils/admin/PeriodClientsReport';
import generatePeriodProductsReport from '../../utils/admin/PeriodProductsReport';

const { Title } = Typography;

ChartJS.register(ArcElement, Tooltip, Legend);
const TransactionSales = () => {
    const [searchText, setSearchText] = useState('');
    const updateSaleStatusMutation = useUpdateSaleStatus();
    const [selectedSale, setSelectedSale] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { data: salesData, isLoading: isLoadingSales, refetch } = useSales('id', 'asc', {
        pagination: {
            pageSize: 1000
        }
    });
    const topProductsData = useMemo(() => {
        if (!salesData?.data) return null;

        const productCount = {};
        salesData.data.forEach(sale => {
            sale.attributes.detail.forEach(item => {
                const fabricName = item.fabric?.data?.attributes?.name;
                productCount[fabricName] = (productCount[fabricName] || 0) + item.quantity_meterage;
            });
        });

        const sortedProducts = Object.entries(productCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        return {
            labels: sortedProducts.map(([name]) => name),
            datasets: [{
                data: sortedProducts.map(([,count]) => count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            }]
        };
    }, [salesData]);

    const columns = [
        {
            title: (
                <Space>
                    <ShoppingCartOutlined />
                    ID
                </Space>
            ),
            dataIndex: 'id',
            key: 'id',
            width: '80px'
        },
        {
            title: (
                <Space>
                    <HomeOutlined />
                    Sucursal
                </Space>
            ),
            key: 'branch',
            render: (record) => {
                const branchName = record.attributes?.branch?.data?.attributes?.name || 'Principal';
                return (
                    <Tag color="cyan">
                        {branchName.toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: (
                <Space> 
                    <UserOutlined />
                    Cliente
                </Space>
            ),

            key: 'client',
            render: ( record) => {
                const name = record.attributes?.client?.data?.attributes?.name || 'Cliente';
                const lastName = record.attributes?.client?.data?.attributes?.last_name;
                return lastName ? `${name} ${lastName}` : name;
            }
        },
        {
            title: (
                <Space>
                    <CalendarOutlined />
                    Fecha
                </Space>
            ),
            dataIndex: ['attributes', 'createdAt'],
            key: 'date',
            render: (text) => new Date(text).toLocaleDateString()
        },
        {
            title: (
                <Space>
                    <DollarOutlined />
                    Total
                </Space>
            ),
            key: 'total',
            render: (_, record) => {
                const total = record.attributes.detail.reduce((sum, item) => 
                    sum + (item.quantity_meterage * item.unit_price), 0
                );
                return `Bs. ${total.toFixed(2)}`;
            }
        },
        {
            title: (
                <Space>
                    <HomeOutlined />
                    Entrega
                </Space>
            ),
            dataIndex: ['attributes', 'delivery'],
            key: 'delivery',
            render: (text) => (
                <Tag color={text === 'EN TIENDA' ? 'green' : 'blue'}>
                    {text}
                </Tag>
            )
        },
        {
            title: (
                <Space>
                    <TagOutlined />
                    Estado
                </Space>
            ),
            dataIndex: ['attributes', 'status'],
            key: 'status',
            render: (status) => {
                let color = 'processing';
                let icon = <ClockCircleOutlined />;
                let text = 'PENDIENTE';

                if (status === 'COMPLETADO') {
                    color = 'success';
                    icon = <CheckCircleOutlined />;
                    text = 'COMPLETADO';
                } else if (status === 'CANCELADO') {
                    color = 'error';
                    icon = <CloseCircleOutlined />;
                    text = 'CANCELADO';
                }

                return (
                    <Tag color={color} icon={icon}>
                        {text}
                    </Tag>
                );
            }
        }
    ];

    const handleCompleteSale = async (saleId) => {
        try {
            // Llamada a tu API para actualizar el estado
            await updateSaleStatus(saleId, true);
            // Recargar los datos
            refetch();
            setModalVisible(false);
        } catch (error) {
            console.error('Error al completar la venta:', error);
            message.error('Error al completar la venta');
        }
    };

    const handleCancelSale = async (saleId) => {
        try {
            await updateSaleStatusMutation.mutateAsync  ({
                id: saleId,
                newStatus: 'CANCELADO'
            });
            refetch();
            setModalVisible(false);
        } catch (error) {
            console.error('Error al cancelar la venta:', error);
            message.error('Error al cancelar la venta');
        }
    };

    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportType, setReportType] = useState('sales');
    const [reportDateRange, setReportDateRange] = useState(null);

    const handleGenerateReport = async () => {
        if (reportType === 'sales' && !reportDateRange) {
            message.warning('Por favor seleccione un período');
            return;
        }

        if (!salesData?.data || salesData.data.length === 0) {
            message.warning('No hay datos de ventas disponibles');
            return;
        }

        try {
            let blob;
            if (reportType === 'sales') {
                const [startDate, endDate] = reportDateRange;
                const filteredSales = salesData.data.filter(sale => {
                    if (!sale?.attributes?.createdAt) return false;
                    const saleDate = new Date(sale.attributes.createdAt);
                    return saleDate >= startDate && saleDate <= endDate;
                }).map(sale => ({
                    id: sale.id,
                    attributes: {
                        ...sale.attributes,
                        client: {
                            data: {
                                attributes: {
                                    name: sale.attributes?.client?.data?.attributes?.name || 'Cliente General',
                                    kind_of_client: sale.attributes?.client?.data?.attributes?.kind_of_client || 'NORMAL'
                                }
                            }
                        },
                        branch: {
                            data: {
                                attributes: {
                                    name: sale.attributes?.branch?.data?.attributes?.name || 'Principal'
                                }
                            }
                        },
                        detail: sale.attributes.detail.map(item => ({
                            quantity_meterage: item.quantity_meterage || 0,
                            unit_price: item.unit_price || 0,
                            fabric: {
                                data: {
                                    attributes: {
                                        name: item.fabric?.data?.attributes?.name || 'Producto sin nombre',
                                        code: item.fabric?.data?.attributes?.code || 'S/C'
                                    }
                                }
                            },
                            color: {
                                data: {
                                    attributes: {
                                        name: item.color?.data?.attributes?.name || 'Sin color'
                                    }
                                }
                            }
                        }))
                    }
                }));

                if (filteredSales.length === 0) {
                    message.warning('No se encontraron ventas en el período seleccionado');
                    return;
                }

                const reportData = {
                    sales: filteredSales,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                };

                blob = await pdf(generatePeriodSalesReport(reportData)).toBlob();
            } else if (reportType === 'clients') {
                const clientSales = salesData.data.map(sale => ({
                    id: sale.id,
                    attributes: {
                        ...sale.attributes,
                        client: {
                            data: {
                                attributes: {
                                    name: sale.attributes?.client?.data?.attributes?.name || 'Cliente General',
                                    kind_of_client: sale.attributes?.client?.data?.attributes?.kind_of_client || 'NORMAL'
                                }
                            }
                        },
                        total: sale.attributes.detail.reduce((sum, item) => 
                            sum + (item.quantity_meterage * item.unit_price), 0)
                    }
                }));

                const reportData = {
                    sales: clientSales
                };

                blob = await pdf(generatePeriodClientsReport(reportData)).toBlob();
            } else if (reportType === 'products') {
                const reportData = {
                    sales: salesData.data
                };
                blob = await pdf(generatePeriodProductsReport(reportData)).toBlob();
            }
            
            const url = URL.createObjectURL(blob);
            window.open(url);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            message.error('Error al generar el reporte');
        }
    };

    const filteredSales = useMemo(() => {
        if (!salesData?.data || !searchText) return salesData?.data;

        return salesData.data.filter(sale => {
            const clientName = `${sale.attributes?.client?.data?.attributes?.name || ''} ${sale.attributes?.client?.data?.attributes?.last_name || ''}`.toLowerCase();
            const productsText = sale.attributes.detail.map(item => 
                item.fabric.data.attributes.name.toLowerCase()
            ).join(' ');
            const searchLower = searchText.toLowerCase();

            return clientName.includes(searchLower) || productsText.includes(searchLower);
        });
    }, [salesData?.data, searchText]);

    return (
        <div >
            <Row  style={{ padding: { xs: '16px', sm: '24px' }, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: '16px', sm: '0' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '12px'
              }}>
                <div>
                  <h1 style={{ 
                    margin: 0,
                    fontSize: { xs: '24px', sm: '32px' },
                    background: 'linear-gradient(45deg, #ff4d4f, #ff7875)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    Gestión de Ventas
                  </h1>
                  <p style={{ 
                    margin: '8px 0 0', 
                    color: '#8c8c8c',
                    fontSize: { xs: '14px', sm: '16px' },
                    fontWeight: 500
                  }}>
                    {salesData?.data?.length || 0} ventas registradas
                  </p>
                </div>
                <Space size="middle" wrap>
                 
                    <Button 
                      icon={<FileTextOutlined />}
                      type='default'
                      size='middle'
                      onClick={() => setReportModalVisible(true)}
                      style={{ 
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        borderColor: '#ff4d4f',
                        color: '#ff4d4f'
                      }}
                    >
                      Reportes
                    </Button>
           
                </Space>
              </div>

              <Input.Search
                placeholder="Buscar por cliente o producto..."
                style={{ 
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '400px' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: '8px'
                }}
                size="large"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                enterButton={
                  <Button 
                    type="primary" 
                    style={{
                      background: '#ff4d4f',
                      borderColor: '#ff4d4f'
                    }}
                  >
                    Buscar
                  </Button>
                }
              />
            </Row>

            {/* Contenido principal */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={18} style={{ marginTop: '16px' }}>
                  
                        <Table
                            columns={columns}
                            dataSource={filteredSales}
                            loading={isLoadingSales}
                            size="small"
                            pagination={{ 
                                pageSize: 7,
                                showTotal: (total) => `Total ${total} ventas`
                            }}
                            rowKey={record => record.id}
                            scroll={{ y: 400 }}
                            onRow={(record) => ({
                                onClick: () => {
                                    setSelectedSale(record);
                                    setModalVisible(true);
                                },
                                style: { cursor: 'pointer' }
                            })}
                        />
            
                </Col>

                <Col xs={24} lg={6}>
                    <Card 
                        title="Productos más Vendidos" 
                        bordered={false}
                        headStyle={{ 
                            backgroundColor: '#fafafa',
                            borderBottom: '1px solid #f0f0f0'
                        }}
                    >
                        {topProductsData && (
                            <div style={{ height: '200px' }}>
                                <Doughnut 
                                    data={topProductsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    boxWidth: 12,
                                                    padding: 15
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <SaleDetailModal
                visible={modalVisible}
                sale={selectedSale}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedSale(null);
                }}
                onCompleteSale={handleCompleteSale}
                onCancelSale={handleCancelSale}
            />

            <Modal
                title={<Title level={4}>Generar Reporte</Title>}
                open={reportModalVisible}
                onCancel={() => setReportModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setReportModalVisible(false)}>
                        Cancelar
                    </Button>,
                    <Button 
                        key="generate" 
                        type="primary" 
                        onClick={handleGenerateReport}
                        style={{ background: '#ff4d4f' }}
                    >
                        Generar Reporte
                    </Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <p style={{ marginBottom: '8px', fontWeight: 500 }}>Tipo de Reporte</p>
                        <Select
                            style={{ width: '100%' }}
                            value={reportType}
                            onChange={setReportType}
                            options={[
                                {
                                    value: 'sales',
                                    label: (
                                        <Space>
                                            <BarChartOutlined />
                                            Ventas por Período
                                        </Space>
                                    )
                                },
                                {
                                    value: 'products',
                                    label: (
                                        <Space>
                                            <ShoppingOutlined />
                                            Ventas por Producto
                                        </Space>
                                    )
                                },
                                {
                                    value: 'clients',
                                    label: (
                                        <Space>
                                            <UserOutlined />
                                            Clientes Frecuentes
                                        </Space>
                                    )
                                }
                            ]}
                        />
                    </div>
                    {reportType === 'sales' && (
                        <div>
                            <p style={{ marginBottom: '8px', fontWeight: 500 }}>Período</p>
                            <DatePicker.RangePicker
                                style={{ width: '100%' }}
                                onChange={setReportDateRange}
                                format="DD/MM/YYYY"
                            />
                        </div>
                    )}
                </Space>
            </Modal>
          
        </div>
    );
};

export default TransactionSales;