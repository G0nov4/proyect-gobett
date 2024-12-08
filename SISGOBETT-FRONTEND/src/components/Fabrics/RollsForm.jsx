import { Col, Form, Card, Row, Input, Space, Button, InputNumber, Radio, message, ColorPicker, Divider, Select } from 'antd';
import { DeleteFilled, CloseOutlined } from '@ant-design/icons';
import React from 'react';

const ColorCard = ({ field, remove, presets, form, isEdit }) => {
    // Obtener el valor del color actual
    const currentColor = Form.useWatch(['colors', field.name, 'color'], form);
    return (
        <Card
            size="small"
            key={field.key}
            styles={{
                body: {
                    padding: '5px 10px',
                    borderLeft: `4px solid ${currentColor || '#000000'}`  // Añadir borde del color seleccionado
                }
            }}
            style={{
                marginBottom: 10
            }}
        >
            <Row gutter={5} >
                <Col xs={4} sm={4}>
                    <Form.Item
                        name={[field.name, 'color']}
                        style={{ marginBottom: '0px' }}
                        getValueFromEvent={(e) => "#" + e.toHex()}
                        rules={[{ required: true, message: 'Por favor selecciona un color' }]}
                    >
                        <ColorPicker
                            defaultValue={'tomato'}
                            placement='bottom'
                            presets={presets}
                            panelRender={(_, { components: { Picker, Presets } }) => (
                                <Row justify="space-between">
                                    <Col span={24} flex={'auto'}>
                                        <Picker />
                                        <Divider type="vertical" style={{ height: 'auto' }} />
                                        <Presets />
                                    </Col>
                                </Row>
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={5} sm={4}>
                    <Form.Item
                        name={[field.name, 'code']}
                        style={{ marginBottom: '0px' }}
                    >
                        <Input  prefix='#' variant='borderless' style={{
                            borderBottom: '1px solid #4F646F',
                            borderRadius: 0
                        }} />
                    </Form.Item>
                </Col>
                <Col xs={10} sm={10}>
                    <Form.Item
                        name={[field.name, 'name']}
                        rules={[{ required: true, message: 'Por favor ingresa el nombre del color' }]}
                        style={{
                            borderBottom: '1px solid #4F646F',
                            borderRadius: 0,
                            marginBottom: '0px'
                        }}
                    >
                        <Input variant='borderless' />
                    </Form.Item>
                </Col>
                <Col xs={4} sm={4}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <DeleteFilled
                            style={{ color: '#4F646F', fontSize: '18px' }}
                            onClick={() => remove(field.name)}
                        />
                    </div>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0px' }} />
            <RollsList 
                field={field} 
                form={form}
                isEdit={isEdit}
            />
        </Card>
    );
};

const RollsList = ({ field, form, isEdit }) => {
    // Obtener el valor del color actual
    const currentColor = Form.useWatch(['colors', field.name, 'color'], form);
    const colorValues = form.getFieldValue(['colors', field.name]);
    return (
        <Form.List 
            name={[field.name, 'rolls']}
            initialValue={colorValues?.rolls || []}
        >
            {(subFields, subOpt) => (
                <div style={{ marginBottom: '5px' }}>
                    <Row gutter={[20, 10]} align='middle' justify='space-evenly' style={{marginBottom: 10}}>  
                        {subFields.map((subField, index) => (
                            <Col md={12} sm={24} lg={12} key={subField.key}>
                                <Space align='center' style={{ 
                                    backgroundColor: currentColor ? `${currentColor}20` : 'transparent',
                                    padding: '5px 10px',
                                    borderRadius: '4px'
                                }}>
                                    <strong>{!isEdit ? `Rollo # ${index + 1}: ` : 'Rollo: '}</strong>
                                    <Space.Compact style={{ marginBottom: '0px' }} align='center'>
                                        <Form.Item 
                                            noStyle 
                                            name={[subField.name, 'roll_footage']}
                                        >
                                            <InputNumber 
                                                controls={false} 
                                                min={1} 
                                                max={200} 
                                                style={{ width: '50px' }} 
                                            />
                                        </Form.Item>
                                        <Form.Item 
                                            noStyle 
                                            name={[subField.name, 'unit']} 
                                            initialValue="Metros"
                                        >
                                            <Select
                                               
                                                options={[
                                                    { value: 'Metros', label: 'mts' },
                                                    { value: 'Kilogramos', label: 'kg' },
                                                ]} 
                                            />
                                        </Form.Item>
                                    </Space.Compact>
                                    <CloseOutlined 
                                        onClick={() => subOpt.remove(subField.name)} 
                                        style={{ fontSize: '16px', cursor: 'pointer' }}
                                    />
                                </Space>
                            </Col>
                        ))}
                    </Row>
                    <Button type="dashed" onClick={() => subOpt.add()} block>
                        + Añadir Rollo
                    </Button>
                </div>
            )}
        </Form.List>
    );
};

const RollsForm = ({ form, presets, isEdit }) => {
    // Obtener los valores actuales del formulario
    
    return (
        <Col xs={24} md={24} lg={12}>
            <div className='card-product'>
                <span className='title-card-name'>Registro de Rollos</span>
                <div>
                    <Form.List name={'colors'}>
                        {(fields, { add, remove }) =>(
                       
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {fields.map((field) => (
                                        <ColorCard
                                            presets={presets}
                                            key={field.key}
                                            field={field}
                                            remove={remove}
                                            form={form} // Pasar el form para acceder a los valores
                                            isEdit={isEdit}
                                        />
                                    ))}
                                    <Button type="dashed" onClick={() => add()} block>
                                        + Agregar Color
                                    </Button>
                                </div>
                            
                        )}
                    </Form.List>
                </div>
            </div>
        </Col>
    );
};

export default RollsForm;
