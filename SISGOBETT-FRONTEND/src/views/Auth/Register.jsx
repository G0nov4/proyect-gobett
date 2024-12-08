import React from 'react'
import { Col,  Layout, Row,  Typography, Image } from 'antd';
import business from '../../assets/Business Plan-bro.svg'
import RegisterForm from '../../components/Register/RegisterForm';
import './Login.css'

const { Title, Text } = Typography;

function Register() {
   

    const { Header, Content } = Layout;
    return (

        <Layout>
            <Header
                style={{
                    margin: 0,
                    padding: '20px',
                    background: '#FF002F',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >

                <Title level={3} style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    margin: 0,
                    padding: 0,
                }}>SISGOBETT</Title>
            </Header>
            <Content
                style={{
                    height: '40vh',
                    background: '#FF092F'
                }}>

                <Row  justify={'center'}>
                    <Col lg={14}  className='hero-description'>
                        <Row>
                            <Col span={12} style={{
                                marginLeft: '60px',

                            }}>
                              
                     
                                <Row>

                                    <Text level={4} style={{
                                        color: 'white',
                                        fontSize: '15px'
                                    }}>SISGOBETT es un sistema de control de ventas de artituclos textiles, donde la empresa GOBETT puede beneficiarse de multiples beneficios de gestion de su negocio. Con esta solucion uede organizar mejor su mercaderia y sus ventas con solo pocos pasos y de facil acceso.
                                    </Text>
                                </Row>
                            </Col>
                            <Col span={10}>
                                <Image
                                    preview={false}
                                    width='100%'
                                    src={business}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={10} md={24}>
                        <RegisterForm/>
                    </Col>
                </Row>

            </Content>
        </Layout>

    )
}

export default Register;