import React, { useState } from "react";
import { Button, Col, Form, Grid, Input, Row, theme, Typography } from "antd";
import { ArrowRightOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export default function RegisterForm() {
    const [loadings, setLoadings] = useState([]);
    const enterLoading = (index) => {
        setLoadings((prevLoadings) => {
            const newLoadings = [...prevLoadings];
            newLoadings[index] = true;
            return newLoadings;
        });
        setTimeout(() => {
            setLoadings((prevLoadings) => {
                const newLoadings = [...prevLoadings];
                newLoadings[index] = false;
                return newLoadings;
            });
        }, 6000);
    }
    const { token } = useToken();
    const screens = useBreakpoint();

    const onFinish = (values) => {
        console.log("Received values of form: ", values);
    };

    const styles = {
        container: {
            margin: "0 auto",
            padding: screens.md ? `${token.paddingXL}px` : `${token.paddingMD}px ${token.padding}px`,
        },
        footer: {
            marginTop: 20,
            textAlign: "center",
            width: "100%"
        },
        forgotPassword: {
            float: "right"
        },
        header: {
            marginBottom: 0,
        },
      
        text: {
            color: token.colorTextSecondary
        },
        title: {
            marginTop: 5,
            fontSize: screens.md ? token.fontSizeHeading2 : token.fontSizeHeading3
        },
        button: {
            backgroundColor: '#FF002F',
            color: 'white',
            fontWeight: 'bold'
        }
    };

    return (
        <section className="section-form-login">
            <div style={styles.container}>
                <div style={styles.header}>
                    <Row style={styles.header} justify={"space-between"}>
                        <Col span={15}>
                            <Text style={styles.text}>
                                Bienvenido a <Text style={{ fontWeight: 'bold', color: '#FF092F' }}>SISGOBETT</Text>
                            </Text>
                        </Col>
                        <Col>
                            <Row>
                                <Text>Ya tienes cuenta?</Text>
                            </Row>
                            <Row>
                                <Link to={'/login'}>Ingresa</Link>
                            </Row>
                        </Col>
                    </Row>
                    <Title style={styles.title}>REGISTRO</Title>

                </div>

                <Form
                    name="normal_login"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark="optional"
                >

                    <Form.Item
                        style={{
                            marginBottom: 10,
                        }}
                        name="email"
                        label='Ingresa tu nombre de usuario o correo electronico'
                        rules={[
                            {
                                type: "email",
                                required: true,
                                message: "Ingresa un correo valido!",
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Correo electronico"
                        />
                    </Form.Item>
                    <Form.Item
                        style={{
                            marginBottom: 0,
                        }}
                    >
                        <Form.Item
                            name="year"
                            label='Usuario'
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            style={{
                                display: 'inline-block',
                                width: 'calc(50% - 8px)',
                                marginBottom: 15,
                            }}
                        >
                            <Input placeholder="Nombre de usuario" />
                        </Form.Item>
                        <Form.Item
                            name="month"
                            label='Celular'
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            style={{
                                display: 'inline-block',
                                width: 'calc(50% - 8px)',
                                margin: '0 8px',
                            }}
                        >
                            <Input placeholder="Celular" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item
                        label='Ingresa tu contraseña'
                        rules={[
                            {
                                required: true,
                                message: "Ingresa una contraseña!",
                            },
                        ]}

                    >
                        <Input
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="Contraseña"
                        />
                    </Form.Item>
                    <Form.Item
                        label='Repite tu contraseña'
                        rules={[
                            {
                                required: true,
                                message: "Ingresa una contraseña!",
                            },
                        ]}

                    >
                        <Input
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="Contraseña"
                        />
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: "0px" }}>
                        <Button
                            block='true'
                            size="large"
                            icon={<ArrowRightOutlined />}
                            loading={loadings[1]}
                            onClick={() => enterLoading(1)}
                            style={styles.button}
                        >
                            REGISTRASE EN GOBETT
                        </Button>

                    </Form.Item>
                </Form>
            </div>
        </section>
    );
}