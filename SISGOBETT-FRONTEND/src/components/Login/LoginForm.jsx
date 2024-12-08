import React, { useContext, useState } from "react";
import { Button,  Col, Form, Grid, Input, message, Row, theme, Typography } from "antd";
import { LockOutlined, MailOutlined, PoweroffOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";


const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export default function LoginForm() {
    const { login } = useContext(AuthContext)
    const [loading, setLoading] = useState(false);
    const { token } = useToken();
    const screens = useBreakpoint();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
        } catch (error) {
            message.error("No se pudo iniciar sesión, revise sus datos por favor");
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            margin: "0 auto",
            padding: screens.md ? `${token.paddingXL}px` : `${token.paddingMD}px ${token.padding}px`,
        },
        footer: {
            marginTop: token.marginLG,
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
                       
                    </Row>
                    <Title style={styles.title}>INGRESO</Title>

                </div>

                <Form
                    name="normal_login"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark="optional"
                    size="large"
                >
                    <Form.Item
                        label='Ingresa tu nombre de usuario o correo electrónico'
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Ingresa un usuario o correo electrónico válido!",
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Usuario o correo electrónico"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Ingresa tu contraseña"
                        rules={[
                            {
                                required: true,
                                message: "Ingresa una contraseña!",
                            },
                        ]}
                    >

                        <Input.Password
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="Contraseña"
                        />
                    </Form.Item>
                    <Form.Item>
                        <a style={styles.forgotPassword} href="/">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: "0px" }}>
                        <Button
                            block='true'
                            icon={<PoweroffOutlined />}
                            loading={loading}
                            htmlType="submit"
                            style={styles.button}
                        >
                            INGRESAR A SISGOBETT
                        </Button>

                    </Form.Item>
                </Form>
            </div>
        </section>
    );
}