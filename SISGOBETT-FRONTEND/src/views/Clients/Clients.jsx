import React, { useState } from 'react';
import { Layout, Row, Col, Button, Space, Avatar, Input } from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { useClients } from '../../services/Client';
import ClientsTable from '../../components/Tables/ClientsTable';
import CreateClientModal from '../../components/clients/ModalCreateClient';
import { generateClientReport } from '../../utils/admin/ReportClients';

const getRandomColor = () => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#ff4d4f'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Clients = () => {
  const { data: clients, isLoading } = useClients();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredClients = clients?.data?.filter(client => {
    const searchLower = searchText.toLowerCase();
    const name = client.attributes.name?.toLowerCase() || '';
    const lastName = client.attributes.last_name?.toLowerCase() || '';
    const phone1 = client.attributes.phone_1?.toLowerCase() || '';
    const phone2 = client.attributes.phone_2?.toLowerCase() || '';

    return name.includes(searchLower) || 
           lastName.includes(searchLower) ||
           phone1.includes(searchLower) ||
           phone2.includes(searchLower);
  });

 

  return (
    < >
      {!showReport ? (
        <Row >
          <Col xs={24} >
            <Row style={{ padding: { xs: '16px', sm: '24px' }, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: '16px', sm: '0' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '12px'
              }}>
                <div>
                  <h1 style={{ 
                    margin: 0,
                    fontSize: { xs: '24px', sm: '32px' },
                    background: 'linear-gradient(45deg, #ff4d4f, #ff7875)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    Gestión de Clientes
                  </h1>
                  <p style={{ 
                    margin: '8px 0 0', 
                    color: '#8c8c8c',
                    fontSize: { xs: '14px', sm: '16px' },
                    fontWeight: 500
                  }}>
                    {filteredClients?.length || 0} clientes registrados
                  </p>
                </div>
                <Space size="middle" wrap>
                  <Button 
                    icon={<FileTextOutlined />}
                    onClick={() => setShowReport(true)}
                    type='default'
                    size='middle'
                    style={{ 
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      borderColor: '#ff4d4f',
                      color: '#ff4d4f'
                    }}
                  >
                    Generar Reporte
                  </Button>
                  <Button 
                    onClick={() => setAddModalOpen(true)} 
                    icon={<PlusOutlined />} 
                    type='primary'
                    size='large'
                    style={{ 
                      borderRadius: '8px',
                      background: '#ff4d4f',
                      boxShadow: '0 2px 4px rgba(255,77,79,0.3)',
                      border: 'none'
                    }}
                  >
                    Añadir cliente
                  </Button>
                </Space>
              </div>

              <Input.Search
                placeholder="Buscar por nombre o teléfono..."
                style={{ 
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '400px' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: '8px'
                }}
                size="large"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                enterButton={
                  <Button 
                    type="primary" 
                    style={{
                      background: '#ff4d4f',
                      borderColor: '#ff4d4f'
                    }}
                  >
                    Buscar
                  </Button>
                }
              />

              <ClientsTable 
                clients={{ data: filteredClients || [] }}
                isLoading={isLoading}
                avatarRender={(client) => (
                  <Avatar
                    style={{ 
                      backgroundColor: getRandomColor(),
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      border: '2px solid #fff'
                    }}
                  >
                    {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                )}
              />
            </Row>
          </Col>
        </Row>
      ) : (
        <div>
          <Row style={{
            borderBottom: '2px solid #ff4d4f'
          }}>
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: '12px', sm: '0' },
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Space>
                <Button 
                  onClick={() => setShowReport(false)} 
                  type='primary'
                  icon={<FileTextOutlined />}
                  style={{
                    background: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(255,77,79,0.3)'
                  }}
                >
                  Volver al listado
                </Button>
              </Space>
              <h2 style={{
                margin: 0,
                color: '#ff4d4f',
                fontSize: { xs: '20px', sm: '24px' },
                fontWeight: 600,
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                Reporte de Clientes
              </h2>
            </div>
          </Row>
          <div style={{ 
            height: 'calc(100vh - 140px)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            margin: { xs: '12px', sm: '20px' },
          }}>
            {generateClientReport(clients)}
          </div>
        </div>
      )}
      <CreateClientModal visible={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  );
};

export default Clients;
