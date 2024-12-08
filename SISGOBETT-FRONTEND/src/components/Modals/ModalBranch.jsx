import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Form, Input, Button, Row, Col, Select, Switch } from 'antd';
import { EditOutlined, PlusOutlined, ShopOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from 'react-query';
import { message } from 'antd';
import { useCreateBranch, useUpdateBranch } from '../../services/Branches';

const ModalBranch = ({ open, onCancel, data, isEdit = false }) => {

    const [form] = Form.useForm();
    const [switchValue, setSwitchValue] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);

    const queryClient = useQueryClient();
    const addBranch = useCreateBranch();
    const editBranch = useUpdateBranch();

    // Resetear el formulario cuando cambia el modal
    useEffect(() => {
        if (open) {
            if (isEdit && data) {
                form.setFieldsValue(data.attributes);
                setSwitchValue(data.attributes.available);
            } else {
                form.resetFields();
                setSwitchValue(false);
            }
        }
    }, [open, data, isEdit]);

    // Manejador de los cambios del input
    const handleInputChange = (field, value) => {
        form.setFieldsValue({
            [field]: value
        });
    };
    const handleSwitchChange = (checked) => {
        setSwitchValue(checked);
        form.setFieldsValue({ available: checked });
    };

    const handleCancel = () => {
        form.resetFields();
        setSwitchValue(false);
        onCancel();
    };

    const onFinish = async (values) => {
        setLoadingButton(true);
        try {
            if (isEdit) {
                await editBranch.mutateAsync({
                    id: data.id,
                    data: {
                        ...values,
                        available: switchValue
                    }
                });
            } else {
                await addBranch.mutateAsync({
                    ...values,
                    available: switchValue
                });
            }
            message.success(`Sucursal ${isEdit ? 'editada' : 'creada'} con éxito`);
            queryClient.invalidateQueries('Branches');
            handleCancel();
        } catch (error) {
            message.error('Hubo un error al procesar la solicitud');
        } finally {
            setLoadingButton(false);
        }
    };

    return (
        <Modal
            open={open}
            title={isEdit ? 'Editar Sucursal' : 'Crear Nueva Sucursal'}
            destroyOnClose={true}
            centered
            onCancel={handleCancel}
            width={700}
            closable={true}
            footer={false}
        >

            <Form
                form={form}
                onFinish={onFinish}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                layout="horizontal"
                initialValues={isEdit ? data.attributes : {}} // Valor predeterminado para el switch
            >

                <Row align={'middle'} justify={'start'} style={{
                    padding: 20,
                    margin: '10px 0px 20px 0px',
                    border: '1px solid #d9d9d9', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                    <Col span={2} style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <ShopOutlined style={{ background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', fontSize: '30px', padding: 5 }} />
                    </Col>
                    <Col span={17} style={{ margin: '0 5px' }}>
                        <Row>
                            <h4 style={{ margin: 0 }}>Habilitar Sucursal</h4>
                            <p style={{ color: 'gray', fontSize: 12, margin: '0' }}>Al habilitar la sucursal, estas asumiendo que la sucursal ya esta en funcionamiento y que esta habilitada a tener un inventario y registrar ventas.</p>
                        </Row>
                    </Col>
                    <Col span={4} style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'stretch'
                    }}>
                        <Form.Item
                            name="available" 
                            style={{
                                marginBottom: 0
                            }}
                        >
                            <Switch
                                checked={switchValue}
                                onChange={handleSwitchChange}
                                checkedChildren="Habilitado"
                                unCheckedChildren="Inhabilitado"
                                style={{
                                    backgroundColor: switchValue ? '#52c41a' : '#f5222d',
                                    borderColor: switchValue ? '#1890ff' : '#f5222d',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Por favor, ingresa el nombre' }]}>
                            <Input placeholder="Nombre de la Sucursal" onChange={(e) => handleInputChange('name', e.target.value)} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Teléfono"
                            name="phone"
                            required
                            rules={[
                                { required: true, message: 'Por favor, ingresa el número de teléfono' },
                                { pattern: /^[0-9]*$/, message: 'Ingresa solo números' },
                            ]}
                        >
                            <Input placeholder="Número de Teléfono" onChange={(e) => handleInputChange('phone', e.target.value)} />
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Ciudad"
                            name="departament"
                            rules={[{ required: true, message: 'Por favor, selecciona la ciudad' }]}
                        >
                            <Select
                                onSelect={((e) => handleInputChange('departament', e))}
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
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Dirección" name="address">
                            <Input placeholder="Dirección de la Sucursal" onChange={(e) => handleInputChange('address', e.target.value)} />
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={16}>
                    <Button danger type="primary" htmlType="submit" icon={isEdit ? <EditOutlined /> : <PlusOutlined />} loading={loadingButton} >
                        {isEdit ? 'Editar Sucursal' : 'Crear Sucursal'}
                    </Button>
                </Row>
            </Form>
        </Modal>
    );
};

export default ModalBranch;
