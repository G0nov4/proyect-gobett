import { Badge, Button, Col, ColorPicker, Divider, Dropdown, Flex, Form, Input, List, Menu, Popconfirm, Row, Skeleton, Space, Spin, Table, Tooltip, message } from 'antd'
import React, { useState } from 'react'
import { red, blue, volcano, presetDarkPalettes, gold, lime, grey } from '@ant-design/colors';
import './Promos.css';
import { useQueryClient } from 'react-query';
import { useCreatePromo, useDeletePromo, usePromos } from '../../services/Promotions';
import { BarChartOutlined, BarcodeOutlined, DeleteOutlined, DownOutlined, EditOutlined, EyeFilled, PlusOutlined, QuestionCircleOutlined, RotateLeftOutlined, ShopOutlined, SortAscendingOutlined, SyncOutlined, UpOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { MdCalendarToday, MdColorize, MdDiscount, MdEditCalendar } from 'react-icons/md';
import PromotionModal from '../../components/operator/PromotionModal';
import { Tag } from 'antd';
import { FaPercent, FaMoneyBillWave } from 'react-icons/fa';

function Promos() {
    const { data: promos, isLoading } = usePromos()
    const deletePromotionMutation = useDeletePromo();
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCancel = () => {
        setIsModalVisible(false)
        setSelectedPromo(null);
    }

    const handleEditClient = (record) => {
        console.log(record)
        setSelectedPromo(record);
        setIsModalVisible(true);
    };

    const handleDeleteClient = (record) => {
        deletePromotionMutation.mutate(record.key, {
            onSuccess: () => {
                message.success('Promoción eliminada correctamente');
            },
            onError: () => {
                message.error('Error al eliminar la promoción');
            },
        });
    };
    if (isLoading) {
        <Spin></Spin>
    }
    const columns = [
        {
            title: (
                <Space>
                    <ShopOutlined />
                    <span>Nombre y Código</span>
                </Space>
            ),
            key: 'promotion_name',
            width: 200,
            render: (record) => {
                return (
                    <Space direction="vertical" size={1}>
                        <Space>
                            {record.promotion_type === 'PORCENTAJE' ? 
                                <FaPercent style={{ color: '#1890ff' }}/> : 
                                <FaMoneyBillWave style={{ color: '#52c41a' }}/>
                            }
                            <span style={{ fontWeight: 500 }}>{record.promotion_name}</span>
                        </Space>
                        <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            Código: {record.code}
                        </span>
                    </Space>
                )
            }
        },
        {
            title: (
                <Space>
                    <MdDiscount />
                    <span>Descuento</span>
                </Space>
            ),
            key: 'discount',
            align: 'center',
            width: 80,
            render: (record) => {
                const isPercentage = record.promotion_type === 'PORCENTAJE';
                return (
                    <Tag color={isPercentage ? 'blue' : 'green'} style={{ fontSize: '14px' }}>
                        {isPercentage ? `${record.discount}%` : `${record.discount} Bs.`}
                    </Tag>
                );
            }
        },
        {
            title: (
                <Space>
                    <MdCalendarToday />
                    <span>Periodo</span>
                </Space>
            ),
            key: 'dates',
            width: 100,
            render: (record) => {
                return (
                    <Space direction="vertical" size={1}>
                        <span style={{ fontSize: '13px' }}>
                            <strong>Inicio:</strong> {record.start_date}
                        </span>
                        <span style={{ fontSize: '13px' }}>
                            <strong>Fin:</strong> {record.end_date}
                        </span>
                    </Space>
                )
            }
        },
        {
            title: 'Estado',
            key: 'status',
            width: 100,
            align: 'center',
            render: (record) => {
                const today = new Date();
                const endDate = new Date(record.end_date);
                const startDate = new Date(record.start_date);
                
                let status = {
                    text: 'Activo',
                    color: 'success'
                };
                
                if (today > endDate) {
                    status = { text: 'Expirado', color: 'error' };
                } else if (today < startDate) {
                    status = { text: 'Pendiente', color: 'warning' };
                }
                
                return <Badge status={status.color} text={status.text} />;
            }
        },
        {
            title: (
                <Space>
                    <span>Acciones</span>
                </Space>
            ),
            key: 'accion',
            width: 45,
            align: 'center',
            fixed: 'right',
            render: (_, record) => {

                return (

                    <Space>
                        
                        <Tooltip title="Editar" color='#F8BD25' key='Editar'>
                            <Button
                                icon={<EditOutlined />}
                                size='small'
                                style={{
                                    color: '#F8BD25', borderColor: '#F8BD25'
                                }}
                                onClick={() => handleEditClient(record)}
                            />
                        </Tooltip>
                        <Tooltip title="Eliminar" color='#000' key='Eliminar'>
                            <Popconfirm
                                title="Eliminar Promocion"
                                placement='left'
                                description="Esta accion no podra revertirse."
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={() => handleDeleteClient(record)}
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    size='small'

                                />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                )
            },
        },
    ]

    const getFilteredPromos = () => {
        if (!promos?.data) return [];
        
        return promos.data
            .map(item => ({ ...item.attributes, key: item.id }))
            .filter(promo => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    promo.promotion_name.toLowerCase().includes(searchLower) ||
                    promo.code.toLowerCase().includes(searchLower) ||
                    promo.discount.toString().includes(searchLower)
                );
            });
    };

    return (
        <Col span={24}>

            <Row style={{ padding: { xs: '16px', sm: '24px' }, display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                    Gestión de Descuentos
                  </h1>
                  <p style={{ 
                    margin: '8px 0 0', 
                    color: '#8c8c8c',
                    fontSize: { xs: '14px', sm: '16px' },
                    fontWeight: 500
                  }}>
                    {promos?.data?.length || 0} descuentos registrados
                  </p>
                </div>
                {isLoading ? (
                  <Space>
                    <Skeleton.Button active={true} size='small' />
                    <Skeleton.Button active={true} size='small' />
                    <Skeleton.Button active={true} size='small' />
                  </Space>
                ) : (
                  <Space size="middle" wrap>
                    
                    <Button 
                      onClick={() => {
                        setIsModalVisible(true)
                        setSelectedPromo(null)
                      }}
                      icon={<PlusOutlined />} 
                      type='primary'
                      size='large'
                      style={{ 
                        borderRadius: '8px',
                        background: '#ff4d4f',
                        boxShadow: '0 2px 4px rgba(255,77,79,0.3)',
                        border: 'none'
                      }}
                    >
                      Crear Descuento
                    </Button>
                  </Space>
                )}
              </div>

              <Input.Search
                placeholder="Buscar descuento..."
                style={{ 
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '400px' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: '8px'
                }}
                size="large"
                allowClear
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
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

            {/* MODAL PARA LOS DESCUENTOS */}
            <Spin spinning={isLoading} tip='Cargando datos de los descuentos'>
                <Table
                    style={{
                        marginTop: '12px'
                    }}
                    scroll={{
                        x: 900,
                    }}
                    bordered
                    virtual
                    columns={columns}
                    dataSource={isLoading ? [] : getFilteredPromos()}
                    size='small'
                    pagination={{
                        pageSize: 6,
                    }} />
            </Spin>

            <PromotionModal
                title="Gestión de Descuento"
                visible={isModalVisible}
                onCancel={handleCancel}
                promoData={selectedPromo}
            />

        </Col>
    )

}
export default Promos