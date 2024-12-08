import React from 'react';
import { Button, Card, Col, Row, Space, Spin, Statistic, Table, Tag, Avatar, Dropdown, message, Typography } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined, 
  ShopOutlined, 
  PhoneOutlined, 
  GlobalOutlined, 
  EnvironmentOutlined,
  BarChartOutlined,
  CalendarOutlined,
  PrinterOutlined,
  FilePdfOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useBranch } from '../../services/Branches';
import { useSales } from '../../services/Sales';
import { BiChart } from 'react-icons/bi';


const ViewBranch = () => {
  const navigate = useNavigate();
  const { id: idBranch } = useParams();
  const { data: dataBranch, isLoading } = useBranch(idBranch);
  const { data: salesByBranch, isLoading: loadingSales } = useSales(null, null, {
    filters: { branch: { id: { $eq: idBranch } } }
  });

  if (isLoading || loadingSales) return <Spin />;

  const branch = dataBranch?.data?.attributes || {};
  const sales = salesByBranch?.data || [];

  // Calcular estadísticas
  const totalSales = sales.length;
  const totalAmount = sales.reduce((sum, sale) => {
    return sum + (sale.attributes.detail || []).reduce((total, item) => 
      total + (item.unit_price * item.quantity_meterage), 0
    );
  }, 0);

  const handlePrintSale = (saleId) => {
    message.loading('Imprimiendo venta...');
    // Aquí va la lógica de impresión
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: ['attributes', 'createdAt'],
      width: '20%',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {new Date(date).toLocaleDateString()}
        </Space>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: ['attributes', 'client', 'data', 'attributes'],
      width: '30%',
      render: (client) => (
        <Space>
          <Avatar style={{ backgroundColor: '#87d068' }}>
            {client?.name[0]}
          </Avatar>
          {client?.name} {client?.last_name}
        </Space>
      ),
    },
    {
      title: 'Total',
      width: '25%',
      render: (_, record) => {
        const total = (record.attributes.detail || []).reduce(
          (sum, item) => sum + (item.unit_price * item.quantity_meterage), 0
        );
        return <Tag color="green">Bs. {total.toFixed(2)}</Tag>;
      }
    },
    {
      title: 'Acciones',
      width: '25%',
      align: 'center',
      render: (_, record) => (
        <Button 
          icon={<PrinterOutlined />} 
          onClick={() => handlePrintSale(record.id)}
          type="primary"
          size="small"
        >
          Imprimir
        </Button>
      ),
    }
  ];

  const reportMenuItems = [
    {
      key: 'sales',
      label: 'Reporte de Ventas',
      icon: <DollarOutlined />,
      children: [
        {
          key: 'daily',
          label: 'Reporte Diario',
          icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} />
        },
        {
          key: 'weekly',
          label: 'Reporte Semanal',
          icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} />
        },
        {
          key: 'monthly',
          label: 'Reporte Mensual',
          icon: <FilePdfOutlined style={{ color: '#ff4d4f' }} />
        }
      ]
    },
    {
      key: 'summary', 
      label: 'Resumen General',
      icon: <BiChart style={{ color: '#ff4d4f' }}/>
    }
  ];

  return (
    <Card 
      title={
        <Row justify="space-between" align="middle">
          <Space>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
            />
            <ShopOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span style={{ fontSize: '20px' }}>{branch?.name}</span>
            <Tag color={branch?.available ? 'green' : 'red'}>
              {branch?.available ? 'Activo' : 'Inactivo'}
            </Tag>
          </Space>
          <Space>
            <Dropdown
              menu={{ items: reportMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="primary" 
                icon={<PrinterOutlined />}
                style={{ background: '#722ed1' }}
              >
                Reportes
              </Button>
            </Dropdown>
          </Space>
        </Row>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card bordered={false} className="info-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <PhoneOutlined /> 
                <span>{branch?.phone}</span>
              </Space>
              <Space>
                <GlobalOutlined />
                <span>{branch?.departament}</span>
              </Space>
              <Space>
                <EnvironmentOutlined />
                <span>{branch?.address}</span>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={12} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Total Ventas"
              value={totalSales}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Monto Total"
              value={totalAmount}
              precision={2}
              prefix="Bs."
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card 
            title={<Typography.Title level={5}>Historial de Ventas</Typography.Title>}
            bordered={false}
          >
            <Table
              columns={columns}
              dataSource={sales}
              rowKey="id"
              pagination={{ 
                pageSize: 5,
                simple: true 
              }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default ViewBranch;