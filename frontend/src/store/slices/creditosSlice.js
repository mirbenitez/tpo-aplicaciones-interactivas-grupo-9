import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCreditosPorCliente,
  crearCredito,
  editarCredito,
  eliminarCredito,
} from '../../api/creditos';

export const fetchCreditosPorCliente = createAsyncThunk(
  'creditos/fetchPorCliente',
  async (dni, { rejectWithValue }) => {
    try { return await getCreditosPorCliente(dni); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const addCredito = createAsyncThunk(
  'creditos/add',
  async (data, { rejectWithValue }) => {
    try { return await crearCredito(data); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const updateCredito = createAsyncThunk(
  'creditos/update',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await editarCredito(id, data); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const removeCredito = createAsyncThunk(
  'creditos/remove',
  async (id, { rejectWithValue }) => {
    try { await eliminarCredito(id); return id; }
    catch (err) { return rejectWithValue(err.message); }
  }
);

const creditosSlice = createSlice({
  name: 'creditos',
  initialState: {
    lista:   [],
    loading: false,
    error:   null,
  },
  reducers: {
    clearCreditos(state) { state.lista = []; },
    clearError(state)    { state.error = null; },
  },
  extraReducers: (builder) => {
    const onPending  = (state) => { state.loading = true;  state.error = null; };
    const onRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchCreditosPorCliente.pending,   onPending)
      .addCase(fetchCreditosPorCliente.fulfilled, (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchCreditosPorCliente.rejected,  onRejected)

      .addCase(addCredito.pending,    onPending)
      .addCase(addCredito.fulfilled,  (state, action) => { state.loading = false; state.lista.push(action.payload); })
      .addCase(addCredito.rejected,   onRejected)

      .addCase(updateCredito.pending,   onPending)
      .addCase(updateCredito.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.lista.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.lista[idx] = action.payload;
      })
      .addCase(updateCredito.rejected,  onRejected)

      .addCase(removeCredito.pending,   onPending)
      .addCase(removeCredito.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = state.lista.filter(c => c.id !== action.payload);
      })
      .addCase(removeCredito.rejected,  onRejected);
  },
});

export const { clearCreditos, clearError } = creditosSlice.actions;
export default creditosSlice.reducer;
