import React from 'react';

export default function ModalCliente({ titulo, children, onClose, onPrimary, primaryLabel='Guardar', secondaryLabel='Cancelar' }) {
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
      <div style={{background:'#fff', width:'90%', maxWidth:900, maxHeight:'90%', overflow:'auto', borderRadius:8}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid #eee'}}>
          <h2 style={{margin:0, fontSize:18}}>{titulo}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div style={{padding:16}}>
          {children}
          <div style={{marginTop:16, display:'flex', gap:8, justifyContent:'flex-end'}}>
            <button onClick={onClose}>{secondaryLabel}</button>
            <button onClick={onPrimary}>{primaryLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
