import { Modal, Row, Col, Typography, Card, List, Tag, Tabs, Statistic, Avatar, Spin, Button, message } from 'antd';
import { GlobalOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, ShoppingOutlined, HistoryOutlined, DollarOutlined, PrinterOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { generateAndPrintSupplierReport } from '../../utils/admin/ReportSupplier';

const { Title, Text } = Typography;

const SupplierDetailsModal = ({ open, onCancel, supplier }) => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handlePrintReport = () => {
    setIsGeneratingReport(true);
    
    generateAndPrintSupplierReport([supplier])
      .then(() => {
        message.success('Reporte generado correctamente');
      })
      .catch(() => {
        message.error('Error al generar el reporte');
      })
      .finally(() => {
        setIsGeneratingReport(false);
      });
  };

  if (!supplier) return null;

  return (
    <Modal
      title={null}
      centered
      open={open}
      onCancel={onCancel}
      width={window.innerWidth > 768 ? 800 : '95%'}
      footer={
        <Button 
          type="primary" 
          danger
          icon={<PrinterOutlined />}
          onClick={handlePrintReport}
          loading={isGeneratingReport}
          style={{ 
            marginLeft: 'auto',
            display: 'block'
          }}
        >
          {isGeneratingReport ? 'Generando Reporte...' : 'Imprimir Reporte'}
        </Button>
      }
      style={{ top: window.innerWidth <= 768 ? 20 : 'auto' }}
    >
      <div style={{ 
        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
        padding: '16px',
        marginTop: -24,
        marginLeft: -24,
        marginRight: -24,
        borderRadius: '8px 8px 0 0',
        marginBottom: 24
      }}>
        <Row align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8} style={{ textAlign: window.innerWidth <= 768 ? 'center' : 'left' }}>
            <Avatar
              size={window.innerWidth <= 768 ? 60 : 80}
              src={supplier.logo}
              style={{ border: '3px solid white' }}
            >
              {supplier.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Col>
          <Col xs={24} sm={24} md={16} style={{ textAlign: window.innerWidth <= 768 ? 'center' : 'left' }}>
            <Title level={window.innerWidth <= 768 ? 3 : 2} style={{ margin: 0, color: 'white' }}>
              {supplier.name}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              <EnvironmentOutlined /> {supplier.city}, {supplier.country}
            </Text>
          </Col>
        </Row>
      </div>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: <span><ShoppingOutlined /> Información General</span>,
            children: (
              <>
                

                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                  <Col span={24}>
                    <Card title="Estadísticas Generales">
                      <Row gutter={[16, 16]}>
                        <Col xs={12} sm={12} md={6}>
                          <Statistic
                            title="Total Ventas"
                            value={supplier.statistics.totalSales}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ fontSize: window.innerWidth <= 768 ? '16px' : '24px' }}
                          />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                          <Statistic
                            title="Total Productos"
                            value={supplier.statistics.totalProducts}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ fontSize: window.innerWidth <= 768 ? '16px' : '24px' }}
                          />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                          <Statistic
                            title="Monto Total"
                            value={`Bs. ${supplier.statistics.totalSalesAmount.toFixed(2)}`}
                            prefix={<DollarOutlined />}
                            valueStyle={{ fontSize: window.innerWidth <= 768 ? '16px' : '24px' }}
                          />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                          <Statistic
                            title="Promedio por Venta"
                            value={`Bs. ${supplier.statistics.averageSaleAmount.toFixed(2)}`}
                            prefix={<DollarOutlined />}
                            valueStyle={{ fontSize: window.innerWidth <= 768 ? '16px' : '24px' }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: '2',
            label: <span><HistoryOutlined /> Productos y Ventas</span>,
            children: (
              <List
                dataSource={supplier.fabrics}
                renderItem={fabric => (
                  <List.Item>
                    <Card 
                      style={{ width: '100%' }} 
                      title={fabric.name}
                      bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '24px' }}
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8}>
                          <Text strong>Código: </Text>
                          <Text>{fabric.code}</Text>
                          <br />
                          <Text strong>Alto: </Text>
                          <Text>{fabric.height} cm</Text>
                          <br />
                          <Text strong>Peso: </Text>
                          <Text>{fabric.weight} g/m²</Text>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                          <Text strong>Precio Mayoreo: </Text>
                          <Text>Bs.{fabric.wholesalePrice}</Text>
                          <br />
                          <Text strong>Precio Menudeo: </Text>
                          <Text>Bs.{fabric.retailPrice}</Text>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                          <Text strong>Total Metros: </Text>
                          <Text>{fabric.totalMeters}</Text>
                          <br />
                          <Text strong>Total Ventas: </Text>
                          <Text>{fabric.totalSales}</Text>
                          <br />
                          <Text strong>Monto Total: </Text>
                          <Text>Bs.{fabric.totalAmount}</Text>
                        </Col>
                        <Col xs={24} sm={24} md={24}>
                          <Text strong>Colores Disponibles: </Text>
                          {fabric.colors.map(color => (
                            <Tag key={color} color="blue" style={{ margin: '4px' }}>
                              {color}
                            </Tag>
                          ))}
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            ),
          }
        ]}
      />
    </Modal>
  );
};

export default SupplierDetailsModal; 