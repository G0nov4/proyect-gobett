import { DollarOutlined, PercentageOutlined, PlusOutlined, TagOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Space, message } from 'antd';
import React, { useEffect } from 'react';
import { useCreatePromo, useUpdatePromo } from '../../services/Promotions';
import { useQueryClient } from 'react-query';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

function PromotionModal({ visible, onCancel, promoData }) {
    const [form] = Form.useForm();
    const createPromotionMutation = useCreatePromo();
    const updatePromotionMutation = useUpdatePromo();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (promoData) {
            // Si se están editando datos, inicializamos los campos del formulario
            form.setFieldsValue({
                promotion_name: promoData.promotion_name || '',
                code: promoData.code || '',
                promotion_type: promoData.promotion_type || 'PORCENTAJE', // Valor por defecto
                discount: promoData.discount || 0,
                dateRange: [dayjs(promoData.start_date), dayjs(promoData.end_date)] || null,
                description: promoData.description || '',
            });
        } else {
            // Limpiar el formulario si no hay promoción seleccionada (creación)
            form.resetFields();
        }
    }, [promoData, form]);

    const handleSubmit = (values) => {
        // Crear objeto con los datos de la promoción
        const dataPromotion = {
            promotion_name: values.promotion_name || '',  // Valor por defecto vacío si no existe
            discount: values.discount || 0,  // Valor por defecto
            start_date: values.dateRange[0] ? values.dateRange[0].format('YYYY-MM-DD') : '', // Formatear fecha o vacía
            end_date: values.dateRange[1] ? values.dateRange[1].format('YYYY-MM-DD') : '',  // Formatear fecha o vacía
            promotion_type: values.promotion_type || 'PORCENTAJE',  // Valor por defecto
            description: values.description || '',  // Valor por defecto vacío
            code: values.code || '',  // Valor por defecto vacío
        };
    
        // Si se está editando una promoción (promoData)
        if (promoData) {
            updatePromotionMutation.mutate(
                { id: promoData.key, ...dataPromotion },  // Pasar el ID y los datos
                {
                    onSuccess: () => {
                        message.success('Promoción actualizada correctamente');
                        queryClient.invalidateQueries('promotions');  // Actualizar la lista de promociones
                        onCancel();  // Cerrar modal
                    },
                    onError: (err) => {
                        console.log(err);
                        message.error('Error al actualizar la promoción');
                    },
                }
            );
        } else {
            // Modo creación de promoción
            createPromotionMutation.mutate(dataPromotion, {
                onSuccess: () => {
                    message.success('Promoción creada correctamente');
                    queryClient.invalidateQueries('promotions');
                    onCancel();
                },
                onError: (err) => {
                    console.log(err);
                    message.error('Error al crear la promoción');
                },
            });
        }
    };

    return (
        <Modal
            centered
            visible={visible}
            title={promoData ? 'Editar Promoción' : 'Crear Promoción'}
            footer={null}
            onCancel={onCancel}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Space style={{ width: '100%' }}>
                    <Form.Item
                        name="promotion_name"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingresa el nombre de la promoción!' }]}
                    >
                        <Input prefix={<TagOutlined />} placeholder="Ingresa el nombre" />
                    </Form.Item>
                    <Form.Item
                        name="code"
                        label="Código"
                        rules={[{ required: true, message: 'Por favor ingresa un código válido!' }]}
                    >
                        <Input prefix={<TagOutlined />} placeholder="Ingresa el código" />
                    </Form.Item>
                </Space>

                <Form.Item
                    name="promotion_type"
                    label="Tipo de Promoción"
                    rules={[{ required: true, message: 'Ingresa el tipo de promoción' }]}
                >
                    <Select placeholder="Selecciona el tipo de promoción">
                        <Option value="PORCENTAJE"><PercentageOutlined /> Descuento en porcentaje</Option>
                        <Option value="MONTO"><DollarOutlined /> Monto de Descuento</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="discount"
                    label="Descuento"
                    rules={[{ required: true, message: 'Por favor ingresa un número válido!' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Ingresa monto"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                </Form.Item>

                <Form.Item
                    name="dateRange"
                    label="Periodo de Promoción"
                    rules={[{ required: true, message: 'Por favor selecciona un periodo' }]}
                >
                    <RangePicker format={'YYYY-MM-DD'} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Descripción"
                >
                    <TextArea rows={4} placeholder="Ingresa una descripción" />
                </Form.Item>

                <Button key="cancel" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button key="submit" type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    {promoData ? 'Actualizar Promoción' : 'Crear Promoción'}
                </Button>
            </Form>
        </Modal>
    );
}

export default PromotionModal;
