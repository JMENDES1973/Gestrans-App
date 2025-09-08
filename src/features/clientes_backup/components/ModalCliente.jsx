// src/features/clientes/components/ModalCliente.jsx
import React from "react";

const ModalCliente = ({ aberto, onFechar, children }) => {
  if (!aberto) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.fecharBtn} onClick={onFechar}>
          X
        </button>
        {children}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    minWidth: "300px",
    maxWidth: "500px",
    position: "relative",
  },
  fecharBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ModalCliente;
