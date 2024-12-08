import React from "react";
import { Spin } from "antd";
import logo from "../../assets/Logo Gobett.png"; // Importa tu logo aquí

const LoadingPage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <img src={logo} alt="Logo" style={styles.logo} />
      </div>
      <Spin size="large" />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 200, // Ajusta el tamaño de tu logo según sea necesario
    height: "auto",
  },
};

export default LoadingPage;