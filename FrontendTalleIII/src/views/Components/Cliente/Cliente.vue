<template>
  <div class="min-h-screenspace-y-8">
    <div v-if="!modoEdicion">
      <ClienteHeader 
        :clientesActivos="clientesActivos" 
        :totalClientes="clientes.length" 
      />
      <ClienteFilters
        v-model="filtros"
        :status-options="statusOptions"
        @nuevo-cliente="iniciarModoEdicion()"
        class="mt-8"
      />
      <ClienteList
        :clientes="clientesPaginados"
        :cliente-expandido="clienteExpandido"
        @toggle-detalles="toggleDetalles"
        @editar="iniciarModoEdicion"
        @abrir-modal="abrirModalConfirmacion"
      />
      <ClientePagination
        v-if="totalPaginas > 0"
        :paginacion-info="paginacionInfo"
        :pagina-actual.sync="paginaActual"
        :total-paginas="totalPaginas"
        :visible-pages="visiblePages"
        @update:paginaActual="paginaActual = $event"
      />
    </div>

    <ClienteFormModal
      v-else
      :cliente-editado="clienteEditado"
      :es-nuevo-cliente="esNuevoCliente"
      :complemento="complemento"
      :barrios="barrios"
      :email-list="emailList"
      :documento-list="documentoList"
      :numero-list="numeroList"
      @guardar-cliente="guardarCliente"
      @cancelar="cancelarModoEdicion"
    />

    <ConfirmacionModal
      :show="modalAct"
      :title="clienteParaAccion?.estadoActual === 1 ? '¿Desactivar Cliente?' : '¿Activar Cliente?'"
      :confirmText="clienteParaAccion?.estadoActual === 1 ? 'Sí, Desactivar' : 'Sí, Activar'"
      cancelText="Cancelar"
      :confirmButtonClass="clienteParaAccion?.estadoActual === 1 ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500'"
      :iconComponent="AlertTriangle"
      iconClass="h-8 w-8 text-orange-600"
      @confirm="confirmar"
      @cancel="cerrarModalConfirmacion"
    >
      ¿Está seguro de que desea {{ clienteParaAccion?.estadoActual === 1 ? 'desactivar' : 'activar' }} al cliente
      <span class="font-semibold text-gray-900 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-lg">
        {{ clienteParaAccion?.nombre }}
      </span>?
    </ConfirmacionModal>

    <div
      v-if="showSuccessToast"
      class="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-slide-in"
    >
      <CheckCircle class="h-5 w-5" />
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fdba74, #f97316);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f97316, #ea580c);
}
</style>


<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { AlertTriangle, CheckCircle } from 'lucide-vue-next';

import ClienteHeader from './ClienteHeader.vue';
import ClienteFilters from './ClienteFilters.vue';
import ClienteList from './ClienteList.vue';
import ClientePagination from './ClientePagination.vue';
import ClienteFormModal from './ClienteFormModal.vue';
import ConfirmacionModal from '../Modals/ConfirmacionModal.vue';

import { listarBarrios } from '@/Server/api';
import { listarComplemento, listarDocumento, listarEmail, listarNumero } from '@/Server/Complemento';
import { SubirFoto } from '@/Server/Foto';
import { listarPersona, DeleteCliente, updateCliente, RegistrarCliente } from '@/Server/Cliente';

// --- State ---
const clientes = ref([]);
const complemento = ref([]);
const barrios = ref([]);
const emailList = ref([]);
const documentoList = ref([]);
const numeroList = ref([]);

const modoEdicion = ref(false);
const esNuevoCliente = ref(true);
const modalAct = ref(false);
const showSuccessToast = ref(false);
const successMessage = ref('');
const clienteExpandido = ref(null);

const filtros = ref({
  nombre: "",
  estado: "Todos"
});

const statusOptions = [
  { value: "Todos", label: "Todos", color: "bg-gray-500" },
  { value: "Activo", label: "Activo", color: "bg-green-500" },
  { value: "Inactivo", label: "Inactivo", color: "bg-red-500" }
];

const paginaActual = ref(1);
const itemsPerPage = 6;

const clienteEditado = ref(null);
const clienteParaAccion = ref(null);

// --- Computed properties ---
const clientesActivos = computed(() => clientes.value.filter(u => u.Estado.IdEstado === 1).length);

const clientesFiltrados = computed(() => {
  let clientesFiltrados = clientes.value;
  if (filtros.value.nombre) {
    const nombreLower = filtros.value.nombre.toLowerCase();
    clientesFiltrados = clientesFiltrados.filter(cliente =>
      (cliente.Nombre.toLowerCase() + " " + cliente.ApellidoPaterno.toLowerCase()).includes(nombreLower)
    );
  }
  if (filtros.value.estado !== 'Todos') {
    const estadoId = filtros.value.estado === 'Activo' ? 1 : 2;
    clientesFiltrados = clientesFiltrados.filter(cliente => cliente.Estado.IdEstado === estadoId);
  }
  return clientesFiltrados;
});

const totalPaginas = computed(() => Math.ceil(clientesFiltrados.value.length / itemsPerPage));

const clientesPaginados = computed(() => {
  const start = (paginaActual.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return clientesFiltrados.value.slice(start, end);
});

const paginacionInfo = computed(() => {
  const total = clientesFiltrados.value.length;
  const inicio = total === 0 ? 0 : (paginaActual.value - 1) * itemsPerPage + 1;
  const fin = Math.min(inicio + itemsPerPage - 1, total);
  return `Mostrando ${inicio}-${fin} de ${total} clientes`;
});

const visiblePages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPaginas.value; i++) {
    pages.push(i);
  }
  // This logic can be improved to show ellipses for many pages, but is fine for now
  return pages;
});

// --- Methods ---
const mostrarNotificacion = (mensaje) => {
  successMessage.value = mensaje;
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

const fetchData = async () => {
  try {
    [clientes.value, complemento.value, barrios.value, emailList.value, documentoList.value, numeroList.value] = await Promise.all([
      listarPersona(),
      listarComplemento(),
      listarBarrios(),
      listarEmail(),
      listarDocumento(),
      listarNumero()
    ]);
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
  }
};

const guardarCliente = async ({ cliente, archivo }) => {
  try {
    let imageUrl = cliente.Imagen?.Url;
    if (archivo) {
      imageUrl = await SubirFoto(archivo);
    }

    const payload = {
      ...cliente,
      IdPersona: cliente.IdPersona,
      Nombre: cliente.Nombre,
      ApellidoPaterno: cliente.ApellidoPaterno,
      ApellidoMaterno: cliente.ApellidoMaterno,
      FechaDeNacimiento: cliente.FechaDeNacimiento,
      IdGenero: cliente.Genero.IdGenero,
      Email: cliente.Email.Email,
      IdEmail: cliente.Email?.IdEmail,
      Url: imageUrl,
      IdDireccion: cliente.Direccion?.IdDireccion,
      IdBarrio: cliente.Direccion.Barrio.IdBarrio,
      Direccion: cliente.Direccion.Direccion,
      Referencia: cliente.Direccion.Referencia,
      Celulares: cliente.Celulares,
      Documento: cliente.Documento?.map(sub => ({
        IdDocumento: sub.IdDocumento,
        Documento: sub.Documento,
        IdTipodocumento: sub.Tipodocumento.IdTipoDocumento,
        Complemento: sub.Complemento?.IdComplemento
      })),
    };

    let response;
    if (esNuevoCliente.value) {
      response = await RegistrarCliente(payload);
    } else {
      response = await updateCliente(payload);
    }
    
    cancelarModoEdicion();
    await fetchData();
    mostrarNotificacion(response.message);

  } catch (error) {
    console.error('Error al guardar el cliente:', error);
  }
};

const confirmar = async () => {
  if (clienteParaAccion.value) {
    try {
      const response = await DeleteCliente(clienteParaAccion.value.id);
      mostrarNotificacion(response.message);
      await fetchData();
    } catch (error) {
      console.error('Error al cambiar el estado del cliente:', error);
    }
  }
  cerrarModalConfirmacion();
};

const resetClienteEditado = () => {
  return {
    IdPersona: null,
    Nombre: "",
    ApellidoPaterno: "",
    ApellidoMaterno: "",
    FechaDeNacimiento: new Date().toISOString().split('T')[0],
    Genero: { IdGenero: 1 },
    Celulares: [{ IdCelular: null, Numero: '' }],
    Direccion: {
      IdDireccion: '',
      Direccion: '',
      Referencia: '',
      Barrio: { IdBarrio: '', Nombre: '' }
    },
    Email: { IdEmail: null, Email: "" },
    Imagen: { IdImagen: null, Url: '' },
    Documento: [
      {
        IdDocumento: null, Documento: '', 
        Complemento: { IdComplemento: "C-1", Nombre: '' },
        Tipodocumento: { IdTipoDocumento: 2, Nombre: 'CI' }
      },
      {
        IdDocumento: null, Documento: '', 
        Complemento: null,
        Tipodocumento: { IdTipoDocumento: 1, Nombre: 'NIT' }
      }
    ],
  };
};

const iniciarModoEdicion = (cliente = null) => {
  console.log(cliente)
  if (cliente) {
    esNuevoCliente.value = false;
    // Deep clone the client object to avoid modifying the original list
    const clienteClonado = JSON.parse(JSON.stringify(cliente));

    // Get the default structure for a client
    const defaultCliente = resetClienteEditado();

    // Ensure nested objects exist, falling back to defaults if they are missing
    clienteClonado.Genero = clienteClonado.Genero || defaultCliente.Genero;
    clienteClonado.Email = clienteClonado.Email || defaultCliente.Email;
    clienteClonado.Imagen = clienteClonado.Imagen || defaultCliente.Imagen;
    
    clienteClonado.Direccion = clienteClonado.Direccion || defaultCliente.Direccion;
    if (clienteClonado.Direccion) {
      clienteClonado.Direccion.Barrio = clienteClonado.Direccion.Barrio || defaultCliente.Direccion.Barrio;
    }

    // Ensure Celulares is an array, with at least one item for the form
    if (!clienteClonado.Celulares || clienteClonado.Celulares.length === 0) {
      clienteClonado.Celulares = defaultCliente.Celulares;
    }

    // --- Documento Handling ---
    const clientDocs = clienteClonado.Documento || [];
    let ciDoc = clientDocs.find(d => d.Tipodocumento?.IdTipoDocumento == 2);
    let nitDoc = clientDocs.find(d => d.Tipodocumento?.IdTipoDocumento == 1);
    const defaultNitDoc = defaultCliente.Documento.find(d => d.Tipodocumento.IdTipoDocumento == 1);

    // If a CI doc exists, ensure its Complemento is valid. If not, create a complete default CI doc.
    if (ciDoc) {
        ciDoc.Complemento = ciDoc.Complemento || { IdComplemento: "C-1", Nombre: '' };
    } else {
        ciDoc = {
            IdDocumento: null, Documento: '',
            Complemento: { IdComplemento: "C-1", Nombre: '' },
            Tipodocumento: { IdTipoDocumento: 2, Nombre: 'CI' }
        };
    }

    // If no NIT doc was found, use the default.
    if (!nitDoc) {
        nitDoc = defaultNitDoc;
    }

    clienteClonado.Documento = [ciDoc, nitDoc];

    clienteEditado.value = clienteClonado;
  } else {
    esNuevoCliente.value = true;
    clienteEditado.value = resetClienteEditado();
  }
  modoEdicion.value = true;
};
 
const toggleDetalles = (clienteId) => {
  clienteExpandido.value = clienteExpandido.value === clienteId ? null : clienteId;
};

const cancelarModoEdicion = () => {
  modoEdicion.value = false;
  clienteEditado.value = null;
};

const abrirModalConfirmacion = (IdPersona, nombre, estadoActual) => {
  clienteParaAccion.value = { id: IdPersona, nombre: nombre, estadoActual: estadoActual };
  modalAct.value = true;
};

const cerrarModalConfirmacion = () => {
  modalAct.value = false;
  clienteParaAccion.value = null;
};

watch(clientesFiltrados, () => {
  if (paginaActual.value > totalPaginas.value) {
    paginaActual.value = totalPaginas.value || 1;
  }
});

onMounted(fetchData);
</script>
