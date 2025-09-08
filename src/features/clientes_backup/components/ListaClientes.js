// src/features/clientes/components/ListaClientes.js
import React from "react";

const ListaClientes = ({ clientes, onEditar, onApagar }) => {
  if (!clientes || clientes.length === 0) {
    return <p>Não existem clientes registados.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((cliente) => (
          <tr key={cliente.id}>
            <td>{cliente.nome}</td>
            <td>{cliente.email}</td>
            <td>{cliente.telefone}</td>
            <td>
              <button onClick={() => onEditar(cliente)}>Editar</button>
              <button onClick={() => onApagar(cliente.id)}>Apagar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ListaClientes;
