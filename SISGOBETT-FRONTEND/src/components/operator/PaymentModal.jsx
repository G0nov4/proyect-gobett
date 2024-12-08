import React, { useState } from 'react';
import { Modal, Row, Col, Card, Space, Divider, Form, InputNumber, DatePicker, Input, Table, message, Alert } from 'antd';
import { DollarOutlined, UserOutlined, PhoneOutlined, MoneyCollectOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useCreatePayment } from '../../services/Payments';
import dayjs from 'dayjs';
import { Typography } from 'antd';

const { Text } = Typography;

const PaymentModal = ({ visible, onCancel, sale, totalToPay, totalPaid, onSuccess }) => {
  const [form] = Form.useForm();
  const createPaymentMutation = useCreatePayment();
  const [receivedAmount, setReceivedAmount] = useState(totalToPay - totalPaid);

  const calculateChange = () => {
    return receivedAmount - (totalToPay - totalPaid);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const amountToRegister = Math.min(values.amount, totalToPay - totalPaid);

      await createPaymentMutation.mutateAsync({
        amount: amountToRegister,
        payment_date: dayjs(values.payment_date).format('YYYY-MM-DD'),
        notes: values.notes,
        sale: sale.id
      });

      if (calculateChange() > 0) {
        message.success(`Pago registrado. Cambio a devolver: Bs. ${calculateChange().toFixed(2)}`);
      } else {
        message.success('Pago registrado exitosamente');
      }

      form.resetFields();
      onSuccess?.();
      onCancel();

    } catch (error) {
      if (error.errorFields) {
        message.error('Por favor complete todos los campos requeridos');
        return;
      }
      message.error('Error al registrar el pago');
    }
  };

  return (
    <Modal
      title={<><DollarOutlined /> Añadir Pago</>}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      centered
      okText="Guardar Pago"
      cancelText="Cancelar"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card bordered={false}>
            <Space direction="vertical" style={{width: '100%'}}>
              <Text><UserOutlined /> Cliente: {sale?.attributes?.client?.data?.attributes?.name}</Text>
              <Text><PhoneOutlined /> Teléfono: {sale?.attributes?.client?.data?.attributes?.phone_1}</Text>
            </Space>
            <Divider />
            <Table 
              size="small"
              pagination={false}
              dataSource={sale?.attributes?.payments?.data || []}
              columns={[
                {
                  title: 'Fecha',
                  dataIndex: ['attributes', 'payment_date'],
                  render: date => dayjs(date).format('DD/MM/YYYY')
                },
                {
                  title: 'Monto',
                  dataIndex: ['attributes', 'amount'],
                  render: amount => `Bs. ${amount.toFixed(2)}`
                },
                {
                  title: 'Notas',
                  dataIndex: ['attributes', 'notes']
                }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card bordered={false}>
            <Space direction="vertical" style={{width: '100%', marginBottom: 16}}>
              <Text><MoneyCollectOutlined /> Monto Total: Bs. {totalToPay.toFixed(2)}</Text>
              <Text><CheckCircleOutlined /> Monto Pagado: Bs. {totalPaid.toFixed(2)}</Text>
              <Text type="warning">
                <ExclamationCircleOutlined /> Monto Restante: Bs. {(totalToPay - totalPaid).toFixed(2)}
              </Text>
            </Space>
            <Form 
              form={form}
              layout="vertical"
              initialValues={{
                payment_date: dayjs(),
                amount: totalToPay - totalPaid
              }}
            >
              <Form.Item 
                name="amount"
                label="Monto Recibido"
                rules={[
                  { required: true, message: 'Por favor ingrese el monto' },
                  { 
                    type: 'number',
                    min: totalToPay - totalPaid,
                    message: `El monto debe ser mayor o igual a Bs. ${(totalToPay - totalPaid).toFixed(2)}`
                  }
                ]}
              >
                <InputNumber
                  prefix="Bs."
                  style={{ width: '100%' }}
                  min={totalToPay - totalPaid}
                  onChange={setReceivedAmount}
                />
              </Form.Item>

              {receivedAmount > (totalToPay - totalPaid) && (
                <Alert
                  message={`Cambio a devolver: Bs. ${calculateChange().toFixed(2)}`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Form.Item 
                name="payment_date"
                label="Fecha de Pago"
                rules={[{ required: true, message: 'Por favor seleccione la fecha' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="notes"
                label="Notas"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default PaymentModal; 