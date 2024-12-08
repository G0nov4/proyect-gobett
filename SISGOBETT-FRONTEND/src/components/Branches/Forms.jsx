import React, { useEffect, useState } from 'react';
import { Button, Form, Row, Col, Input, Switch, Select, message } from 'antd';
import { PlusOutlined, ShopOutlined } from '@ant-design/icons';
import { bracnhService } from '../../services/Branch';
const { Option } = Select;
const { TextArea } = Input;

const BranchForm = ({ onCancel, updateTable, data }) => {
    const [form] = Form.useForm();
    const [switchValue, setSwitchValue] = useState(false);
    const [loadingButtonCreate, setLoadingButtonCreate] = useState(false);
    const [formEditData, setFormEditData] = useState({});

    const handleInputChange = (field, value) => {
        setFormEditData((prevData) => ({
            ...prevData,
            attributes: {
                ...prevData.attributes,
                [field]: value,
            },
        }));
        console.log(formEditData)
    };

    useEffect(() => {
        if (data) {
            setFormEditData(data)
        }
    }, [data]);

    const handleSwitchChange = (checked) => {
        setSwitchValue(checked);
    };
    const createBranch = async (values) => {
        try {
            setLoadingButtonCreate(true);
            await updateTable.mutate(values);
            form.resetFields(); // Restablecer el formulario después de la mutación exitosa
            onCancel(); // Cerrar el modal después de la mutación exitosa
        } catch (error) {
            console.error('Error creating branch:', error);
            message.error('Hubo un error al crear la sucursal. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setLoadingButtonCreate(false)
        }

    };
    return (

        <>
            <Row>
                <Col span={20}>
                    <h3 style={{ margin: 0 }}>Informacion de la Sucursal</h3>
                </Col>
                <Col>

                </Col>
            </Row>

            <Form
                form={form}
                onFinish={createBranch}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                layout="horizontal"
                initialValues={data.attributes} // Valor predeterminado para el switch
            >

                <Row align={'middle'} justify={'start'} style={{
                    padding: 20,
                    margin: '10px 0px 20px 0px',
                    border: '1px solid #d9d9d9', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                    <Col span={2} style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <ShopOutlined style={{ background: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', fontSize: '30px', padding: 5 }} />
                    </Col>
                    <Col span={17} style={{ margin: '0 5px' }}>
                        <Row>
                            <h4 style={{ margin: 0 }}>Habilitar Sucursal</h4>
                            <p style={{ color: 'gray', fontSize: 12, margin: '0' }}>Al habilitar la sucursal, estas asumiendo que la sucursal ya esta en funcionamiento y que esta habilitada a tener un inventario y registrar ventas.</p>
                        </Row>
                    </Col>
                    <Col span={4} style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'stretch'
                    }}>
                        <Form.Item
                            initialValue={false}
                            name="available"
                            style={{
                                marginBottom: 0
                            }}
                        >
                            <Switch
                                checked={switchValue}
                                onChange={handleSwitchChange}
                                checkedChildren="Habilitado"
                                unCheckedChildren="Inhabilitado"
                                style={{
                                    backgroundColor: switchValue ? '#52c41a' : '#f5222d',
                                    borderColor: switchValue ? '#1890ff' : '#f5222d',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Por favor, ingresa el nombre' }]}>
                            <Input placeholder="Nombre de la Sucursal"  onChange={(e) => handleInputChange('name', e.target.value)}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Teléfono"
                            name="phone"
                            required
                            rules={[
                                { required: true, message: 'Por favor, ingresa el número de teléfono' },
                                { pattern: /^[0-9]*$/, message: 'Ingresa solo números' },
                            ]}
                        >
                            <Input placeholder="Número de Teléfono"  onChange={(e) => handleInputChange('phone', e.target.value)}/>
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Ciudad"
                            name="departament"
                            rules={[{ required: true, message: 'Por favor, selecciona la ciudad' }]}
                        >
                            <Select placeholder="Selecciona la Ciudad"  onChange={(e) => handleInputChange('departament', e)}> 
                                <Option value="LA PAZ">La Paz</Option>
                                <Option value="SANTA CRUZ">Santa Cruz</Option>

                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Dirección" name="address">
                            <Input placeholder="Dirección de la Sucursal"   onChange={(e) => handleInputChange('address', e.target.value)}/>
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={16}>
                    <Button danger type="primary" htmlType="submit" icon={<PlusOutlined />} loading={loadingButtonCreate} >
                        Crear sucursal
                    </Button>
                </Row>
            </Form>

        </>
    )
}


const PointOfSaleForm = () => {
    const [form] = Form.useForm();
    const onFinish = (values) => {
        // Lógica para enviar el formulario
        console.log('Formulario enviado:', values);
    };
    const onChange = (e) => {
        console.log('Change:', e.target.value);
    };
    return (
        <>
            <Row style={{ marginBottom: 15 }}>
                <Col span={20}>
                    <h3 style={{ margin: 0 }}>Informacion de la Caja</h3>
                </Col>
                <Col>

                </Col>
            </Row>
            <Form
                form={form}
                onFinish={onFinish}
                layout="horizontal"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                initialValues={{ isActive: true }} // Valor predeterminado para el switch
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Nombre" name="name" rules={[{ required: true, message: 'Por favor, ingresa el nombre' }]}>
                            <Input placeholder="Nombre de la Sucursal" />
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Descripcion:"
                            name="description"
                        >
                            <TextArea showCount maxLength={100} onChange={onChange} placeholder="Descripcion" />

                        </Form.Item>
                    </Col>
                </Row>


            </Form>
        </>
    )
}
const BranchReview = () => {
    return (
        <></>
    )
}

export {
    BranchForm,
    PointOfSaleForm,
    BranchReview,
}