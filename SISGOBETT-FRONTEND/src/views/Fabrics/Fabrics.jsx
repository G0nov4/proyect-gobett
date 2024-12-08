import { Col, Row, Input, Button, Space } from 'antd';
import React, { useState } from 'react';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import TableFabrics from '../../components/Tables/TableFabrics';
import { useFabrics } from '../../services/Fabrics';
import { useNavigate } from 'react-router-dom';
import { generateFabricReport } from '../../utils/admin/ReportFabric';


const Fabrics = () => {
  const { data: fabrics, error: errorFabrics, isLoading: isLoadingFabrics } = useFabrics();
  const [searchText, setSearchText] = useState('');
  const [showReport, setShowReport] = useState(false);
  const navigate = useNavigate();

  // Función de filtrado mejorada
  const filteredFabrics = React.useMemo(() => {
    if (!fabrics?.data) return [];
    
    return searchText === '' ? fabrics.data : fabrics.data.filter(fabric => {
      const searchLower = searchText.toLowerCase();
      const attributes = fabric.attributes;
      
      return (
        attributes.name?.toLowerCase().includes(searchLower) ||
        attributes.cost?.toString().includes(searchLower) ||
        attributes.rolls?.data?.length.toString().includes(searchLower) ||
        (attributes.availability_status ? 'activo' : 'inactivo').includes(searchLower)
      );
    });
  }, [fabrics, searchText]);

  return (
    <>
      {!showReport ? (
        <Row gutter={[0, 16]}>
          <Col xs={24}>
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
                    Gestión de Telas
                  </h1>
                  <p style={{ 
                    margin: '8px 0 0', 
                    color: '#8c8c8c',
                    fontSize: { xs: '14px', sm: '16px' },
                    fontWeight: 500
                  }}>
                    {filteredFabrics?.length || 0} telas registradas
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
                    onClick={() => navigate("/admin/fabric/create")}
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
                    Crear producto tela
                  </Button>
                </Space>
              </div>

              <Input.Search
                placeholder="Buscar telas..."
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
            </Row>
          </Col>

          <Col xs={24}>
            <TableFabrics 
              filteredFabrics={filteredFabrics}
              isLoadingFabrics={isLoadingFabrics}
              errorFabrics={errorFabrics}
            />
          </Col>
        </Row>
      ) : (
        <Row>
          <Col span={24}>
            <Row style={{ padding: '10px', backgroundColor: '#fff' }}>
              <Space>
                <Button onClick={() => setShowReport(false)} type='primary' danger>
                  Volver
                </Button>
              </Space>
            </Row>
            <div style={{ height: 'calc(100vh - 60px)' }}>
                {generateFabricReport(fabrics)}
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Fabrics;