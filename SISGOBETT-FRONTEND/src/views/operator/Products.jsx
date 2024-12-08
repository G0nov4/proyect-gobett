import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Typography, Space, Tag, Button, Table, Modal, Form, InputNumber, Select, message, Drawer, Descriptions, Statistic, Avatar, Tabs, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, SwapOutlined, AppstoreOutlined, BarsOutlined, PictureOutlined, BarChartOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRolls, useUpdateRollFootage, useUpdateRollStatus, useDeleteRoll } from '../../services/Rolls';
import './Products.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const Products = () => {
    const selectedBranch = localStorage.getItem('selected_branch');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedRoll, setSelectedRoll] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedFabric, setSelectedFabric] = useState(null);
    const [form] = Form.useForm();
    const [viewMode, setViewMode] = useState('grid');

    const { data: rollsData, isLoading } = useRolls({
        filters: {
            branch: { id: { $eq: selectedBranch } },
            status: { $eq: 'EN TIENDA' }
        },
        populate: ['fabric', 'color'],
        pagination: {
            pageSize: 100
        }
    });

    const updateRollFootage = useUpdateRollFootage();
    const updateRollStatus = useUpdateRollStatus();
    const deleteRoll = useDeleteRoll();

    const organizedData = useMemo(() => {
        if (!rollsData?.data) return {};

        return rollsData.data.reduce((acc, roll) => {
            const fabricId = roll.attributes.fabric.data.id;
            const fabricData = roll.attributes.fabric.data.attributes;
            const colorId = roll.attributes.color.data.id;

            if (!acc[fabricId]) {
                acc[fabricId] = {
                    fabricData: {
                        id: fabricId,
                        name: fabricData.name,
                        code: fabricData.code,
                        height: fabricData.height,
                        weight: fabricData.weight,
                        description: fabricData.description
                    },
                    colorGroups: {},
                    totalRolls: 0,
                    totalMeters: 0
                };
            }

            if (!acc[fabricId].colorGroups[colorId]) {
                acc[fabricId].colorGroups[colorId] = {
                    color: roll.attributes.color.data.attributes,
                    rolls: []
                };
            }

            acc[fabricId].colorGroups[colorId].rolls.push(roll);
            acc[fabricId].totalRolls += 1;
            acc[fabricId].totalMeters += roll.attributes.roll_footage;

            return acc;
        }, {});
    }, [rollsData]);

    const handleEdit = (roll) => {
        setSelectedRoll(roll);
        form.setFieldsValue({
            roll_footage: roll.attributes.roll_footage
        });
        setEditModalVisible(true);
    };

    const handleDelete = (roll) => {
        confirm({
            title: '¿Estás seguro de eliminar este rollo?',
            icon: <ExclamationCircleOutlined />,
            content: 'Esta acción no se puede deshacer',
            okText: 'Sí, eliminar',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteRoll.mutateAsync(roll.id);
                    message.success('Rollo eliminado correctamente');
                } catch (error) {
                    message.error('Error al eliminar el rollo');
                }
            }
        });
    };

    const handleUpdateFootage = async (values) => {
        try {
            await updateRollFootage.mutateAsync({
                id: selectedRoll.id,
                newFootage: values.roll_footage
            });
            message.success('Metraje actualizado correctamente');
            setEditModalVisible(false);
        } catch (error) {
            message.error('Error al actualizar el metraje');
        }
    };

    const FabricCard = ({ data, onClick }) => {
        return (
            <Card
                className="fabric-card"
                onClick={onClick}
                bordered={false}
            >
                <div className="fabric-card-inner">
                    {/* Indicador de estado y código */}
                    <div className="fabric-status-bar">
                        <div className="status-indicator" />
                        <span className="fabric-code">{data.fabricData.code}</span>
                    </div>

                    {/* Información principal */}
                    <div className="fabric-main">
                        <Title level={4} className="fabric-name">
                            {data.fabricData.name}
                        </Title>
                        
                        <div className="fabric-specs">
                            <Tag>{data.fabricData.height}cm</Tag>
                            <Tag>{data.fabricData.weight}gr/m²</Tag>
                        </div>
                    </div>

                    {/* Métricas */}
                    <div className="fabric-metrics">
                        <div className="metric">
                            <div className="metric-value">{data.totalRolls}</div>
                            <div className="metric-label">Rollos</div>
                        </div>
                        <div className="metric-divider" />
                        <div className="metric">
                            <div className="metric-value">{data.totalMeters}</div>
                            <div className="metric-label">Metros</div>
                        </div>
                    </div>

                    {/* Colores disponibles */}
                    <div className="fabric-colors">
                        {Object.values(data.colorGroups).slice(0, 5).map(({ color }, index) => (
                            <Tooltip title={color.name} key={color.id}>
                                <div 
                                    className="color-circle"
                                    style={{ 
                                        backgroundColor: color.color,
                                        zIndex: 5 - index
                                    }}
                                />
                            </Tooltip>
                        ))}
                        {Object.keys(data.colorGroups).length > 5 && (
                            <div className="color-circle more">
                                +{Object.keys(data.colorGroups).length - 5}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="products-container">
            <div className="products-header">
                <div className="header-content">
                    <Title level={2}>Inventario de Sucursal</Title>
                    <Text type="secondary">Gestión de rollos y telas disponibles</Text>
                </div>
                <Space>
                    <Button
                        icon={<AppstoreOutlined />}
                        type={viewMode === 'grid' ? 'primary' : 'default'}
                        onClick={() => setViewMode('grid')}
                    />
                    <Button
                        icon={<BarsOutlined />}
                        type={viewMode === 'list' ? 'primary' : 'default'}
                        onClick={() => setViewMode('list')}
                    />
                </Space>
            </div>

            <Row gutter={[16, 16]}>
                {Object.entries(organizedData).map(([fabricId, data]) => (
                    <Col xs={24} sm={viewMode === 'grid' ? 12 : 24} lg={viewMode === 'grid' ? 8 : 24} key={fabricId}>
                        <FabricCard
                            data={data}
                            onClick={() => {
                                setSelectedFabric(data);
                                setDrawerVisible(true);
                            }}
                        />
                    </Col>
                ))}
            </Row>

            <Drawer
                title={null}
                placement="right"
                width={800}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                className="fabric-drawer"
            >
                {selectedFabric && (
                    <>
                        <div className="drawer-header">
                            <div className="drawer-title">
                                <Avatar 
                                    size={64}
                                    src={selectedFabric.fabricData.fabric_images?.[0]?.url}
                                    icon={<PictureOutlined />}
                                />
                                <div className="drawer-title-text">
                                    <Title level={3}>{selectedFabric.fabricData.name}</Title>
                                    <Tag color="blue">{selectedFabric.fabricData.code}</Tag>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultActiveKey="1" className="fabric-tabs">
                            <TabPane 
                                tab={<span><BarChartOutlined />Información General</span>} 
                                key="1"
                            >
                                <Card className="stats-card">
                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Statistic 
                                                title="Total Rollos" 
                                                value={selectedFabric.totalRolls}
                                                prefix={<AppstoreOutlined />}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Statistic 
                                                title="Total Metros" 
                                                value={selectedFabric.totalMeters}
                                                suffix="m"
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Statistic 
                                                title="Altura" 
                                                value={selectedFabric.fabricData.height}
                                                suffix="cm"
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Statistic 
                                                title="Peso" 
                                                value={selectedFabric.fabricData.weight}
                                                suffix="gr/m²"
                                            />
                                        </Col>
                                    </Row>
                                </Card>

                                {Object.entries(selectedFabric.colorGroups).map(([colorId, { color, rolls }]) => (
                                    <Card
                                        key={colorId}
                                        className="color-group-card"
                                        title={
                                            <Space>
                                                <div
                                                    className="color-dot large"
                                                    style={{ backgroundColor: color.color }}
                                                />
                                                <span className="color-name">{color.name}</span>
                                                <Tag>{rolls.length} rollos</Tag>
                                            </Space>
                                        }
                                    >
                                        <Table
                                            dataSource={rolls}
                                            rowKey="id"
                                            size="small"
                                            pagination={false}
                                            className="rolls-table"
                                            columns={[
                                                {
                                                    title: 'Código',
                                                    dataIndex: ['attributes', 'code'],
                                                    width: '30%'
                                                },
                                                {
                                                    title: 'Metros',
                                                    dataIndex: ['attributes', 'roll_footage'],
                                                    width: '30%',
                                                    render: (meters) => `${meters} mts`
                                                },
                                                {
                                                    title: 'Acciones',
                                                    width: '40%',
                                                    render: (_, record) => (
                                                        <Space>
                                                            <Button
                                                                icon={<EditOutlined />}
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEdit(record);
                                                                }}
                                                            />
                                                            <Button
                                                                icon={<SwapOutlined />}
                                                                size="small"
                                                            />
                                                            <Button
                                                                icon={<DeleteOutlined />}
                                                                danger
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(record);
                                                                }}
                                                            />
                                                        </Space>
                                                    )
                                                }
                                            ]}
                                        />
                                    </Card>
                                ))}
                            </TabPane>
                            <TabPane 
                                tab={<span><PictureOutlined />Imágenes</span>} 
                                key="2"
                            >
                                <div className="fabric-images-grid">
                                    {selectedFabric.fabricData.fabric_images?.map((image, index) => (
                                        <div key={index} className="fabric-image-item">
                                            <img src={image.url} alt={`${selectedFabric.fabricData.name} ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            </TabPane>
                        </Tabs>
                    </>
                )}
            </Drawer>

            <Modal
                title="Editar Metraje"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleUpdateFootage}
                    layout="vertical"
                >
                    <Form.Item
                        name="roll_footage"
                        label="Metraje"
                        rules={[
                            { required: true, message: 'Por favor ingresa el metraje' },
                            { type: 'number', min: 0, message: 'El metraje debe ser mayor a 0' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Actualizar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Products;