import React, { useState } from 'react';
import { Modal, Form, Input, Select } from 'antd';

const CancelOrderModal = ({ visible, onCancel, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [cancelationType, setCancelationType] = useState('');

  const cancelationTypes = [
    { value: 'CLIENT_REQUEST', label: 'Solicitud del cliente' },
    { value: 'ORDER_ERROR', label: 'Error en el pedido' },
    { value: 'STOCK_ISSUE', label: 'Falta de stock' },
    { value: 'PAYMENT_ISSUE', label: 'Problema de pago' },
    { value: 'OTHER', label: 'Otro' }
  ];

  return (
    <Modal
      title="Cancelar Pedido"
      visible={visible}
      onCancel={onCancel}
      onOk={() => onConfirm({ reason, cancelationType })}
      okButtonProps={{ danger: true }}
      okText="Confirmar Cancelación"
      cancelText="Volver"
    >
      <Form layout="vertical">
        <Form.Item 
          label="Tipo de cancelación" 
          required
        >
          <Select
            value={cancelationType}
            onChange={setCancelationType}
            options={cancelationTypes}
          />
        </Form.Item>

        <Form.Item 
          label="Razón detallada" 
          required
        >
          <Input.TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CancelOrderModal; 