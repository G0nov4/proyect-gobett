// ClientsTable.js
import React, { useState } from 'react';
import { Table, Col, Button, Space, Tooltip, Tag, Popconfirm, message, Avatar } from 'antd';

import { DeleteOutlined, EditOutlined, EyeFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { BsFillPersonFill, BsFillPersonLinesFill, BsFillTelephoneFill, BsGeoAltFill, BsPersonFillCheck } from "react-icons/bs";
import ClientDetailsDrawer from '../Drawers/ClientDetailsDrawer';
import EditClientModal from '../clients/ModalEditClient';
import { useDeleteClient } from '../../services/Client';

const ClientsTable = ({ clients, isLoading }) => {

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewClient, setViewClient] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [dataToUpdate, setDataToUpdate] = useState({})
    const deleteClientMutation = useDeleteClient()

    const getRandomColor = () => {
        const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#ff4d4f'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const columns = [
        {
            title: (
                <Space>
                    <BsFillPersonFill />
                    <span>Nombre ({clients?.data?.length || 0})</span>
                </Space>
            ),
            key: 'name',
            align: 'left',
            render: (text, record) => (
                <Space>
                    <Avatar
                        style={{ 
                            backgroundColor: getRandomColor(),
                            verticalAlign: 'middle' 
                        }}
                    >
                        {record.attributes.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <span>
                        {record.attributes.name} {record.attributes.last_name}
                    </span>
                </Space>
            ),
        },
        {
            title: (
                <Space>
                    <BsFillTelephoneFill />
                    <span>Telefonos</span>
                </Space>
            ),
            key: 'phone_1',
            align: 'center',
            render: (record) => (
                <Col style={{ fontSize: 12 }}>
                    {record.attributes.phone_1 ? `(+591) ${record.attributes.phone_1}` : null}
                    {record.attributes.phone_1 && record.attributes.phone_2 ? <br /> : null}
                    {record.attributes.phone_2 ? `(+591) ${record.attributes.phone_2}` : null}
                    {!record.attributes.phone_1 && !record.attributes.phone_2 ? 'No hay números de teléfono' : null}
                </Col>
            )
        },
        {
            title: (
                <Space>
                    <BsPersonFillCheck />
                    <span>Tipo de cliente</span>
                </Space>
            ),
            key: 'phone_1',
            align: 'center',
            render: (record) => {
                let tagColor;
                let tagText;

                switch (record.attributes.kind_of_client) {
                    case 'NORMAL':
                        tagColor = 'volcano';
                        tagText = 'Normal';
                        break;
                    case 'MAYORISTA':
                        tagColor = 'geekblue';
                        tagText = 'Mayorista';
                        break;
                    case 'MINORISTA':
                        tagColor = 'blue';
                        tagText = 'Minorista';
                        break;
                    default:
                        tagColor = 'default'; // Puedes cambiar esto según tus necesidades
                        tagText = 'Desconocido';
                }

                return <Tag color={tagColor}>{tagText}</Tag>;
            }
        },
        {
            title: (
                <Space>
                    <BsGeoAltFill />
                    <span>Direccion</span>
                </Space>
            ),
            render: (record) => (
                <span>
                    {record.attributes.city}  {record.attributes.direction}
                </span>
            ),
            key: 'version',
            align: 'center',
        },

        {
            title: (
                <Space>
                    <BsFillPersonLinesFill />
                    <span>Acciones</span>

                </Space>
            ),
            key: 'accion',
            align: 'center',
            render: (_, record) => {
                const handleViewClient = () => {
                    setViewClient(record)
                    setViewModalOpen(true)
                }

                const handleDeleteConfirm = async () => {
                    await deleteClientMutation.mutateAsync(record.id)
                        .then(data => {
                            console.log(data)
                            message.success('Cliente eliminado exitosamente!')
                        })
                        .catch(error => {
                            message.error('No se pudo eliminar el cliente')
                            console.log(error)

                        })
                }
                const handleEditClient = () => {
                    setDataToUpdate(record)
                    console.log(dataToUpdate)
                    setEditModalOpen(true)
                }
                return (
                    <Space>
                        <Tooltip title="Ver" color='#4F646F' key='Ver'>
                            <Button
                                icon={<EyeFilled />}
                                size='small' style={{
                                    color: '#4F646F', borderColor: '#4F646F'
                                }}
                                onClick={handleViewClient}
                            />
                        </Tooltip>
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
                                title="Eliminar Cliente"
                                placement='left'
                                description="Esta accion no podra revertirse."
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={handleDeleteConfirm}

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
    ];

    return (
        <>
            <Table
                columns={columns}
                loading={isLoading}
                dataSource={isLoading ? [] : clients.data.map(item => ({ ...item, key: item.id }))}
                pagination={{ pageSize: 7 }}
                size="small"
                scroll={{x: 400}}
            />
            <ClientDetailsDrawer client={viewClient} onClose={() => setViewModalOpen(false)} visible={viewModalOpen} />
            <EditClientModal visible={editModalOpen} onCloseModal={() => setEditModalOpen(false)} dataToUpdate={dataToUpdate} />

        </>

    );
};

export default ClientsTable;
