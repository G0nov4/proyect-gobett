// CreateClientModal.js
import React from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCreateClient } from '../../services/Client';
import { useQueryClient } from 'react-query';

const CreateClientModal = ({ visible, onClose,setClientSelected }) => {
    const [form] = Form.useForm();
    const createClientMutation = useCreateClient()
    const queryClient = useQueryClient()

    React.useEffect(() => {
        if (!visible) {
            form.resetFields();
        }
    }, [visible, form]);

    const handleCreateClient = async (values) => {
        try {
            const response = await createClientMutation.mutateAsync(values);
            
            if (response && response.data) {
                message.success('Cliente creado exitosamente');
                form.resetFields();
                onClose();
                if (setClientSelected) {
                    setClientSelected(response.data.data.attributes);
                }
                queryClient.invalidateQueries({queryKey: ['clients']});
            }
        } catch (err) {
            console.error('Error al crear cliente:', err);
            message.error('Error al crear el cliente.');
        }
    }

    return (
        <Modal
            centered
            title={<strong>CREAR CLIENTE</strong>}
            footer={null}
            visible={visible}
            onCancel={onClose}
            destroyOnClose={true}
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={handleCreateClient}
                preserve={false}
                initialValues={{ type: 'regular' }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<strong>Primer nombre:</strong>}
                            name="name"
                            rules={[{ required: true, message: 'Por favor ingrese el primer nombre' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<strong>Apellido:</strong>}
                            name="last_name"
                        >
                            <Input />
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
                            <Input addonBefore="+591" placeholder="Ej. 70000000" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<strong>Numero de telefono 2:</strong>}
                            name="phone_2"
                        >
                            <Input addonBefore="+591" placeholder="Ej. 76543210" />
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

                <Row gutter={16}>
                    <Col span={24}>

                        <Space.Compact style={{ width: '100%' }}>

                            <Form.Item
                                label={<strong>Dirección: </strong>}
                                name="city"
                            >

                                <Select
                                    placeholder='Departamento'
                                    style={{ width: '100%' }}
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
                                label={<></>}
                                name="direction"
                            >
                                <Input placeholder="Senkata, C/ Corintias" />
                            </Form.Item>
                        </Space.Compact>

                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item >
                            <Space>
                                <Button danger type="primary" htmlType="submit" icon={<PlusOutlined />}>
                                    CREAR CLIENTE
                                </Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </Modal>
    );
};

export default CreateClientModal;
