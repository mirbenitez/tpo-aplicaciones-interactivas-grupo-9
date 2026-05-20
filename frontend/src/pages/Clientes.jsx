import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientes, addCliente } from '../store/slices/clientesSlice';

export default function Clientes() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.clientes);
  const [form, setForm] = useState({ dni: '', nombre: '' });

  useEffect(() => { dispatch(fetchClientes()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(addCliente(form));
    if (result.meta.requestStatus === 'fulfilled') setForm({ dni: '', nombre: '' });
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Clientes</h2>

      <div style={styles.card}>
        <h3>Nuevo cliente</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="DNI" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} required />
          <input style={styles.input} placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
          <button style={styles.btn} disabled={loading}>{loading ? 'Guardando...' : 'Agregar'}</button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3>Lista de clientes ({lista.length})</h3>
          <Link to="/clientes/etiquetas" style={styles.btnLink}>Gestionar etiquetas →</Link>
        </div>
        {loading && <p style={styles.empty}>Cargando...</p>}
        {!loading && lista.length === 0 && <p style={styles.empty}>No hay clientes registrados.</p>}
        {lista.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Etiquetas</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(c => (
                <tr key={c.dni}>
                  <td>{c.dni}</td>
                  <td>{c.nombre}</td>
                  <td>
                    {(c.etiquetas && c.etiquetas.length > 0)
                      ? c.etiquetas.map(et => (
                          <span key={et.id} style={styles.chip}>{et.nombre}</span>
                        ))
                      : <span style={styles.empty}>— sin etiquetas —</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:       { padding:'32px', maxWidth:'900px', margin:'0 auto' },
  title:      { color:'#1e3a5f', marginBottom:'24px' },
  card:       { background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'24px' },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' },
  form:       { display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' },
  input:      { padding:'10px', border:'1px solid #ccc', borderRadius:'6px', flex:'1', minWidth:'140px' },
  btn:        { padding:'10px 20px', backgroundColor:'#1e3a5f', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  btnLink:    { display:'inline-block', padding:'8px 14px', backgroundColor:'#1565c0', color:'white', borderRadius:'6px', textDecoration:'none', fontWeight:'500', fontSize:'0.9rem' },
  error:      { background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  empty:      { color:'#999' },
  table:      { width:'100%', borderCollapse:'collapse' },
  chip:       { display:'inline-block', padding:'3px 10px', marginRight:'6px', marginBottom:'4px', backgroundColor:'#e3f2fd', color:'#1565c0', borderRadius:'14px', fontWeight:'500', fontSize:'0.85rem' },
};
