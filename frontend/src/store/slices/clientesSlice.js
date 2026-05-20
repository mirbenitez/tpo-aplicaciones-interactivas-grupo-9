import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getClientes, getCliente, crearCliente } from '../../api/clientes';

export const fetchClientes = createAsyncThunk('clientes/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getClientes();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchClientePorDni = createAsyncThunk('clientes/fetchByDni', async (dni, { rejectWithValue }) => {
  try {
    return await getCliente(dni);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addCliente = createAsyncThunk('clientes/add', async (data, { rejectWithValue }) => {
  try {
    return await crearCliente(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const clientesSlice = createSlice({
  name: 'clientes',
  initialState: {
    lista:        [],
    seleccionado: null,
    loading:      false,
    error:        null,
  },
  reducers: {
    clearError(state)        { state.error = null; },
    clearSeleccionado(state) { state.seleccionado = null; },
  },
  extraReducers: (builder) => {
    const onPending  = (state) => { state.loading = true;  state.error = null; };
    const onRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchClientes.pending,   onPending)
      .addCase(fetchClientes.fulfilled, (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchClientes.rejected,  onRejected)
      .addCase(fetchClientePorDni.pending,   onPending)
      .addCase(fetchClientePorDni.fulfilled, (state, action) => {
        state.loading = false;
        state.seleccionado = action.payload;
        // actualizar en la lista si ya estaba
        const idx = state.lista.findIndex(c => c.dni === action.payload.dni);
        if (idx !== -1) state.lista[idx] = action.payload;
      })
      .addCase(fetchClientePorDni.rejected,  onRejected)
      .addCase(addCliente.pending,      onPending)
      .addCase(addCliente.fulfilled,    (state, action) => { state.loading = false; state.lista.push(action.payload); })
      .addCase(addCliente.rejected,     onRejected);
  },
});

export const { clearError, clearSeleccionado } = clientesSlice.actions;
export default clientesSlice.reducer;
