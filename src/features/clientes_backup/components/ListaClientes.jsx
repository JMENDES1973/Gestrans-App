import React from "react";

const ListaClientes = ({ clientes, onEditar, onEliminar }) => {
  if (!clientes || clientes.length === 0) {
    return <p>Nenhum cliente registado.</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {clientes.map((cliente) => (
          <li
            key={cliente.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <div>
              <strong>{cliente.nome}</strong> <br />
              <small>NIF: {cliente.nif}</small>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => onEditar(cliente)}>✏️ Editar</button>
              <button onClick={() => onEliminar(cliente)}>🗑️ Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaClientes;
