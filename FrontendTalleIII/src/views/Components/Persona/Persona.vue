<template>
  <div class="min-h-screen">
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-400/5 to-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Loading inicial -->
    <Transition name="fade" mode="out-in">
      <div v-if="cargandoInicial" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative mb-6">
            <div class="w-20 h-20 mx-auto relative">
              <div class="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-red-500 animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                  <Users class="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">Cargando Personas</h3>
          <p class="text-gray-500 text-sm">Preparando datos...</p>
          <div class="mt-4 w-40 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div v-else>

        <!-- Formulario -->
        <Registrar
          v-if="modoEdicion"
          :persona="personaSeleccionada"
          :guardando="guardando"
          :complementos="complementos"
          :barrios="barrios"
          @guardar="onGuardar"
          @cancelar="cerrarFormulario"
        />

        <!-- Listado -->
        <div v-else>

          <!-- Header -->
          <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                  <Users class="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                    Gestión de Personas
                  </h1>
                  <p class="text-gray-600 mt-1 font-medium">Administra todas las personas del sistema</p>
                </div>
              </div>
              <div class="hidden md:flex items-center space-x-6">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-800">{{ paginacion.total ?? 0 }}</div>
                  <div class="text-sm text-gray-500">Total</div>
                </div>
                <div class="p-2 bg-green-100 rounded-xl">
                  <TrendingUp class="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Filtros -->
          <div class="mt-6">
            <Filtros
              v-model:search="filtros.search"
              v-model:estado="filtros.estado"
              v-model:tipo="filtros.tipo"
              v-model:rol="filtros.rol"
              v-model:tipoProveedor="filtros.tipoProveedor"
              v-model:idCargo="filtros.idCargo"
              v-model:limite="filtros.limite"
              v-model:viewMode="viewMode"
              :roles="roles"
              :tiposProveedor="tiposProveedor"
              :cargos="cargos"
              @update:search="onSearchChange"
              @update:estado="onEstadoChange"
              @update:tipo="onTipoChange"
              @update:rol="onRolChange"
              @update:tipoProveedor="onTipoProveedorChange"
              @update:idCargo="onCargoChange"
              @update:limite="onLimiteChange"
            >
              <template #acciones>
                <button
                  @click="abrirFormularioNuevo"
                  class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <Plus class="h-4 w-4" />
                  Nueva Persona
                </button>
              </template>
            </Filtros>
          </div>

          <!-- Cards / Table -->
          <div class="relative mt-6">
            <Transition name="fade">
              <div v-if="cargando" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
              </div>
            </Transition>

            <div v-if="!cargando && personas.length === 0" class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
              <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users class="h-10 w-10 text-orange-500" />
              </div>
              <h3 class="text-xl font-bold text-gray-700 mb-2">No se encontraron personas</h3>
              <p class="text-gray-500">Intenta cambiar los filtros o registra una nueva persona.</p>
            </div>

            <!-- Cards View -->
            <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <PersonaCard
                v-for="persona in personas"
                :key="persona.idpersona"
                :persona="persona"
                :modo="filtros.tipo"
                @editar="abrirFormularioEditar"
                @toggleEstado="abrirModalConfirmacion"
                @foto="abrirModalFoto"
                @asignarUsuario="abrirModalUsuario"
                @asignarProveedor="abrirModalProveedor"
                @asignarEmpleado="abrirModalEmpleado"
              />
            </div>

            <!-- Table View -->
            <PersonaTable
              v-else
              :personas="personas"
              :modo="filtros.tipo"
              @editar="abrirFormularioEditar"
              @toggleEstado="abrirModalConfirmacion"
              @foto="abrirModalFoto"
              @asignarUsuario="abrirModalUsuario"
              @asignarProveedor="abrirModalProveedor"
              @asignarEmpleado="abrirModalEmpleado"
            />

            <Paginado
              :paginaActual="paginacion.paginaActual"
              :totalPaginas="paginacion.totalPaginas"
              :total="paginacion.total"
              :limite="filtros.limite"
              @update:paginaActual="onCambiarPagina"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Notificación -->
    <Transition name="slide-up">
      <div v-if="notificacion.visible" class="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50">
        <CheckCircle class="h-5 w-5" />
        {{ notificacion.mensaje }}
      </div>
    </Transition>

    <!-- Modal Confirmación -->
    <ModalConfirmacion
      :show="modalConfirmacion.visible"
      :mensaje="modalConfirmacion.accion"
      :nombreUsuario="modalConfirmacion.nombre"
      @confirmar="onConfirmarCambioEstado"
      @cancelar="cerrarModalConfirmacion"
    />

    <!-- Modal: Actualizar Foto -->
    <Transition name="fade">
      <div v-if="modalFoto.visible" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="cerrarModalFoto">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg"><Camera class="h-6 w-6 text-white" /></div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">Actualizar Foto</h3>
              <p class="text-sm text-gray-500">{{ modalFoto.nombre }}</p>
            </div>
          </div>
          <div class="flex justify-center">
            <div class="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden shadow-lg">
              <img v-if="modalFoto.previewUrl" :src="modalFoto.previewUrl" class="w-full h-full object-cover" alt="preview" />
              <User v-else class="h-14 w-14 text-white" />
            </div>
          </div>
          <input type="file" accept="image/*" @change="onFotoSeleccionada"
            class="w-full py-3 px-4 border-0 shadow-md bg-gray-50/80 rounded-2xl text-sm text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
          />
          <div class="flex gap-3">
            <button @click="guardarFoto" :disabled="!modalFoto.archivo || modalFoto.guardando"
              class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl py-3 shadow-lg transition-all flex items-center justify-center gap-2 font-semibold">
              <Save class="h-4 w-4" /> {{ modalFoto.guardando ? 'Guardando...' : 'Guardar' }}
            </button>
            <button @click="cerrarModalFoto" class="flex-1 border border-gray-200 hover:bg-gray-50 rounded-2xl py-3 transition-colors text-gray-600 flex items-center justify-center gap-2">
              <X class="h-4 w-4" /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <RegistrarUsuario_Rol
      :show="modalUsuario.visible"
      :persona="modalUsuario.persona"
      :guardando="modalUsuario.guardando"
      :cargandoRoles="modalUsuario.cargandoRoles"
      :roles="modalUsuario.roles"
      :rolesAsignados="modalUsuario.rolesAsignados"
      @guardar="guardarUsuarioAsignado"
      @cancelar="cerrarModalUsuario"
    />

    <RegistrarProveedorModal
      :show="modalProveedor.visible"
      :persona="modalProveedor.persona"
      :guardando="modalProveedor.guardando"
      :tiposProveedor="tiposProveedor"
      @guardar="guardarProveedorAsignado"
      @cancelar="cerrarModalProveedor"
    />

    <RegistrarEmpleadoModal
      :show="modalEmpleado.visible"
      :persona="modalEmpleado.persona"
      :guardando="modalEmpleado.guardando"
      :cargandoCargos="modalEmpleado.cargandoCargos"
      :cargos="cargos"
      :sucursales="sucursales"
      @guardar="guardarEmpleadoAsignado"
      @cancelar="cerrarModalEmpleado"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { Users, TrendingUp, Plus, CheckCircle, Camera, Truck, Save, X, User, Briefcase } from 'lucide-vue-next';

import { listarPersonas, deletePersona, RegistrarPersona,  UpdatePersona }    from '@/Server/persona.js';
import { deleteEmpleado,updateEmpleado,registrarEmpleado,listarCargo} from '@/Server/Empleado'
import { Listsucursal } from '@/Server/Sucural';
import { DeleteProveedor, RegistrarProveedor, updateProveedor } from '@/Server/Proveedor';
import { DeleteUsuario, RolUsuario, RegistrarUsuario, AgregarPhoto } from '@/Server/Usuario';
import { filtRol, GuardarRolesUsuario }  from '@/Server/rol';
import { listarTipoProveedores }            from '@/Server/Proveedor';
import { listarComplemento }                from '@/Server/Complemento';
import { listarBarrios }                    from '@/Server/api';
import { SubirFoto } from '@/Server/api';
import Filtros           from './Filtros.vue';
import PersonaCard       from './PersonaCard.vue';
import PersonaTable      from './PersonaTable.vue';
import Paginado          from '@/views/Components/Modals/Paginado.vue';
import Registrar         from './Registrar.vue';
import RegistrarUsuario_Rol from './RegistrarUsuario_Rol.vue';
import RegistrarProveedorModal from './RegistrarProveedorModal.vue';
import RegistrarEmpleadoModal from './RegistrarEmpleadoModal.vue';
import ModalConfirmacion from  '@/views/Components/Modals/ModalConfirmacion.vue';

// ── Estado ───────────────────────────────────────────────────────────────────
const cargandoInicial = ref(true);
const cargando        = ref(false);
const guardando       = ref(false);
const modoEdicion     = ref(false);
const personaSeleccionada = ref(null);
const personas        = ref([]);
const viewMode        = ref('cards');

// Listas para filtros y formulario
const roles          = ref([]);
const tiposProveedor = ref([]);
const complementos   = ref([]);
const barrios        = ref([]);
const cargos         = ref([]);
const sucursales     = ref([]);

const paginacion = reactive({ paginaActual: 1, totalPaginas: 1, total: 0 });

const filtros = reactive({
  search: '', estado: '-1', tipo: 'general',
  rol: '', tipoProveedor: '', idCargo: '', limite: 8,
});

const notificacion       = reactive({ visible: false, mensaje: '' });
// tipo: 'persona' | 'usuario' | 'proveedor' | 'empleado' — define qué método se llama al confirmar
const modalConfirmacion  = reactive({ visible: false, nombre: '', accion: '', persona: null, tipo: 'persona' });
const modalFoto          = reactive({ visible: false, nombre: '', persona: null, archivo: null, previewUrl: '', guardando: false });
const modalUsuario       = reactive({
  visible: false,
  nombre: '',
  persona: null,
  roles: [],
  rolesAsignados: [],
  cargandoRoles: false,
  guardando: false,
});
const modalProveedor     = reactive({ visible: false, nombre: '', persona: null, guardando: false });
const modalEmpleado      = reactive({ visible: false, persona: null, guardando: false, cargandoCargos: false });

let debounceTimer = null;

// ── Carga inicial de listas ───────────────────────────────────────────────────
const cargarListas = async () => { 
  try {
    const [resRoles, resTipos, resComp, resBarrios, resCargos, resSucursales] = await Promise.all([
      filtRol(),
      listarTipoProveedores(),
      listarComplemento(),
      listarBarrios(),
      listarCargo(),
      Listsucursal()
    ]);
    roles.value          = resRoles?.data          ?? resRoles          ?? [];
    tiposProveedor.value = resTipos?.data          ?? resTipos          ?? [];
    complementos.value   = resComp?.data           ?? resComp           ?? [];
    barrios.value        = resBarrios?.data        ?? resBarrios        ?? [];
    cargos.value         = resCargos?.result       ?? resCargos?.data   ?? resCargos ?? [];
    sucursales.value     = resSucursales?.data     ?? resSucursales     ?? [];
  } catch (err) {
    console.error('Error al cargar listas:', err);
  }
};

// ── API personas ─────────────────────────────────────────────────────────────
const cargarPersonas = async () => {
  try {
    cargando.value = true;
    const estadoParam = filtros.estado === '-1' ? undefined : filtros.estado;
    const resp = await listarPersonas(
      filtros.search        || undefined,
      estadoParam,
      paginacion.paginaActual,
      filtros.limite,
      filtros.tipo === 'usuario'   ? 1 : undefined,  // usuario=1
      filtros.rol           || undefined,
      filtros.tipo === 'proveedor' ? 1 : undefined,  // proveedor=1
      filtros.tipoProveedor || undefined,
      filtros.tipo === 'empleado'  ? 1 : undefined,   // empleado=1
      filtros.idCargo       || undefined
    );
    personas.value           = resp.data       ?? [];
    paginacion.total         = resp.total       ?? 0;
    paginacion.totalPaginas  = resp.totalPages  ?? resp.totalPaginas
      ?? (personas.value.length === filtros.limite ? paginacion.paginaActual + 1 : paginacion.paginaActual);
  } catch (err) {
    console.error('Error al cargar personas:', err);
    mostrarNotificacion('Error al cargar personas');
  } finally {
    cargando.value        = false;
    cargandoInicial.value = false;
  }
};

// ── Filtros ───────────────────────────────────────────────────────────────────
const onSearchChange = (val) => {
  filtros.search = val;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { paginacion.paginaActual = 1; cargarPersonas(); }, 400);
};
const onEstadoChange       = (val) => { filtros.estado = val;        paginacion.paginaActual = 1; cargarPersonas(); };
const onLimiteChange       = (val) => { filtros.limite = val;        paginacion.paginaActual = 1; cargarPersonas(); };
const onRolChange          = (val) => { filtros.rol = val;           paginacion.paginaActual = 1; cargarPersonas(); };
const onTipoProveedorChange= (val) => { filtros.tipoProveedor = val; paginacion.paginaActual = 1; cargarPersonas(); };
const onCargoChange        = (val) => { filtros.idCargo = val;       paginacion.paginaActual = 1; cargarPersonas(); };
const onTipoChange         = (val) => {
  filtros.tipo = val; filtros.rol = ''; filtros.tipoProveedor = ''; filtros.idCargo = '';
  paginacion.paginaActual = 1; cargarPersonas();
};
const onCambiarPagina = (page) => { paginacion.paginaActual = page; cargarPersonas(); };

// ── Formulario ────────────────────────────────────────────────────────────────
const abrirFormularioNuevo  = () => { personaSeleccionada.value = null; modoEdicion.value = true; };
const abrirFormularioEditar = (p) => { personaSeleccionada.value = { ...p }; modoEdicion.value = true; };
const cerrarFormulario      = () => { modoEdicion.value = false; personaSeleccionada.value = null; };

const onGuardar = async (data) => {
  guardando.value = true;
  try {
    let imageUrl = data.Url ?? '';
    if (data.archivo) {
      imageUrl = await SubirFoto(data.archivo);
    }

    const payload = {
      IdPersona: data.IdPersona,
      Nombre: data.Nombre,
      Tipo: data.Tipo,
      ApellidoPaterno: data.ApellidoPaterno,
      ApellidoMaterno: data.ApellidoMaterno,
      FechaDeNacimiento: data.FechaDeNacimiento,
      IdGenero: data.IdGenero,
      Email: data.Email,
      Url: imageUrl,
      IdDireccion: data.Direccion?.IdDireccion ?? null,
      IdBarrio: data.Direccion?.IdBarrio ?? null,
      Direccion: data.Direccion?.Direccion ?? '',
      Referencia: data.Direccion?.Referencia ?? '',
      Celulares: data.Celulares ?? [],
      Documento: data.Documento ?? [],
      crearEmpleado: data.crearEmpleado,
      crearUsuario: data.crearUsuario,
      crearProveedor: data.crearProveedor,
      IdSucursal: data.IdSucursal,
      Cargos: data.Cargos,
      FechaIngreso: data.FechaIngreso,
      Salario: data.Salario,
      fecha: data.fecha,
      Nit: data.Nit,
      RazonSocial: data.RazonSocial,
      IdTipoProveedor: data.IdTipoProveedor,
      Contrasena: data.Contrasena,
    };

    const respuesta = data.IdPersona
      ? await UpdatePersona(payload)
      : await RegistrarPersona(payload);

    mostrarNotificacion(respuesta?.message ?? (data.IdPersona ? 'Persona actualizada' : 'Persona registrada'));
    cerrarFormulario();
    await cargarPersonas();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar');
  } finally {
    guardando.value = false;
  }
};

// ── Modal confirmación ────────────────────────────────────────────────────────
const abrirModalConfirmacion = (p) => {
  modalConfirmacion.persona = p;
  modalConfirmacion.nombre  = `${p.nombre} ${p.apellidopaterno}`;

  // Determinar qué se activa/desactiva según el tipo de filtro activo
  if (filtros.tipo === 'usuario' && p.usuario) {
    modalConfirmacion.tipo   = 'usuario';
    modalConfirmacion.accion = p.usuario.estado === 1 ? 'Desactivar al usuario' : 'Activar al usuario';
  } else if (filtros.tipo === 'proveedor' && p.proveedor) {
    modalConfirmacion.tipo   = 'proveedor';
    modalConfirmacion.accion = p.proveedor.estado === 1 ? 'Desactivar al proveedor' : 'Activar al proveedor';
  } else if (filtros.tipo === 'empleado' && p.empleado) {
    modalConfirmacion.tipo   = 'empleado';
    modalConfirmacion.accion = p.empleado.estado === 1 ? 'Desactivar al empleado' : 'Activar al empleado';
  } else {
    modalConfirmacion.tipo   = 'persona';
    modalConfirmacion.accion = p.estado === 1 ? 'Desactivar al cliente' : 'Activar al cliente';
  }

  modalConfirmacion.visible = true;
};

const cerrarModalConfirmacion = () => {
  modalConfirmacion.visible = false;
  modalConfirmacion.persona = null;
  modalConfirmacion.tipo    = 'persona';
};

const onConfirmarCambioEstado = async () => {
  const p    = modalConfirmacion.persona;
  const tipo = modalConfirmacion.tipo;
  cerrarModalConfirmacion();
  if (!p) return;
  try {
    let resp;
    if (tipo === 'usuario' && p.usuario?.idusuario) {
      resp = await DeleteUsuario(p.usuario.idusuario);
    } else if (tipo === 'proveedor' && p.proveedor?.idproveedor) {
      resp = await DeleteProveedor(p.proveedor.idproveedor);
    } else if (tipo === 'empleado' && p.empleado?.idempleado) {
      resp = await deleteEmpleado(p.empleado.idempleado);
    } else {
      resp = await deletePersona(p.idpersona);
    }
    mostrarNotificacion(resp?.message ?? 'Estado actualizado');
    await cargarPersonas();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al cambiar el estado');
  }
};

// ── Modal Foto ────────────────────────────────────────────────────────────────
const abrirModalFoto = (p) => {
  Object.assign(modalFoto, { visible: true, persona: p, nombre: `${p.nombre} ${p.apellidopaterno}`, archivo: null, previewUrl: p.imagen ?? '', guardando: false });
};
const cerrarModalFoto    = () => { Object.assign(modalFoto, { visible: false, persona: null, archivo: null, previewUrl: '', guardando: false }); };
const onFotoSeleccionada = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  modalFoto.archivo = file;
  modalFoto.previewUrl = URL.createObjectURL(file);
};
const guardarFoto = async () => {
  if (!modalFoto.archivo) return;
  try {
    modalFoto.guardando = true;
    const idPersona = modalFoto.persona?.idpersona ?? modalFoto.persona?.IdPersona;
    if (!idPersona) {
      throw new Error('No se encontró el id de la persona.');
    }

    const imageUrl = await SubirFoto(modalFoto.archivo);
    await AgregarPhoto(idPersona, imageUrl);

    mostrarNotificacion('Foto actualizada correctamente');
    cerrarModalFoto();
    await cargarPersonas();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al actualizar la foto');
  } finally {
    modalFoto.guardando = false;
  }
};

// ── Modal Usuario ─────────────────────────────────────────────────────────────
const abrirModalUsuario = (p) => {
  const nombre = `${p.nombre ?? ''} ${p.apellidopaterno ?? ''}`.trim();
  Object.assign(modalUsuario, {
    visible: true,
    persona: p,
    nombre,
    roles: roles.value,
    rolesAsignados: [],
    cargandoRoles: true,
    guardando: false,
  });

  cargarRolesUsuario(p);
};

const cargarRolesUsuario = async (persona) => {
  try {
    if (roles.value.length) {
      modalUsuario.roles = roles.value;
    } else {
      const respuestaRoles = await filtRol();
      modalUsuario.roles = respuestaRoles?.data ?? respuestaRoles ?? [];
    }

    const idUsuario = persona?.usuario?.idusuario ?? persona?.usuario?.IdUsuario;
    if (!idUsuario) {
      modalUsuario.rolesAsignados = [];
      return;
    }

    const respuesta = await RolUsuario(idUsuario);
    modalUsuario.rolesAsignados = respuesta?.Roles ?? respuesta?.roles ?? [];
  } catch (err) {
    console.error(err);
    modalUsuario.rolesAsignados = [];
    mostrarNotificacion('Error al cargar los roles del usuario');
  } finally {
    modalUsuario.cargandoRoles = false;
  }
};

const cerrarModalUsuario = () => {
  Object.assign(modalUsuario, {
    visible: false,
    nombre: '',
    persona: null,
    roles: [],
    rolesAsignados: [],
    cargandoRoles: false,
    guardando: false,
  });
};

const obtenerIdUsuarioRespuesta = (respuesta) =>
  respuesta?.IdUsuario
  ?? respuesta?.idusuario
  ?? respuesta?.Usuario?.IdUsuario
  ?? respuesta?.Usuario?.idusuario
  ?? respuesta?.data?.IdUsuario
  ?? respuesta?.data?.idusuario
  ?? null;

const obtenerIdUsuarioDesdeListado = async (idPersona) => {
  await cargarPersonas();
  const personaActualizada = personas.value.find((persona) =>
    (persona?.idpersona ?? persona?.IdPersona) === idPersona
  );

  return personaActualizada?.usuario?.idusuario
    ?? personaActualizada?.usuario?.IdUsuario
    ?? null;
};

const guardarUsuarioAsignado = async (payload) => {
  if (!payload?.Roles?.length && !payload?.RolesAEliminar?.length) return;

  modalUsuario.guardando = true;
  try {
    let idUsuario = payload.IdUsuario;

    if (!idUsuario) {
      const respuesta = await RegistrarUsuario({
        IdPersona: payload.IdPersona,
        Contrasena: payload.Contrasena,
      });

      idUsuario = obtenerIdUsuarioRespuesta(respuesta);

      if (!idUsuario) {
        idUsuario = await obtenerIdUsuarioDesdeListado(payload.IdPersona);
      }

      if (!idUsuario) {
        throw new Error('No se pudo recuperar el IdUsuario creado.');
      }
    }

    await GuardarRolesUsuario({
      IdUsuario: idUsuario,
      RolesAsignar: payload.Roles ?? [],
      RolesQuitar: payload.RolesAEliminar ?? [],
    });

    const mensaje = !payload.IdUsuario
      ? 'Usuario creado y roles actualizados correctamente'
      : 'Roles actualizados correctamente';

    mostrarNotificacion(mensaje);
    cerrarModalUsuario();
    await cargarPersonas();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar el usuario y sus roles');
  } finally {
    modalUsuario.guardando = false;
  }
};

// ── Modal Proveedor ───────────────────────────────────────────────────────────
const abrirModalProveedor = (p) => {
  Object.assign(modalProveedor, { visible: true, persona: p, nombre: `${p.nombre} ${p.apellidopaterno}`, guardando: false });
};
const cerrarModalProveedor     = () => { Object.assign(modalProveedor, { visible: false, persona: null, nombre: '', guardando: false }); };
const guardarProveedorAsignado = async (payload) => {
  if (!payload?.IdPersona) return;

  modalProveedor.guardando = true;
  try {
    const respuesta = payload.IdProveedor
      ? await updateProveedor(payload)
      : await RegistrarProveedor(payload);

    mostrarNotificacion(respuesta?.message ?? (payload.IdProveedor ? 'Proveedor actualizado correctamente' : 'Proveedor registrado correctamente'));
    cerrarModalProveedor();
    await cargarPersonas();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar the proveedor');
  } finally {
    modalProveedor.guardando = false;
  }
};

// ── Modal Empleado ────────────────────────────────────────────────────────────
const abrirModalEmpleado = (p) => {
  Object.assign(modalEmpleado, { visible: true, persona: p, guardando: false, cargandoCargos: false });
};
const cerrarModalEmpleado = () => {
  Object.assign(modalEmpleado, { visible: false, persona: null, guardando: false });
};
const guardarEmpleadoAsignado = async (payload) => {
  modalEmpleado.guardando = true;
  try {
    const respuesta = payload.id
      ? await updateEmpleado(payload)
      : await registrarEmpleado(payload);

    mostrarNotificacion(respuesta?.message ?? (payload.id ? 'Empleado actualizado correctamente' : 'Empleado registrado correctamente'));
    cerrarModalEmpleado();
    await cargarPersonas();
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Error al guardar el empleado');
  } finally {
    modalEmpleado.guardando = false;
  }
};

// ── Utilidades ────────────────────────────────────────────────────────────────
const mostrarNotificacion = (mensaje) => {
  notificacion.mensaje = mensaje; notificacion.visible = true;
  setTimeout(() => { notificacion.visible = false; }, 3000);
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await cargarListas();
  await cargarPersonas();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(16px); }
</style>
