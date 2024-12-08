import React, { useState } from 'react';
import { Layout, Row, Col, Button, Space, Avatar, Input, Table, Modal, Form, Select, message, Tag, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, FileTextOutlined, DeleteOutlined, EditOutlined, EyeFilled, QuestionCircleOutlined, CloseOutlined, SaveOutlined, UserOutlined, IdcardOutlined, PhoneOutlined, SafetyCertificateOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useCreateUser, useUsers, useUpdateUser, useDeleteUser } from '../../services/Users';
import { BsFillPersonLinesFill, BsFillPersonFill, BsPhoneFill, BsPersonFill, BsEnvelopeFill, BsLockFill } from "react-icons/bs";
import { useQueryClient } from 'react-query';


const { Option } = Select;

const getRandomColor = () => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#ff4d4f'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Users = () => {
  // Estados
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { data: operators } = useUsers();
  const createMutationUser = useCreateUser();
  const queryClient = useQueryClient();
  const isLoading = !operators;
  const updateMutationUser = useUpdateUser();
  const deleteMutationUser = useDeleteUser();
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const filteredUsers = operators?.filter(user => {
    const searchLower = searchText.toLowerCase();
    const name = user.username?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    return name.includes(searchLower) || email.includes(searchLower);
  });

  // Funciones para manejar usuarios
  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleView = (user) => {
    console.log(user)
  }

  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    form.setFieldsValue(user);
    setAddModalOpen(true);
  };

  const handleDelete = async (userId) => {
    try {
      await deleteMutationUser.mutateAsync(userId);
      message.success('Usuario eliminado exitosamente');
      queryClient.invalidateQueries('users');
    } catch (error) {
      message.error('Error al eliminar usuario: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (isEditing) {
        await updateMutationUser.mutateAsync({
          id: currentUser.id,
          ...values
        });
        message.success('Usuario actualizado exitosamente');
      } else {
        await createMutationUser.mutateAsync(values);
        message.success('Usuario creado exitosamente');
      }

      handleCancel();
      queryClient.invalidateQueries('users');
    } catch (error) {
      message.error(`Error al ${isEditing ? 'actualizar' : 'crear'} usuario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAddModalOpen(false);
    setIsEditing(false);
    setCurrentUser(null);
    form.resetFields();
    queryClient.invalidateQueries('users');
  };

  const columns = [
    {
      title: (
        <Space>
          <BsFillPersonFill />
          <span>Nombre ({operators?.length || 0})</span>
        </Space>
      ),
      key: 'name',
      align: 'left',
      render: (_, record) => (
        <Space>
          <BsFillPersonFill style={{ fontSize: '16px', color: '#1890ff' }} />
          <span>{record.username}</span>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <BsEnvelopeFill />
          <span>Email</span>
        </Space>
      ),
      dataIndex: 'email',
      key: 'email',
      align: 'center',
    },
    {
      title: (
        <Space>
          <BsFillPersonLinesFill />
          <span>Rol</span>
        </Space>
      ),
      key: 'role',
      align: 'center',
      render: (record) => (
        <Tag color="blue">{record.role.name}</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver" color='#4F646F'>
            <Button
              icon={<EyeFilled />}
              size='small'
              style={{
                color: '#4F646F',
                borderColor: '#4F646F'
              }}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Editar" color='#F8BD25'>
            <Button
              icon={<EditOutlined />}
              size='small'
              style={{
                color: '#F8BD25',
                borderColor: '#F8BD25'
              }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar" color='#000'>
            <Popconfirm
              title="Eliminar Usuario"
              placement='left'
              description="Esta acción no podrá revertirse."
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size='small'
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Row>
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
                Gestión de Usuarios
              </h1>
              <p style={{ 
                margin: '8px 0 0', 
                color: '#8c8c8c',
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: 500
              }}>
                {filteredUsers?.length || 0} usuarios registrados
              </p>
            </div>
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
              Añadir Usuario
            </Button>
          </div>

          <Input.Search
            placeholder="Buscar por nombre o email..."
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

          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={isLoading}
            pagination={{ pageSize: 7 }}
            size="small"
            scroll={{ x: 400 }}
            rowKey="id"
          />
        </Row>
      </Col>

      {/* Modal para crear/editar usuario */}
      <Modal
        title={
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            background: 'linear-gradient(45deg, #1890ff, #69c0ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
        }
        open={addModalOpen}
        onCancel={handleCancel}
        width={700}
        footer={null}
       
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* Información Personal */}
          <div style={{ marginTop: '24px' }}>
           

            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="complete_name"
                  label="Nombre Completo"
                  rules={[
                    { required: true, message: 'Por favor ingresa el nombre completo' },
                    { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Ej: Juan Pérez" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="ci"
                  label="Cédula de Identidad"
                  rules={[
                    { required: true, message: 'Por favor ingresa el CI' },
                    { pattern: /^\d+$/, message: 'Solo números permitidos' }
                  ]}
                >
                  <Input prefix={<IdcardOutlined />} placeholder="Ej: 12345678" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="Nombre de Usuario"
                  rules={[
                    { required: true, message: 'Por favor ingresa el nombre de usuario' },
                    { min: 3, message: 'Mínimo 3 caracteres' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Ej: juanperez" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Teléfono"
                  rules={[
                    { pattern: /^\d+$/, message: 'Solo números permitidos' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Ej: 70712345" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Información de Cuenta */}
          <div>
            <h3 style={{
              fontSize: '16px',
              color: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: '8px',
              marginBottom: '16px'
            }}>
              <SafetyCertificateOutlined /> Información de Cuenta
            </h3>

            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Correo Electrónico"
                  rules={[
                    { required: true, message: 'Por favor ingresa el email' },
                    { type: 'email', message: 'Ingresa un email válido' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="ejemplo@correo.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label="Contraseña"
                  rules={[
                    { required: !form.getFieldValue('id'), message: 'Por favor ingresa la contraseña' },
                    { min: 6, message: 'Mínimo 6 caracteres' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="********" />
                </Form.Item>
              </Col>

            
            </Row>
          </div>

          {/* Botones de Acción */}
          <div style={{
            marginTop: '24px',
            padding: '16px 0 0',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <Button 
              onClick={() => {
                setAddModalOpen(false);
                form.resetFields();
              }}
              icon={<CloseOutlined />}
            >
              Cancelar
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              Guardar
            </Button>
          </div>
        </Form>
      </Modal>
    </Row>
  );
};

export default Users;