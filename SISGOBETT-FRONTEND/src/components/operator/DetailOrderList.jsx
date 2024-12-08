import React, { useState } from 'react';
import { Table, Modal, Button, InputNumber, Form, Tooltip } from 'antd';
import { DeleteOutlined, DollarOutlined, ScissorOutlined } from '@ant-design/icons';
import './DetailOrderList.css';

function DetailOrderList({ orderList, setOrderList }) {
    const [editingItem, setEditingItem] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Función para calcular el total de metros por tela y color
    const getTotalMeters = (description, color) => {
        return orderList
            .filter(item => 
                item.description === description && 
                item.color === color && 
                !item.isRoll
            )
            .reduce((acc, item) => acc + item.quantity, 0);
    };

    const columns = [
        {
            title: 'Cantidad',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 50,
            render: (text, record) => (
              <span>
                {record.saleType === 'POR ROLLO' ? (
                  <>
                    1 rollo
                    <div style={{ color: '#999', fontSize: '12px' }}>{record.quantity} m</div>
                  </>
                ) : (
                  `${text} m`
                )}
              </span>
            ),
        },
        {
            title: 'Descripción',
            dataIndex: 'description',
            key: 'description',
            width: 100,
            render: (text, record) => <b>
                {record.description}
            </b>,
        },
        {
            title: 'Color',
            dataIndex: 'color',
            key: 'color',

            render: (color) => <span style={{ backgroundColor: color, padding: '0 10px', borderRadius: '5px', color: '#fff' }}></span>,
        },
        {
            title: 'Precio Unitario',
            dataIndex: 'unitPrice',
            key: 'unitPrice',

            render: (text) => <span>{text} Bs.</span>,
        },
        {
            title: 'Precio Total',
            dataIndex: 'totalPrice',
            key: 'totalPrice',

            render: (text) => <span>{Number(text).toFixed(2)} Bs.</span>,
        },
        {
            title: 'Acciones',
            key: 'action',
            align: 'right',

            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(record.key);
                    }}
                />
            ),
        },
    ];

    // Función para abrir el modal y cargar los datos
    const modalEdit = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            quantity: record.quantity,
            unitPrice: record.unitPrice,
            cuts: record.cuts
        });
        setIsModalVisible(true);
    };

    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                if (!editingItem.isRoll) {
                    // Validación solo para metros
                    const METROS_LIMITE = 100;
                    const totalMetrosActuales = getTotalMeters(
                        editingItem.description, 
                        editingItem.color
                    );
                    const diferencia = values.quantity - editingItem.quantity;
                    const nuevoTotal = totalMetrosActuales + diferencia;

                    if (nuevoTotal > METROS_LIMITE) {
                        Modal.error({
                            title: 'Error',
                            content: `No se puede exceder el límite de ${METROS_LIMITE} metros para esta tela y color. 
                                     Total actual: ${totalMetrosActuales} metros.`,
                        });
                        return;
                    }
                }

                const updatedData = orderList.map((item) => {
                    if (item.key === editingItem.key) {
                        return {
                            ...item,
                            quantity: editingItem.isRoll ? item.quantity : values.quantity,
                            unitPrice: values.unitPrice,
                            totalPrice: (editingItem.isRoll ? item.quantity : values.quantity) * values.unitPrice,
                            cuts: editingItem.isRoll ? 1 : values.cuts,
                            rollCode: editingItem.rollCode,
                            colorName: editingItem.name
                        };
                    }
                    return item;
                });
                setOrderList(updatedData);
                setIsModalVisible(false);
            });
    };

    // Función para cerrar el modal
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // Función para eliminar un item
    const handleDelete = (key) => {
        const updatedData = orderList.filter(item => item.key !== key);
        setOrderList(updatedData);
    };

    return (
        <>
            <h4 className='order-title'>DETALLE DE PEDIDO</h4>
            <hr className='order-divider' />
            <div className="table-wrapper" >
                <Table
                    size='small'
                    showHeader={false}
                    dataSource={orderList}
                    columns={columns}
                    pagination={false}
                    rowKey="key"
                    onRow={(record) => ({
                        onClick: () => modalEdit(record),
                        className: record.isRoll ? 'roll-row' : 'meter-row',
                    })}
                />
            </div>
            <Modal
                title={`Editar ${editingItem?.isRoll ? 'Rollo' : 'Metros'}`}
                visible={isModalVisible}
                onCancel={handleCancel}
                onOk={handleSave}
                okText="Guardar"
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="quantity"
                        label={
                            <span>
                                <ScissorOutlined /> Cantidad (metros)
                                {editingItem?.isRoll && 
                                    <small style={{color: '#666', marginLeft: '5px'}}>
                                        (Cantidad fija del rollo)
                                    </small>
                                }
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Por favor ingrese la cantidad' },
                            { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0' }
                        ]}
                    >
                        <InputNumber 
                            min={1} 
                            disabled={editingItem?.isRoll}
                            prefix={<ScissorOutlined />}
                            style={{width: '100%'}}
                        />
                    </Form.Item>

                    {!editingItem?.isRoll && (
                        <Form.Item
                            name="cuts"
                            label={
                                <span>
                                    <ScissorOutlined /> Número de Cortes
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Por favor ingrese el número de cortes' },
                                { type: 'number', min: 1, message: 'Debe haber al menos 1 corte' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const quantity = getFieldValue('quantity');
                                        if (value > quantity) {
                                            return Promise.reject('El número de cortes no puede ser mayor que la cantidad de metros');
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                            tooltip="El número de cortes no puede exceder la cantidad de metros"
                        >
                            <InputNumber 
                                min={1}
                                style={{width: '100%'}}
                                prefix="✂️"
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="unitPrice"
                        label={
                            <span>
                                <DollarOutlined /> Precio Unitario
                                <small style={{color: '#1890ff', marginLeft: '5px'}}>
                                    (Modificar con precaución)
                                </small>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Por favor ingrese el precio unitario' },
                            { type: 'number', min: 0, message: 'El precio debe ser mayor o igual a 0' }
                        ]}
                    >
                        <InputNumber 
                            min={0}
                            prefix="Bs."
                            style={{width: '100%'}}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default DetailOrderList;
