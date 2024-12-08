import React, { useState } from 'react';
import { Row, Col, Button, Space, Input, Table, message, Modal, Switch, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useCategories, useUpdateCategory, useDeleteCategory } from '../../services/Categories';
import { useQueryClient } from 'react-query';
import './Categories.css';
import ModalCategory from '../../components/Modals/ModalCategory';

function Categories() {
    const { data: categories, isLoading } = useCategories();
    const updateCategorieMutation = useUpdateCategory();
    const deleteCategorieMutation = useDeleteCategory();
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showOnlyVisible, setShowOnlyVisible] = useState(false);

    const filteredCategories = categories?.filter(category => {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = category.attributes.name.toLowerCase().includes(searchLower);
        return matchesSearch && (!showOnlyVisible || category.attributes.visible);
    });

    const handleStatusChange = async (record, checked) => {
        try {
            await updateCategorieMutation.mutateAsync({
                id: record.id,
                data: {
                    visible: checked,
                }
            });
            
            message.success(`Categoría ${record.attributes.name} ${checked ? 'activada' : 'desactivada'} correctamente`);
            await queryClient.invalidateQueries(['categories']);
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al actualizar el estado de la categoría');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategorieMutation.mutateAsync(id);
            message.success('Categoría eliminada correctamente');
            queryClient.invalidateQueries(['categories']);
        } catch (error) {
            message.error('Error al eliminar la categoría');
        }
    };

    const columns = [
        {
            title: 'Color',
            dataIndex: ['attributes', 'color_categorie'],
            key: 'color',
            width: 80,
            render: (color) => (
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '2px solid #fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    margin: 'auto'
                }} />
            ),
        },
        {
            title: 'Nombre',
            dataIndex: ['attributes', 'name'],
            key: 'name',
        },
        {
            title: 'Estado',
            dataIndex: ['attributes', 'visible'],
            key: 'visible',
            width: 120,
            render: (visible, record) => (
                <Switch
                    checked={visible}
                    onChange={(checked) => handleStatusChange(record, checked)}
                    checkedChildren="Activo"
                    unCheckedChildren="Inactivo"
                    style={{
                        backgroundColor: visible ? '#52c41a' : '#ff4d4f'
                    }}
                />
            ),
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 150,
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Editar" color='#F8BD25' key='Editar'>
                        <Button
                            icon={<EditOutlined />}
                            size='small'
                            style={{
                                color: '#F8BD25', borderColor: '#F8BD25'
                            }}
                            onClick={() => {
                                setEditingCategory(record);
                                setAddModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar" color='#000' key='Eliminar'>
                        <Popconfirm
                            title="Eliminar Categoría"
                            placement='left'
                            description="Esta accion no podra revertirse."
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size='small'
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        }
    ];

    return (
        <Row>
            <Col xs={24}>
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
                                Gestión de Categorías
                            </h1>
                            <p style={{ 
                                margin: '8px 0 0', 
                                color: '#8c8c8c',
                                fontSize: { xs: '14px', sm: '16px' },
                                fontWeight: 500
                            }}>
                                {filteredCategories?.length || 0} categorías registradas
                            </p>
                        </div>
                        <Button 
                            onClick={() => {
                                setEditingCategory(null);
                                setAddModalOpen(true);
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
                            Nueva Categoría
                        </Button>
                    </div>

                    <Input.Search
                        placeholder="Buscar categoría..."
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

                    <div style={{ marginBottom: '16px' }}>
                        <Switch
                            checked={showOnlyVisible}
                            onChange={setShowOnlyVisible}
                            checkedChildren="Solo activas"
                            unCheckedChildren="Todas"
                            style={{
                                backgroundColor: showOnlyVisible ? '#52c41a' : '#ff4d4f'
                            }}
                        />
                    </div>

                    <Table
                        columns={columns}
                        dataSource={filteredCategories}
                        loading={isLoading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total) => `Total ${total} categorías`
                        }}
                    />
                </Row>
            </Col>

            <ModalCategory
                visible={addModalOpen}
                onClose={() => {
                    setAddModalOpen(false);
                    setEditingCategory(null);
                }}
                editingCategory={editingCategory}
            />
        </Row>
    );
}

export default Categories;