import { api } from './apiClient';

export const getCobranzasPorCredito = (idCredito) => api.get(`/cobranzas/credito/${idCredito}`);
export const registrarCobranza      = (data)      => api.post('/cobranzas', data);
export const editarCobranza         = (id, data)  => api.put(`/cobranzas/${id}`, data);
export const eliminarCobranza       = (id)        => api.delete(`/cobranzas/${id}`);
