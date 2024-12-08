import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Row, Col, Divider, Space, Spin, message, Upload, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, SaveOutlined, NumberOutlined, HomeOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getCompanyData, updateCompanyData } from '../../config';
import logo from '../../assets/Logo Gobett.png'
const { Title } = Typography;
const { Dragger } = Upload;

const Configuration = () => {
  const [companyForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const companyData = getCompanyData();
  const [logoUrl, setLogoUrl] = useState(logo);

  // Manejador para datos de la empresa
  const handleCompanySubmit = async (values) => {
    try {
      setLoading(true);
      // Actualizamos los datos de la empresa
      const updatedData = updateCompanyData({
        name: values.name,
        legalName: values.legalName,
        nit: values.nit,
        email: values.email,
        logo: logoUrl
      });

      message.success('Datos de la empresa actualizados correctamente');
    } catch (error) {
      message.error('Error al actualizar los datos de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (info) => {
    if (info.file) {
      // Crear URL temporal para previsualizar la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoUrl(e.target.result);
      };
      reader.readAsDataURL(info.file);
    }
  };

  const labelStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '8px'
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={<Title level={3}>Datos de la Empresa</Title>}
            className="config-card"
          >
            <Form 
              form={companyForm}
              onFinish={handleCompanySubmit}
              initialValues={companyData}
              layout="vertical"
            >
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Tooltip title="Nombre comercial con el que se identifica la empresa">
                    <Form.Item
                      label={<span style={labelStyle}>Nombre de la Empresa <InfoCircleOutlined /></span>}
                      name="name" 
                      rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
                    >
                      <Input prefix={<EditOutlined />} />
                    </Form.Item>
                  </Tooltip>
                </Col>
                <Col xs={24} sm={12}>
                  <Tooltip title="Número de Identificación Tributaria o Cédula de Identidad">
                    <Form.Item
                      label={<span style={labelStyle}>NIT/CI <InfoCircleOutlined /></span>}
                      name="nit"
                      rules={[{ required: true, message: 'Por favor ingrese el NIT o CI' }]}
                    >
                      <Input prefix={<NumberOutlined/>} />
                    </Form.Item>
                  </Tooltip>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Tooltip title="Nombre legal registrado de la empresa">
                    <Form.Item
                      label={<span style={labelStyle}>Razón Social <InfoCircleOutlined /></span>}
                      name="legalName"
                      rules={[{ required: true, message: 'Por favor ingrese la razón social' }]}
                    >
                      <Input prefix={<EditOutlined />} />
                    </Form.Item>
                  </Tooltip>
                </Col>
                <Col xs={24} sm={12}>
                  <Tooltip title="Correo electrónico principal de contacto">
                    <Form.Item
                      label={<span style={labelStyle}>Correo Electrónico <InfoCircleOutlined /></span>}
                      name="email"
                      rules={[
                        { required: true, message: 'Por favor ingrese el correo' },
                        { type: 'email', message: 'Ingrese un correo válido' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Tooltip>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Tooltip title="Sube o arrastra el logotipo de tu empresa (formatos: PNG, JPG, SVG)">
                    <Form.Item
                      label={<span style={labelStyle}>Logotipo de la Empresa <InfoCircleOutlined /></span>}
                      name="logo"
                    >
                      <Row gutter={12} align="middle">
                        <Col span={12}>
                          <Dragger
                            accept="image/*"
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={handleLogoChange}
                            showUploadList={false}
                            style={{ padding: '8px', height: '80px' }}
                          >
                            <p className="ant-upload-drag-icon">
                              <PlusOutlined />
                            </p>
                            <p className="ant-upload-text" style={{fontSize: '12px'}}>Subir logo</p>
                          </Dragger>
                        </Col>
                        <Col span={12}>
                          {logoUrl && (
                            <img 
                              src={logoUrl}
                              alt="Logo actual"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '80px',
                                objectFit: 'contain'
                              }}
                            />
                          )}
                        </Col>
                      </Row>
                    </Form.Item>
                  </Tooltip>
                </Col>
              </Row>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  size="large"
                  loading={loading}
                >
                  Guardar Cambios
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Configuration;