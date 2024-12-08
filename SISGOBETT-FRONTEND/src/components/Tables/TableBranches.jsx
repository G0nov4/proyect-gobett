import { Badge,  Button, Popconfirm,  Space, Table, Form, Tooltip, Drawer, Row, Col, Card, Switch, Descriptions, Tabs, Flex, Dropdown, Menu, Spin, message, Skeleton, Modal, Input, Select } from 'antd'
import React, {  useState } from 'react'
import { useMutation,  useQueryClient } from 'react-query';
import {  DeleteOutlined, DollarOutlined, EditOutlined,GlobalOutlined,  PhoneOutlined,  ShopOutlined, SyncOutlined, TeamOutlined, NumberOutlined } from '@ant-design/icons';
import ModalBranch from '../Modals/ModalBranch';
import { useBranches, useDeleteBranch } from '../../services/Branches';
import { FaStoreAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const TableBranches = () => {
    const queryClient = useQueryClient()


    // Obteniendo todos los sucursales
    const { data, error, isLoading, isFetching } = useBranches()
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const deleteBranch = useDeleteBranch()

    console.log(data)

    // Función para filtrar sucursales
    const filteredBranches = data?.data?.filter(branch =>
        branch.attributes.name.toLowerCase().includes(searchText.toLowerCase()) ||
        branch.attributes.departament.toLowerCase().includes(searchText.toLowerCase())
    );

    // Manejadores del modal
    const handleOpenModal = (branch = null, isEdit = false) => {
        setSelectedBranch(branch);
        setIsEditMode(isEdit);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedBranch(null);
        setIsEditMode(false);
    };


    const handleDeleteBranch = (id) => {
        deleteBranch.mutateAsync(id)
        .then(() => {
            queryClient.invalidateQueries('Branches')
            message.success('Sucursal eliminada correctamente')
        })
        .catch((error) => {
            message.error('Error al eliminar la sucursal')
        })
    }
  
    const columns = [
        {
            title: '#',
            key: 'index',
            width: 15,
            align: 'center',
            render: (_, __, index) => (
                <Space>
                    <FaStoreAlt style={{ fontSize: '1.2rem' }} />
                    {index + 1}
                </Space>
            ),
        },

        {
            title: (
                <Space>
                    <ShopOutlined />
                    <span>Nombre</span>
                </Space>
            ),
            key: 'name',
            align: 'left', 
            fixed: 'left',
            width: 40,
            render: (text, record) => (
                <Link to={`/admin/branches/${record.id}`}>
                    {record.attributes.name}
                </Link>
            ),
        },
        {
            title: (
                <Space>
                    <PhoneOutlined />
                    <span>Telefono</span>

                </Space>
            ),
            key: 'phone',
            align: 'left',
            width: 20,
            render: (text, record) => (
                <span>
                    {record.attributes.phone}
                </span>
            ),
        },
        {
            title: (
                <Space>
                    <SyncOutlined />
                    <span>Estado</span>

                </Space>
            ),
            key: 'status',
            align: 'left',
            width: 30,
            render: (text, record) => (

                record.attributes.available == true ?
                    <Badge key='estado' color='green' text='Activo' /> :
                    <Badge key='estado' color='red' text='Inactivo' />
            )
        },
        {
            title: (
                <Space>
                    <GlobalOutlined />
                    <span>Ciudad</span>
                </Space>
            ),
            key: 'departament',
            align: 'left',
            width: 30,
            render: (text, record) => (
                <span>
                    {record.attributes.departament}
                </span>
            ),
        },
        {
            title: (
                <Space>
                    <DollarOutlined />
                    <span>Direccion</span>

                </Space>
            ),
            key: 'sales',
            align: 'center',
            width:80,
            render: (text, record) => (
                <span>
                    {record.attributes.address}
                </span>
            ),
        },
        {
            title: 'Acciones',
            key: 'accion',
            width: 20,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Editar" color='#F8BD25'>
                        <Button
                            icon={<EditOutlined />}
                            size='small'
                            style={{ color: '#F8BD25', borderColor: '#F8BD25' }}
                            onClick={() => handleOpenModal(record, true)}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar" color='#000'>
                        <Popconfirm
                            title="Eliminar Sucursal"
                            description="Esta acción no podra revertirse."
                            onConfirm={() => handleDeleteBranch(record.id)}
                        >
                            <Button danger icon={<DeleteOutlined />} size='small' />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ]

    return (

            <Row gutter={[0, 16]} style={{ marginBottom: 16, width: '100%' }}>

                <Input.Search
                    placeholder="Buscar sucursal..."
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

                <Col xs={24} md={24}>
                    <Spin spinning={isLoading} tip='Cargando datos de las sucursales'>
                            <Table
                                scroll={{
                                    x: 900,
                                }}
                                bordered
                                virtual
                                columns={columns}
                                dataSource={isLoading ? [] : filteredBranches.map(item => ({ ...item, key: item.id }))}
                                size="small"
                                pagination={{
                                    pageSize: 6,
                                }} />
                            <ModalBranch
                                open={modalOpen}
                                onCancel={handleCloseModal}
                            data={selectedBranch}
                            isEdit={isEditMode}
                        />
                    </Spin>
            </Col>
        </Row>

    )
}

export default TableBranches