import React, { useEffect } from 'react';
import { Modal, Form, Input, ColorPicker, message, Switch, Tooltip } from 'antd';
import { useCreateCategory, useUpdateCategory } from '../../services/Categories';
import { useQueryClient } from 'react-query';
import { BulbOutlined } from '@ant-design/icons';

const ModalCategory = ({ visible, onClose, editingCategory = null }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    useEffect(() => {
        if (visible) {
            if (editingCategory) {
                form.setFieldsValue({
                    name: editingCategory.attributes.name,
                    color_categorie: editingCategory.attributes.color_categorie,
                    visible: editingCategory.attributes.visible
                });
            } else {
                form.setFieldsValue({
                    visible: true,
                    color_categorie: '#ff4d4f'
                });
            }
        } else {
            form.resetFields();
        }
    }, [editingCategory, visible, form]);

    const handleSubmit = async (values) => {
        try {
            const colorString = values.color_categorie.toHexString();

            if (editingCategory) {
                await updateMutation.mutateAsync({
                    id: editingCategory.id,
                    data: {
                        name: values.name,
                        color_categorie: colorString,
                        visible: values.visible
                    }
                });
                message.success('Categoría actualizada correctamente');
            } else {
                await createMutation.mutateAsync({
                    name: values.name,
                    color_categorie: colorString,
                    visible: values.visible ?? true
                });
                message.success('Categoría creada correctamente');
            }
            
            await queryClient.invalidateQueries('categories');
            onClose();
            form.resetFields();
        } catch (error) {
            console.error('Error:', error);
            message.error(
                error.response?.data?.error?.message || 
                'Error al procesar la categoría'
            );
        }
    };

    return (
        <Modal
            title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={editingCategory ? "Actualizar" : "Crear"}
            cancelText="Cancelar"
            width={720}
            okButtonProps={{
                style: {
                    background: '#ff4d4f',
                    borderColor: '#ff4d4f'
                }
            }}
        >
            <p style={{ marginBottom: '20px', color: '#666' }}>
                Las categorías ayudan a organizar los productos en el área de ventas para una mejor gestión y visualización.
            </p>
            
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="category-form"
            >
                <div className="form-row">
                    <Form.Item
                        name="name"
                        label={
                            <Tooltip title="El nombre debe ser único y descriptivo">
                                Nombre <BulbOutlined style={{ color: '#1890ff' }} />
                            </Tooltip>
                        }
                        rules={[{ required: true, message: 'Por favor, ingrese el nombre' }]}
                        style={{ flex: 1, marginBottom: 16 }}
                    >
                        <Input placeholder="Ej: Bebidas, Snacks" />
                    </Form.Item>
                </div>

                <div className="form-row">
                    <Form.Item
                        name="color_categorie"
                        label={
                            <Tooltip title="Color identificativo en el área de ventas">
                                Color <BulbOutlined style={{ color: '#1890ff' }} />
                            </Tooltip>
                        }
                        rules={[{ required: true, message: 'Seleccione un color' }]}
                        style={{ marginBottom: 0, marginRight: 16 }}
                    >
                        <ColorPicker />
                    </Form.Item>

                    <Form.Item
                        name="visible"
                        label={
                            <Tooltip title="Activar/desactivar visualización">
                                Estado <BulbOutlined style={{ color: '#1890ff' }} />
                            </Tooltip>
                        }
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                    >
                        <Switch />
                    </Form.Item>
                </div>
            </Form>

            <style jsx>{`
                .category-form {
                    max-width: 100%;
                }
                
                .form-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                @media (max-width: 576px) {
                    .form-row {
                        flex-direction: column;
                        gap: 8px;
                    }
                    
                    .form-row :global(.ant-form-item) {
                        margin-right: 0 !important;
                        margin-bottom: 16px !important;
                    }
                }
            `}</style>
        </Modal>
    );
};

export default ModalCategory; 