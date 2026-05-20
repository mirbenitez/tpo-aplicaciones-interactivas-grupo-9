import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEtiquetas,
  addEtiqueta,
  updateEtiqueta,
  removeEtiqueta,
  clearError,
} from '../store/slices/etiquetasSlice';

/**
 * Página principal del módulo Etiquetas.
 *
 * Permite:
 *   - visualizar la lista de etiquetas (GET /api/etiquetas)
 *   - crear una etiqueta nueva    (POST /api/etiquetas)
 *   - editar una etiqueta existente (PUT /api/etiquetas/{id})
 *   - eliminar una etiqueta       (DELETE /api/etiquetas/{id})
 *
 * Maneja estado de carga y errores básicos de la API.
 */
export default function Etiquetas() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.etiquetas);

  // Formulario único, en modo "crear" si editandoId === null, sino modo "editar"
  const [form, setForm]           = useState({ nombre: '' });
  const [editandoId, setEditando] = useState(null);
  const [mensaje, setMensaje]     = useState('');

  // Carga inicial de la lista de etiquetas
  useEffect(() => {
    dispatch(fetchEtiquetas());
  }, [dispatch]);

  // Limpia el mensaje de éxito después de unos segundos
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(''), 3000);
    return () => clearTimeout(t);
  }, [mensaje]);

  const resetForm = () => {
    setForm({ nombre: '' });
    setEditando(null);
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId === null) {
      // Crear
      const result = await dispatch(addEtiqueta(form));
      if (result.meta.requestStatus === 'fulfilled') {
        setMensaje(`Etiqueta "${result.payload.nombre}" creada correctamente.`);
        resetForm();
      }
    } else {
      // Actualizar
      const result = await dispatch(updateEtiqueta({ id: editandoId, data: form }));
      if (result.meta.requestStatus === 'fulfilled') {
        setMensaje(`Etiqueta #${editandoId} actualizada.`);
        resetForm();
      }
    }
  };

  const handleEditar = (etiqueta) => {
    setEditando(etiqueta.id);
    setForm({ nombre: etiqueta.nombre });
    dispatch(clearError());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (etiqueta) => {
    const ok = window.confirm(`¿Eliminar la etiqueta "${etiqueta.nombre}"?`);
    if (!ok) return;
    const result = await dispatch(removeEtiqueta(etiqueta.id));
    if (result.meta.requestStatus === 'fulfilled') {
      setMensaje(`Etiqueta "${etiqueta.nombre}" eliminada.`);
      if (editandoId === etiqueta.id) resetForm();
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>🏷️ Etiquetas</h2>
      <p style={styles.subtitle}>
        Permite clasificar clientes mediante etiquetas para análisis o segmentación.
      </p>

      {/* Formulario de creación / edición */}
      <div style={styles.card}>
        <h3>{editandoId === null ? 'Nueva etiqueta' : `Editar etiqueta #${editandoId}`}</h3>

        {error    && <div style={styles.error}>⚠ {error}</div>}
        {mensaje  && <div style={styles.success}>✔ {mensaje}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder='Nombre (ej: "VIP", "Moroso", "Nuevo")'
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            required
            maxLength={50}
          />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading
              ? 'Guardando...'
              : editandoId === null ? 'Agregar' : 'Guardar cambios'}
          </button>
          {editandoId !== null && (
            <button type="button" style={styles.btnSecondary} onClick={resetForm} disabled={loading}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Listado */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3>Lista de etiquetas ({lista.length})</h3>
          <button
            style={styles.btnSecondary}
            onClick={() => dispatch(fetchEtiquetas())}
            disabled={loading}
          >
            Recargar
          </button>
        </div>

        {loading && lista.length === 0 && <p style={styles.empty}>Cargando etiquetas...</p>}
        {!loading && lista.length === 0 && <p style={styles.empty}>No hay etiquetas registradas todavía.</p>}

        {lista.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Nombre</th>
                <th style={{ width: '260px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(et => (
                <tr key={et.id}>
                  <td>#{et.id}</td>
                  <td>
                    <span style={styles.chip}>{et.nombre}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      style={styles.btnSmall}
                      onClick={() => handleEditar(et)}
                      disabled={loading}
                    >
                      Editar
                    </button>{' '}
                    <button
                      style={{ ...styles.btnSmall, ...styles.btnDanger }}
                      onClick={() => handleEliminar(et)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Acceso rápido a asignación */}
      <div style={styles.card}>
        <h3>¿Querés asignar etiquetas a un cliente?</h3>
        <p style={styles.helper}>
          Ingresá a la pantalla de asignación, indicá un DNI y manejá las etiquetas de ese cliente.
        </p>
        <Link to="/clientes/etiquetas" style={styles.btnLink}>
          Asignar etiquetas a clientes →
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page:        { padding:'32px', maxWidth:'900px', margin:'0 auto' },
  title:       { color:'#1e3a5f', marginBottom:'4px' },
  subtitle:    { color:'#666', marginBottom:'24px', fontSize:'0.95rem' },
  card:        { background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'24px' },
  cardHeader:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' },
  form:        { display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center', marginTop:'12px' },
  input:       { padding:'10px', border:'1px solid #ccc', borderRadius:'6px', flex:'1', minWidth:'200px' },
  btn:         { padding:'10px 20px', backgroundColor:'#1e3a5f', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  btnSecondary:{ padding:'8px 14px', backgroundColor:'#eceff1', color:'#37474f', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' },
  btnSmall:    { padding:'6px 12px', backgroundColor:'#1976d2', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' },
  btnDanger:   { backgroundColor:'#e53935' },
  btnLink:     { display:'inline-block', padding:'10px 16px', backgroundColor:'#1e3a5f', color:'white', borderRadius:'6px', textDecoration:'none', fontWeight:'bold', marginTop:'8px' },
  error:       { background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  success:     { background:'#e8f5e9', color:'#2e7d32', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  empty:       { color:'#999', padding:'12px 0' },
  helper:      { color:'#666', fontSize:'0.9rem', marginBottom:'8px' },
  table:       { width:'100%', borderCollapse:'collapse' },
  chip:        { display:'inline-block', padding:'4px 12px', backgroundColor:'#e3f2fd', color:'#1565c0', borderRadius:'16px', fontWeight:'500', fontSize:'0.9rem' },
};
