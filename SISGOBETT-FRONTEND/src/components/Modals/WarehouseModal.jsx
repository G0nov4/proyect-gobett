import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Space, Button, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useCreateWarehouse, useUpdateWarehouse } from '../../services/Warehouses';
import { message } from 'antd';

const WarehouseModal = ({ open, onCancel, onSuccess, initialData = null }) => {
    const [form] = Form.useForm();
    const createWarehouseMutation = useCreateWarehouse();
    const updateWarehouseMutation = useUpdateWarehouse();
    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                name: initialData.attributes.name,
                address: initialData.attributes.address,
                status: initialData.attributes.status,
                description: initialData.attributes.description
            });
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    const handleSubmit = async (values) => {
        try {
            console.log('Datos del almacén:', values);

            if (isEditing) {
                await updateWarehouseMutation.mutateAsync({
                    id: initialData.id,
                    data: values
                });
                message.success('Almacén actualizado correctamente');
            } else {
                await createWarehouseMutation.mutateAsync(values);
                message.success('Almacén creado correctamente');
            }
            form.resetFields();
            onSuccess?.();
        } catch (error) {
            message.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el almacén`);
            console.error('Error:', error);
        }
    };

    return (
        <Modal
            title={
                <div style={{ 
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    marginTop: -16,
                    marginLeft: -24,
                    marginRight: -24,
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                        {isEditing ? 'Editar Almacén' : 'Crear Nuevo Almacén'}
                    </h3>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            centered
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: 'ACTIVO'
                }}
            >
                <Row gutter={16}>
                    <Col span={18}>
                        <Form.Item
                            name="name"
                            label="Nombre del Almacén"
                            rules={[
                                { required: true, message: 'Por favor ingresa el nombre' },
                                { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
                            ]}
                        >
                            <Input 
                                placeholder="Ej: Almacén Central"
                                maxLength={50}
                                showCount
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="status"
                            label="Estado"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Select.Option value="ACTIVO">Activo</Select.Option>
                                <Select.Option value="INACTIVO">Inactivo</Select.Option>
                                <Select.Option value="EN MANTENIMIENTO">En Mantenimiento</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="address"
                    label="Dirección"
                    rules={[
                        { required: true, message: 'Por favor ingresa la dirección' }
                    ]}
                >
                    <Input.TextArea 
                        placeholder="Ej: Calle Principal #123, Zona Norte"
                        maxLength={200}
                        showCount
                        rows={2}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Descripción"
                >
                    <Input.TextArea 
                        placeholder="Descripción adicional del almacén..."
                        maxLength={500}
                        showCount
                        rows={4}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button 
                            icon={<CloseOutlined />} 
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<SaveOutlined />}
                            htmlType="submit"
                            loading={isEditing ? updateWarehouseMutation.isLoading : createWarehouseMutation.isLoading}
                            style={{
                                background: '#ff4d4f',
                                borderColor: '#ff4d4f'
                            }}
                        >
                            {isEditing ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default WarehouseModal; 