// EditClientModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, Space, message } from 'antd';
import { EditFilled } from '@ant-design/icons';
import { useUpdateClient } from '../../services/Client';

const EditClientModal = ({ visible, onCloseModal, dataToUpdate }) => {
    const [form] = Form.useForm();
    const editClientMutation = useUpdateClient()
    const [formEditData, setFormEditData] = useState(dataToUpdate);

    useEffect(() => {
        setFormEditData(dataToUpdate)
    }, [dataToUpdate])

    const updateClient = () => {

        editClientMutation.mutateAsync(formEditData)
            .then(() => {
                message.info('Cliente actualizado!')
            })
            .catch(() => {
                message.error('No se pudo actualizar al cliente, intentelo mas tarde.')
            })
            .finally(onCloseModal())

    }

    const handleInputChange = (field, value) => {
        setFormEditData((prevData) => ({
            ...prevData,
            attributes: {
                ...prevData.attributes,
                [field]: value,
            },
        }));
    };

    return (
        <Modal
            centered
            destroyOnClose={true}
            title={<strong>EDITAR CLIENTE</strong>}
            onCancel={onCloseModal}
            footer={null}
            visible={visible}
        >
            <Form
                layout="vertical"
                onFinish={updateClient}
                preserve={false}
                initialValues={formEditData.attributes}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<strong>Primer nombre:</strong>}
                            name="name"
                            rules={[{ required: true, message: 'Por favor ingrese el primer nombre' }]}
                        >
                            <Input onChange={(e) => handleInputChange('name', e.target.value)} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<strong>Apellido:</strong>}
                            name="last_name"
                        >
                            <Input onChange={(e) => handleInputChange('last_name', e.target.value)} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<strong>Numero de telefono 1:</strong>}
                            name="phone_1"
                            rules={[{ required: true, message: 'Por favor ingrese el número de teléfono' }]}
                        >
                            <Input addonBefore="+591" placeholder="Ej. 70000000" onChange={(e) => handleInputChange('phone_1', e.target.value)} initialValue={formEditData.phone_1} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<strong>Numero de telefono 2:</strong>}
                            name="phone_2"
                        >
                            <Input addonBefore="+591" placeholder="Ej. 76543210" onChange={(e) => handleInputChange('phone_2', e.target.value)} initialValue={formEditData.phone_2} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<strong>Tipo de cliente:</strong>}
                            name="kind_of_client"

                        >
                            <Select
                                onChange={(e) => handleInputChange('kind_of_client', e)}
                                placeholder="Seleccione"
                                options={[
                                    {
                                        value: 'NORMAL',
                                        label: 'Normal',
                                    }, {
                                        value: 'MAYORISTA',
                                        label: 'Mayorista',
                                    }, {
                                        value: 'MINORISTA',
                                        label: 'Minorista',
                                    },
                                ]}
                            />

                        </Form.Item>
                    </Col>
                    
                </Row>

                <Row>
                    <Col span={24}>

                        <Space.Compact style={{ width: '100%' }}>

                            <Form.Item
                                label={<strong>Dirección: </strong>}
                                style={{
                                    width: '40%'
                                }}
                                name="city"
                            >

                                <Select
                                    onSelect={((e) => handleInputChange('city', e))}
                                    placeholder='Departamento'
                                    options={[
                                        {
                                            value: 'LA PAZ',
                                            label: 'La paz',
                                        },
                                        {
                                            value: 'COCHABAMBA',
                                            label: 'Cochabamba',
                                        },
                                        {
                                            value: 'ORURO',
                                            label: 'Oruro',
                                        },
                                        {
                                            value: 'SANTA CRUZ',
                                            label: 'Santa cruz',
                                        },
                                        {
                                            value: 'SUCRE',
                                            label: 'Sucre',
                                        },
                                        {
                                            value: 'BENI',
                                            label: 'Beni',
                                        },
                                        {
                                            value: 'TARIJA',
                                            label: 'Tarija',
                                        },
                                        {
                                            value: 'PANDO',
                                            label: 'Pando',
                                        },
                                        {
                                            value: 'POTOSI',
                                            label: 'Potosi',
                                        },
                                    ]} />
                            </Form.Item>
                            <Form.Item
                                style={{
                                    width: '100%'
                                }}
                                label={<></>}
                                name="direction"

                            >
                                <Input placeholder="Senkata, C/ Corintias" onChange={(e) => handleInputChange('direction', e.target.value)} />
                            </Form.Item>
                        </Space.Compact>

                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item >
                            <Space >
                                <Button danger type="primary" htmlType="submit" icon={<EditFilled />}>
                                    EDITAR CLIENTE
                                </Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </Modal>
    );
};

export default EditClientModal;
