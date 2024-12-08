import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row, Select, Skeleton, Space, Spin, Upload, message } from 'antd';
import React, { useEffect, useState } from 'react'

import { useCreateSupplier,  useSuppliers } from '../../services/Suppliers';


import SuppliersTable from '../../components/Tables/SuppliersTable';
import { useSales } from '../../services/Sales';
import { useFabrics } from '../../services/Fabrics';
import { useQueryClient } from 'react-query';
import { generateAndPrintSupplierReport } from '../../utils/admin/ReportSupplier';

const Supplier = () => {
    const queryClient = useQueryClient();
    const createSupplierMutation = useCreateSupplier()
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState([]);
    const { data: suppliers, isLoading, isError, isFetching } = useSuppliers()
    const {data: sales, isLoading: isLoadingSales, isError: isErrorSales, isFetching: isFetchingSales} = useSales()
    const {data: fabrics, isLoading: isLoadingFabrics, isError: isErrorFabrics, isFetching: isFetchingFabrics} = useFabrics()
    const [addSupplierModalOpen, setAddSupplierModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [logoId, setLogoId] = useState(null);


    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
                const data = await response.json();
                // Map the API data to extract country names and flags
                const countryList = data.map(country => ({
                    name: country.name.common,
                    flag: country.flags.svg,
                    code: country.cca2, // Country code
                }));
                setCountries(countryList);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching countries:', error);
                setLoading(false);
            }
        };
        fetchCountries();
    }, []);

    if (isLoading) (
        <Spin></Spin>
    )
    if (isError) (
        <h1>
            Error
        </h1>
    )

    if (isFetching) (
        <Spin></Spin>
    )
    const combineAllData = () => {
        if (!suppliers?.data || !sales?.data || !fabrics?.data) return [];
        
        return suppliers.data.map(supplier => {
            // Obtener todas las telas del proveedor
            const supplierFabrics = fabrics.data.filter(fabric => 
                fabric.attributes.supplier?.data?.id === supplier.id
            );

            // Procesar las telas y sus ventas
            const fabricsWithSales = supplierFabrics.map(fabric => {
                // Encontrar todas las ventas para esta tela
                const fabricSales = sales.data.reduce((acc, sale) => {
                    const salesDetails = sale.attributes.detail.filter(detail => 
                        detail.fabric.data?.id === fabric.id
                    );

                    salesDetails.forEach(detail => {
                        acc.push({
                            saleId: sale.id,
                            date: sale.attributes.createdAt,
                            quantity: detail.quantity_meterage,
                            unitPrice: detail.unit_price,
                            total: detail.quantity_meterage * detail.unit_price,
                            color: detail.color?.data?.attributes?.name,
                            client: sale.attributes.client?.data?.attributes?.name || 'Cliente No Registrado',
                            saleType: sale.attributes.sales_type,
                            delivery: sale.attributes.delivery
                        });
                    });

                    return acc;
                }, []);

                // Calcular totales y datos por color
                const totalMeters = fabricSales.reduce((sum, sale) => sum + sale.quantity, 0);
                const totalAmount = fabricSales.reduce((sum, sale) => sum + sale.total, 0);
                const uniqueColors = [...new Set(fabricSales.map(sale => sale.color))];
                
                // Calcular rollos por color
                const rollsByColor = fabricSales.reduce((acc, sale) => {
                    acc[sale.color] = (acc[sale.color] || 0) + 1;
                    return acc;
                }, {});

                return {
                    id: fabric.id,
                    name: fabric.attributes.name,
                    code: fabric.attributes.code,
                    description: fabric.attributes.description,
                    height: fabric.attributes.height,
                    weight: fabric.attributes.weight,
                    totalRolls: fabric.attributes.total_rolls || 0,
                    rolls: fabric.attributes.rolls || [],
                    cost: fabric.attributes.cost || 0,
                    metersPerRoll: fabric.attributes.meters_per_roll || 0,
                    totalColors: uniqueColors.length,
                    retailPrice: fabric.attributes.retail_price,
                    wholesalePrice: fabric.attributes.wholesale_price,
                    arriveDate: fabric.attributes.arrive_date,
                    sales: fabricSales,
                    totalMeters,
                    totalAmount,
                    colors: uniqueColors,
                    rollsByColor,
                    totalSales: fabricSales.length
                };
            });

            // Calcular totales para el proveedor
            const totalProducts = fabricsWithSales.length;
            const totalRolls = fabricsWithSales.reduce((sum, fabric) => sum + fabric.totalRolls, 0);
            const totalMeters = fabricsWithSales.reduce((sum, fabric) => sum + fabric.totalMeters, 0);
            const totalColors = fabricsWithSales.reduce((sum, fabric) => sum + fabric.colors.length, 0);
            const totalSales = fabricsWithSales.reduce((sum, fabric) => sum + fabric.totalSales, 0);
            const totalSalesAmount = fabricsWithSales.reduce((sum, fabric) => sum + fabric.totalAmount, 0);

            return {
                id: supplier.id,
                name: supplier.attributes.name,
                country: supplier.attributes.country,
                city: supplier.attributes.city,
                phone: supplier.attributes.phone,
                address: supplier.attributes.address,
                totalRolls,
                totalMeters,
                totalColors,
                link_web: supplier.attributes.link_web,
                logo: supplier.attributes.logo?.data?.attributes?.url,
                fabrics: fabricsWithSales,
                statistics: {
                    totalSalesAmount,
                    totalProducts,
                    totalSales,
                    averageSaleAmount: totalSales > 0 ? totalSalesAmount / totalSales : 0,
                    productsByColor: fabricsWithSales.reduce((acc, fabric) => {
                        fabric.colors.forEach(color => {
                            acc[color] = (acc[color] || 0) + 1;
                        });
                        return acc;
                    }, {})
                }
            };
        });
    };

    useEffect(() => {
        if (suppliers?.data && sales?.data) {
            const combinedData = combineAllData();
            const filtered = combinedData.filter(supplier =>
                supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSuppliers(filtered);
        }
    }, [suppliers, sales, searchTerm]);

    const handleCrateSupplier = (values) => {
        const supplierData = {
            ...values,
            logo: logoId
        };
        
        const newSupplier = createSupplierMutation.mutateAsync(supplierData);
        newSupplier
            .then(data => {
                message.success('Proveedor agregado correctamente')
                queryClient.invalidateQueries('suppliers');
            })
            .catch(err => {
                message.error('Error al crear el proveedor, vuelve a intentarlo más tarde.')
            })
            .finally(() => {
                setAddSupplierModalOpen(false);
                setLogoId(null);
            })
    }



  

    return (
        <>
            <Row gutter={[16, 16]} >
                <Col span={24} style={{ display: 'flex', justifyContent: 'end' }}>
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px',
                      width: '100%'
                    }}>
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
                            Gestión de Proveedores
                          </h1>
                          <p style={{ 
                            margin: '8px 0 0', 
                            color: '#8c8c8c',
                            fontSize: { xs: '14px', sm: '16px' },
                            fontWeight: 500
                          }}>
                            {suppliers?.data?.length || 0} proveedores registrados
                          </p>
                        </div>
                        {isLoading ? (
                            <Space>
                                <Skeleton.Button active={true} size='small' />
                                <Skeleton.Button active={true} size='small' />
                                <Skeleton.Button active={true} size='small' />
                            </Space>
                        ) : (
                            <Space size="middle" wrap>
                                <Button 
                                    icon={<FileTextOutlined />}
                                    onClick={() => { generateAndPrintSupplierReport(combineAllData()) }}
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
                                    onClick={() => setAddSupplierModalOpen(true)} 
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
                                    Crear nuevo proveedor
                                </Button>
                            </Space>
                        )}
                      </div>

                      <Input.Search
                        placeholder="Buscar por nombre..."
                        style={{ 
                          width: '100%',
                          maxWidth: { xs: '100%', sm: '400px' },
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          borderRadius: '8px'
                        }}
                        size="large"
                        allowClear
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
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
                    </div>
                </Col>
               

                                <Col span={24}>
                    <SuppliersTable data={filteredSuppliers} />
                                </Col>

            </Row>
            <Modal
                centered
                title={<strong>CREAR PROOVEDOR</strong>}
                footer={null}
                visible={addSupplierModalOpen}
                onCancel={() => { setAddSupplierModalOpen(false) }}
            >
                <Form
                    layout='vertical'
                    onFinish={handleCrateSupplier}
                    preserve={false}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={<strong>Nombre</strong>}
                                style={{ marginBottom: "10px" }}
                                name="name"
                                rules={[{ required: true, message: 'Por favor ingrese el nombre del proovedor' }]}
                            >
                                <Input placeholder='Ingrese el nombre de la empresa' />
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={<strong>Pais</strong>}
                                style={{ marginBottom: "10px" }}
                                name="country"
                                rules={[{ required: true, message: 'Por favor ingrese el Pais' }]}
                            >
                                <Select
                                    showSearch

                                    placeholder="Selecciona un país"
                                    optionFilterProp="children"
                                    filterOption={(input, option) => {
                                        console.log(input, option)
                                        return option.children.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    }
                                >
                                    {countries.map((country) => (
                                        <Select.Option key={country.code} value={country.name}>
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                <img
                                                    src={country.flag}
                                                    alt={`Flag of ${country.name}`}
                                                    style={{ marginRight: 10, width: 20, height: 15 }}
                                                />
                                                {country.name}
                                            </span>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={<strong>Ciudad</strong>}
                                style={{ marginBottom: "10px" }}
                                name="city"
                            >
                                <Input placeholder='Nombre de la ciudad' />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={<strong>Numero de contacto</strong>}
                                style={{ marginBottom: "10px" }}
                                name="phone"
                            >
                                <Input type='number' placeholder='Ingrese el numoer de celular de la empresa' />
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={<strong>Direccion</strong>}
                                style={{ marginBottom: "10px" }}
                                name="address"
                            >
                                <Input placeholder='Ingrese la direccion de la empresa' />
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={<strong>Link de pagina web</strong>}
                                style={{ marginBottom: "10px" }}
                                name="link_web"
                            >
                                <Input type='text' placeholder='Ingrese el link de la pagina de la empresa' />
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                name="logo"
                                label={<strong>Logotipo de la empresa</strong>}
                                style={{ marginBottom: "10px" }}
                            >
                                <Upload
                                    name="logo"
                                    maxCount={1}
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={({ fileList: newFileList }) => {
                                        setFileList(newFileList);
                                    }}
                                    customRequest={async ({ file, onSuccess, onError }) => {
                                        try {
                                            const formData = new FormData();
                                            formData.append('files', file);
                                            
                                            const response = await fetch(`http://localhost:1337/api/upload`, {
                                                method: 'POST',
                                                headers: {
                                                    Authorization: `Bearer ${localStorage.getItem('sisgbt-jwtoken')}`,
                                                },
                                                body: formData
                                            });

                                            if (!response.ok) {
                                                throw new Error('Error en la subida');
                                            }

                                            const data = await response.json();
                                            const uploadedFile = data[0];
                                            setLogoId(uploadedFile.id);
                                            onSuccess(uploadedFile);
                                            message.success('Logo subido exitosamente');
                                        } catch (error) {
                                            console.error('Error:', error);
                                            onError(error);
                                            message.error('Error al subir el logo');
                                        }
                                    }}
                                    beforeUpload={file => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            message.error('Solo se permiten archivos de imagen');
                                            return false;
                                        }
                                        const isLt2M = file.size / 1024 / 1024 < 2;
                                        if (!isLt2M) {
                                            message.error('La imagen debe ser menor a 2MB');
                                            return false;
                                        }
                                        return true;
                                    }}
                                >
                                    {fileList.length < 1 && (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Subir Logo</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item >
                                <Space>
                                    <Button danger type="primary" htmlType="submit" icon={<PlusOutlined />} >
                                        CREAR PROOVEDOR
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    )
}

export default Supplier