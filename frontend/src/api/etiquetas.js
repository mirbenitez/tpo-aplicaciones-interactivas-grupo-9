import { api } from './apiClient';

// CRUD básico sobre /api/etiquetas
export const getEtiquetas    = ()        => api.get('/etiquetas');
export const getEtiqueta     = (id)      => api.get(`/etiquetas/${id}`);
export const crearEtiqueta   = (data)    => api.post('/etiquetas', data);
export const editarEtiqueta  = (id, data) => api.put(`/etiquetas/${id}`, data);
export const eliminarEtiqueta = (id)     => api.delete(`/etiquetas/${id}`);

// Asignación / desasignación de etiquetas a clientes
// Endpoints: POST/DELETE /api/clientes/{dni}/etiquetas/{idEtiqueta}
export const asignarEtiqueta    = (dni, idEtiqueta) => api.post(`/clientes/${dni}/etiquetas/${idEtiqueta}`);
export const desasignarEtiqueta = (dni, idEtiqueta) => api.delete(`/clientes/${dni}/etiquetas/${idEtiqueta}`);
