import { CloseOutlined, DeleteFilled, ExclamationCircleFilled, LeftOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Input, Row, Form, Select, Spin, Upload, Empty, DatePicker, Card, Divider, ColorPicker, Descriptions, message, Image, Modal, Steps, Space, Radio, InputNumber, } from 'antd'
import './Fabrics.css'
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { useCategories } from '../../services/Categories';
import { useSuppliers } from '../../services/Suppliers';
import { AiOutlineColumnHeight } from "react-icons/ai";
import { red, blue, volcano, presetDarkPalettes, gold, lime, grey } from '@ant-design/colors';
import { MdOutlineMonitorWeight } from "react-icons/md";
import { useUpdateFabric } from '../../services/Fabrics';
import MyUpload from '../../components/Fabrics/MyUpload';
import RollsForm from '../../components/Fabrics/RollsForm';
import { useWarehouses } from '../../services/Warehouses';

import dayjs from 'dayjs';
import { useQueryClient } from 'react-query';
const { TextArea } = Input


const EditFabric = () => {

  
  const location = useLocation();
  const fabricData = location.state; // Accedemos a los datos de la tela

  /* VARIABLES */
  const queryClient = useQueryClient()
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [supplierSelected, setSupplierSelected] = useState(null);
  const [form] = Form.useForm();
  /* PETICIONES A LA BASE DE DATOS */
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: suppliers, isLoading: isLoadingSupplier } = useSuppliers()
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses()
  const updateFabricMutation = useUpdateFabric();



  const onFinish = async (values) => {
    const rollsList = [];

    if (values.colors?.length > 0) {
      values.colors.forEach(color => {
        // Verificamos si el color tiene rolls
        if (color.rolls?.length > 0) {
          color.rolls.forEach(roll => {
            rollsList.push({
              id: roll.id || null,
              roll_footage: roll.roll_footage,
              status: roll.status || 'DISPONIBLE',
              unit: roll.unit,
              color: {
                id: color.id, // Usamos el ID del color que viene del formulario
                name: color.name,
                color: color.color,
                code: color.code
              },
              warehouse: values.warehouse,
              code: ''
            });
          });
        }
      });
    }

    const fabricDataToUpdate = {
      id: fabricData.id,
      data: {
        // Datos básicos
        name: values.name,
        code: values.code,
        description: values.description,
        arrive_date: values.arrive_date,
        height: values.height,
        weight: values.weight,

        // Precios
        cost: values.cost,
        retail_price: values.retail_price,
        wholesale_price: values.wholesale_price,
        wholesale_price_assorted: values.wholesale_price_assorted,
        price_per_roll: values.price_per_roll,
        price_per_roll_assorted: values.price_per_roll_assorted,

        // Relaciones
        supplier: supplierSelected?.id,
        warehouse: values.warehouse,
        categories: values.categories,

        // Colores y Rollos
        colors: values.colors.map(color => ({
          id: color.id, // Este ID ahora debería estar disponible
          name: color.name,
          color: color.color,
          code: color.code
        })),
        rolls: rollsList,

        // Imágenes
        fabric_images: fileList
      }
    };

    try {
      Modal.confirm({
        title: '¿Estás seguro de actualizar esta tela?',
        content: 'Al confirmar, la tela será actualizada en el sistema.',
        okText: 'Sí, actualizar tela',
        centered: true,
        cancelText: 'Cancelar',
        onOk: async () => {
          try {
            await updateFabricMutation.mutateAsync(fabricDataToUpdate);
            console.log(fabricDataToUpdate)
            message.success('Tela actualizada exitosamente');
           /*  navigate('/admin/fabrics'); */
          } catch (error) {
            console.error('Error:', error);
            message.error('Error al actualizar la tela');
          }
        }
      });
    } catch (error) {
      message.error('Error al mostrar el modal');
    } finally {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] })
    }
  };


  /* ----------------------------------------------------------------------- */
  const steps = [
    {
      title: 'Informacion basica',
    },
    {
      title: 'Imagenes y Colores',
    },
    {
      title: 'Rollos y Almacenes',
    },

  ];


  const next = () => {
    form.validateFields(['name', 'code', 'height', 'weight'])
      .then(() => {
        setCurrent(current + 1);
      })
      .catch(() => {
        message.error('Por favor complete todos los campos requeridos');
      });
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

 
 
  /* ELEMENTOS NECESARIOS PARA para AGREGAR COLOR */
  const genPresets = (presets = presetDarkPalettes) =>
    Object.entries(presets).map(([label, colors]) => ({
      label,
      colors,
    }));
  const presets = genPresets({
    red,
    volcano,
    gold,
    lime,
    blue,
    grey,

  });



  if (isLoadingCategories || isLoadingSupplier) (<div>Loading ...</div>)

  // Inicializar el formulario con datos existentes
  useEffect(() => {
    if (fabricData) {
      const rollsByColor = {};
      fabricData.attributes.rolls?.data?.forEach(roll => {
        if (roll.attributes.status === 'DISPONIBLE') {
          const colorName = roll.attributes.color?.data?.attributes.name;
          if (!rollsByColor[colorName]) {
            rollsByColor[colorName] = [];
          }
          rollsByColor[colorName].push({
            id: roll.id,
            roll_footage: roll.attributes.roll_footage,
            unit: roll.attributes.unit,
            warehouse: roll.attributes.warehouse?.data?.id,
            status: roll.attributes.status
          });
        }
      });

      // Modificamos formattedColors para incluir el id correctamente
      const formattedColors = fabricData.attributes.colors.data.map(color => ({
        id: color.id, // Aseguramos que el ID se capture aquí
        name: color.attributes.name,
        color: color.attributes.color,
        code: color.attributes.code,
        rolls: rollsByColor[color.attributes.name] || []
      }));

      const formattedData = {
        ...fabricData.attributes,
        arrive_date: dayjs(fabricData.attributes.arrive_date),
        categories: fabricData.attributes.categories?.data?.map(cat => cat.id),
        supplier: fabricData.attributes.supplier?.data?.id,
        colors: formattedColors,
        warehouse: fabricData.attributes.warehouse?.data?.id
      };

      form.setFieldsValue(formattedData);
      setSupplierSelected(fabricData.attributes.supplier?.data);
      setFileList(fabricData.attributes.fabric_images?.data || []);
    }
  }, [fabricData, form]);

  // Manejo de imágenes
  useEffect(() => {
    if (fabricData?.attributes?.fabric_images?.data) {
      setFileList(fabricData.attributes.fabric_images.data);
    }
  }, [fabricData]);

  useEffect(() => {
    const guardarBorrador = () => {
      const valores = form.getFieldsValue();
      localStorage.setItem('borrador_tela', JSON.stringify(valores));
    };

    // Guardar cada 30 segundos
    const intervalo = setInterval(guardarBorrador, 30000);
    return () => clearInterval(intervalo);
  }, [form]);

  return (
    <Row>
      <Col span={24}>
        <Row>
          <Steps current={current} items={items} size='small' className="site-navigation-steps" />
        </Row>
      </Col>

      <Form
        style={{
          paddingTop: 10,
          width: '100%'
        }}
        onFinish={onFinish}
        size='middle'
        form={form}
        layout="vertical"

      >

        <div>
          <Row gutter={16} style={{ display: current === 0 ? 'flex' : 'none', marginBottom: '37px' }}>
            <Col xs={24} md={12}>
              {/* descripcion del producto */}
              <div className='card-product'>
                <span className='title-card-name'>Descripcion del producto</span>
                <div>
                  <Row gutter={[8, -0]}>
                    <Col xs={24} sm={18} >
                      <Form.Item
                        label={<span className='label-item-card-product' >Nombre de la tela: </span>}
                        style={{ marginBottom: '10px' }}
                        name='name'
                        rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
                      >
                        <Input />
                      </Form.Item>

                    </Col>
                    <Col xs={24} sm={6}>
                      <Form.Item
                        label={<span className='label-item-card-product' >Codigo: </span>}
                        style={{ marginBottom: '10px' }}
                        name='code'
                        rules={[{ required: true, message: 'Por favor ingresa el código' }]}
                      >
                        <Input placeholder={'BM-XXXX'} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    label={<span style={{ fontSize: '12px', color: 'gray', margin: 0 }}>Descripcion de la tela:</span>}
                    style={{ marginBottom: 10 }}
                    name='description'

                  >
                    <TextArea autoSize={{ minRows: 2, maxRows: 3 }} />
                  </Form.Item>
                  <Row gutter={[8, -0]}>
                    <Col sm={24} md={24} lg={10}>
                      <Form.Item
                        label={<span className='label-item-card-product' >Fecha de llegada: </span>}
                        style={{ marginBottom: '0px' }}
                        name='arrive_date'

                      >
                        <DatePicker showTime needConfirm allowClear style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col sm={24} md={24} lg={7}>
                      <Form.Item
                        label={<span className='label-item-card-product' >Altura de rollo: </span>}
                        style={{ margin: 0 }}
                        name="height"
                        rules={[{ required: true, message: 'Por favor ingresa la altura' }]}
                      >
                        <Input prefix={<AiOutlineColumnHeight />} suffix="cm" type="number" />
                      </Form.Item>
                    </Col>
                    <Col sm={24} md={24} lg={7}>
                      <Form.Item
                        tooltip="El gramaje de una tela se calcula pesando con una pesa digital de maximo 800 g."
                        label={<span className='label-item-card-product' >Gramaje: </span>}
                        style={{ margin: 0 }}
                        name="weight"
                        rules={[{ required: true, message: 'Por favor ingresa el gramaje' }]}
                      >
                        <Input prefix={<MdOutlineMonitorWeight />} suffix="GSM" type="number" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>


              {/* PROOVEDORES */}
              <div className='card-product'>
                <span className='title-card-name'>Seleccion de Proovedor</span>
                <div>
                  {supplierSelected?.attributes ? (
                    <Card
                      title={supplierSelected.attributes.name}
                      extra={<CloseOutlined onClick={() => setSupplierSelected(false)} />}
                      styles={{
                        header: {
                          minHeight: 35,
                          backgroundColor: '#E3DFFF63',
                          fontSize: 14
                        },
                        body: {
                          padding: '10px 20px 10px 20px'
                        }
                      }}
                    >
                      <Row>


                        <Col span={16}>
                          <Descriptions layout='vertical' style={{ padding: '0px 0px 0px 20px' }} >
                            <Descriptions.Item style={{ margin: 0, padding: 0 }} label="Teléfono" span={3}>{supplierSelected.attributes.phone}</Descriptions.Item>
                            <Descriptions.Item style={{ margin: 0, padding: 0 }} label="País" span={2}>{supplierSelected.attributes.country}</Descriptions.Item>
                            <Descriptions.Item style={{ margin: 0, padding: 0 }} label="Ciudad" span={2}>{supplierSelected.attributes.city}</Descriptions.Item>
                            <Descriptions.Item style={{ margin: 0, padding: 0 }} label="Dirección" span={3}>{supplierSelected.attributes.address}</Descriptions.Item>
                          </Descriptions>
                        </Col>
                      </Row>


                    </Card>
                  ) : (
                    <Form.Item
                      label={<span className='label-item-card-product' >Proovedores: </span>}
                      style={{ marginBottom: '10px' }}
                      name='supplier'

                    >
                      {isLoadingSupplier ? (
                        <Spin />
                      ) : (
                        <Select
                          allowClear
                          style={{ width: '100%' }}
                          placeholder={`Selecciona un proovedor`}
                          optionLabelProp="label"
                          onSelect={(value, option) => { setSupplierSelected(option.data) }}
                        >
                          {suppliers?.data?.map(supplier => (
                            <Select.Option key={supplier.id} value={supplier.id} label={supplier.attributes.name} data={supplier}>
                              {supplier.attributes.name}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  )}

                </div>
              </div>

            </Col>

            <Col xs={24} md={12}>

              {/* PRECIOS DEL PRODUCTO */}

              <div className='card-product' >
                <span className='title-card-name'>Detalles de precios</span>

                <div>
                  <strong>Coste</strong>
                  <Form.Item
                    label={<span className='label-item-card-product' >Precio de fabrica (Dolares): </span>}
                    tooltip="El precio de fabrica es alquel monto que la fabrica proovedora te da, por lo general esta en Dolares."
                    name="cost"
                    style={{ margin: 0 }}
                    rules={[
                      { required: true, message: 'Por favor ingresa la cantidad.' },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.10}
                      precision={2}
                    />

                  </Form.Item>

                </div>

                <div>
                  <strong>Precio por metro</strong>
                  <Row gutter={[8, -0]}>
                    <Col xs={24} sm={12} lg={7}>
                      <Form.Item
                        label={<span className='label-item-card-product' >Al por menor: </span>}
                        style={{ margin: 0 }}
                        name="retail_price"
                      >
                        <Input prefix="Bs." type="number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={7}>
                      <Form.Item
                        label={<span className='label-item-card-product' >Al por mayor</span>}
                        name="wholesale_price"
                        style={{ margin: 0 }}
                      >
                        <Input prefix="Bs." type="number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={10}>
                      <Form.Item
                        label={<span className='label-item-card-product' >Al por mayor (surtido)</span>}
                        name="wholesale_price_assorted"
                        style={{ margin: 0 }}
                      >
                        <Input prefix="Bs." type="number" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div>
                  <strong>Precio por rollo</strong>
                  <Row gutter={[8, 0]}>
                    <Col xs={24} sm={12} lg={12}>
                      <Form.Item
                        label={<span className='label-item-card-product' >Precio unitario </span>}
                        name="price_per_roll"
                        style={{ margin: 0 }}
                      >
                        <Input prefix="Bs." type="number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={12}>
                      <Form.Item
                        label={<span className='label-item-card-product' >Precio por rollo (surtido) </span>}
                        name="price_per_roll_assorted"
                        style={{ margin: 0 }}
                      >
                        <Input prefix="Bs." type="number" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className='card-product' >0
                <span className='title-card-name'>Categorias</span>
                <div>
                  <Form.Item
                    label={<span className='label-item-card-product'>Categorías:</span>}
                    name="categories"
                    style={{ marginBottom: '10px' }}
                    rules={[{ required: true, message: 'Por favor selecciona al menos una categoría' }]}
                  >
                    {isLoadingCategories ? (
                      <Spin />
                    ) : (
                      <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Selecciona las categorías"
                        optionLabelProp="label"
                      >
                        {categories?.map(category => (
                          <Select.Option
                            key={category.id}
                            value={category.id}
                            label={category.attributes.name}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: category.attributes.color_categorie || '#ccc',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                color: '#fff'
                              }}
                            >
                              {category.attributes.name}
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </div>
              </div>
            </Col>

          </Row>
          <Row gutter={16} style={{ display: current === 1 ? 'flex' : 'none', marginBottom: '37px' }}>
            <MyUpload
              fileList={fileList}
              setFileList={setFileList}
            />
            <Col xs={24} sm={12}>
              {/* COLORES */}
              <div className='card-product'>
                <span className='title-card-name'>Eleccion de colores</span>
                <div>
                  <div>
                    <Row >
                      <Col span={24} >
                        <Form.List name={'colors'}>
                          {(fields, { add, remove }) => (
                            <div style={{ display: 'flex', rowGap: 4, flexDirection: 'column' }}>
                              {fields.map((field) => (
                                <Card
                                  size="small"
                                  styles={{
                                    body: {
                                      padding: '5px 5px'
                                    },
                                  }
                                  }
                                  key={field.key}
                                >
                                  <Row gutter={5} >
                                    <Col xs={24} sm={10} >
                                      <Form.Item
                                        label={<span className='label-item-card-product' >Nombre del color: </span>}
                                        style={{ marginBottom: '0px' }}
                                        name={[field.name, 'name']}
                                        disabled={true}
                                        rules={[{ required: true, message: 'Por favor ingresa el nombre del color' }]}
                                      >
                                        <Input disabled />
                                      </Form.Item>

                                    </Col>
                                    <Col xs={24} sm={3}>
                                      <Form.Item
                                        label={<span className='label-item-card-product' >Color: </span>}
                                        style={{ marginBottom: '0px' }}
                                        name={[field.name, 'color']}
                                        getValueFromEvent={(e) => "#" + e.toHex()}
                                        rules={[{ required: true, message: 'Por favor selecciona un color' }]}
                                      >
                                        <ColorPicker
                                          defaultValue={'tomato'}
                                          placement='bottom'
                                          styles={{
                                            popupOverlayInner: {
                                              width: 234,
                                            },
                                          }}
                                          onChange={(color, index) => {
                                            const hexadecimalColor = color.toHex();


                                            form.setFieldsValue({
                                              [`list[${index}].color`]: hexadecimalColor,
                                            });
                                          }}
                                          presets={presets}
                                          panelRender={(_, { components: { Picker, Presets } }) => (
                                            <Row justify="space-between" wrap={false}>
                                              <Col span={24} flex={'auto'}>
                                                <Picker />

                                                <Divider
                                                  type="vertical"
                                                  style={{
                                                    height: 'auto',
                                                  }}
                                                />
                                                <Presets />
                                              </Col>

                                            </Row>
                                          )}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8} >
                                      <Form.Item
                                        label={<span className='label-item-card-product' >Codigo del color: </span>}
                                        style={{ marginBottom: '0px' }}
                                        name={[field.name, 'code']}
                                      >
                                        <Input type='number' prefix='#' />
                                      </Form.Item>

                                    </Col>
                                    <Col xs={24} sm={3}>
                                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <DeleteFilled
                                          style={{
                                            color: 'tomato',
                                            fontSize: '18px', // Ajusta el tamaño del icono según sea necesario
                                          }}
                                          onClick={() => {
                                            remove(field.name);
                                          }}
                                        />
                                      </div>
                                    </Col>
                                  </Row>



                                </Card>
                              ))}
                              <Button type="dashed" onClick={() => add()} >
                                + Agregar Color
                              </Button>
                            </div>
                          )}
                        </Form.List>


                      </Col>
                    </Row>
                  </div>

                </div>
              </div>
            </Col>
          </Row>
          <Row gutter={16} style={{ display: current === 2 ? 'flex' : 'none', marginBottom: '37px' }}>
            <RollsForm form={form} presets={presets} isEdit={true} />
            
          </Row>

        </div>
        <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#fff', padding: '20px' }}>
          {current < steps.length - 1 && (
            <Button type="primary" danger onClick={() => next()}>
              Siguiente
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button icon={<PlusOutlined />} type="primary" htmlType="submit" danger>
              Actualizar tela
            </Button>
          )}
          {current > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
              Anterior
            </Button>
          )}

        </div>

      </Form >
    </Row >
  )
}

export default EditFabric
