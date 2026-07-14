import { defineStore } from 'pinia';
import {
  listarUsuarios,
  DeleteUsuario,
  RegistrarUsuario,
  updateUsuario
} from '@/Server/Usuario';
import { listarRoles, updateRolUsuario, AsignarRolUsuario } from '@/Server/rol';
import { listarDocumento, listarEmail, listarNumero, listarComplemento } from '@/Server/Complemento';
import { listarBarrios } from '@/Server/api';

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    usuarios: [],
    rolesDisponibles: [],
    emails: [],
    documentos: [],
    numeros: [],
    barrios: [],
    complementos: [],
    loading: false,
    error: null,
    filtros: { nombre: "", rol: "Todos", estado: "Todos" },
    paginaActual: 1,
    itemsPerPage: 6,
    formDependenciesLoaded: false,
  }),

  getters: {
    usuariosActivos: (state) => state.usuarios.filter(u => u.Estado.IdEstado === 1).length,

    usuariosFiltrados(state) {
      let items = state.usuarios;
      if (state.filtros.nombre) {
        const nombreLower = state.filtros.nombre.toLowerCase();
        items = items.filter(u => (u.Persona.Nombre.toLowerCase() + " " + u.Persona.ApellidoPaterno.toLowerCase()).includes(nombreLower));
      }
      if (state.filtros.rol !== 'Todos') {
        items = items.filter(u => u.Rolusuario[0]?.Rol.Nombre === state.filtros.rol);
      }
      if (state.filtros.estado !== 'Todos') {
        const estadoId = state.filtros.estado === 'Activo' ? 1 : 2;
        items = items.filter(u => u.Estado.IdEstado === estadoId);
      }
      return items;
    },

    totalPaginas(state) {
      return Math.ceil(this.usuariosFiltrados.length / state.itemsPerPage);
    },

    usuariosPaginados(state) {
      const start = (state.paginaActual - 1) * state.itemsPerPage;
      const end = start + state.itemsPerPage;
      return this.usuariosFiltrados.slice(start, end);
    },

    paginacionInfo(state) {
      const total = this.usuariosFiltrados.length;
      const inicio = total === 0 ? 0 : (state.paginaActual - 1) * state.itemsPerPage + 1;
      const fin = Math.min(inicio + state.itemsPerPage - 1, total);
      return `Mostrando ${inicio}-${fin} de ${total} usuarios`;
    },
  },

  actions: {
    async fetchAllData() {
      this.loading = true;
      this.error = null;
      try {
        const [usuariosData, rolesData, documentosData, emailsData, numerosData] = await Promise.all([
          listarUsuarios(),
          listarRoles().then(roles => [{ IdRol: "ROL-0", Nombre: "Todos" }, ...roles]),
          listarDocumento(),
          listarEmail(),
          listarNumero(),
        ]);
        this.usuarios = usuariosData;
        this.rolesDisponibles = rolesData;
        this.documentos = documentosData;
        this.emails = emailsData;
        this.numeros = numerosData;

      } catch (error) {
        this.error = 'Error al cargar datos iniciales.';
        console.error('Error en fetchAllData:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchFormDependencies() {
      if (this.formDependenciesLoaded) return;

      this.loading = true;
      this.error = null;
      try {
        const [barriosData] = await Promise.all([
          listarBarrios()
        ]);
        this.barrios = barriosData;
        this.formDependenciesLoaded = true;
      } catch (error) {
        this.error = 'Error al cargar las dependencias del formulario.';
        console.error('Error en fetchFormDependencies:', error);
      } finally {
        this.loading = false;
      }
    },

    async guardarUsuario(datoUsuario) {
      this.loading = true;
      this.error = null;
      try {
        const esNuevo = !datoUsuario.IdUsuario;
        const response = esNuevo ? await RegistrarUsuario(datoUsuario) : await updateUsuario(datoUsuario);
        await this.fetchAllData();
        return response.message;
      } catch (error) {
        this.error = 'Error al guardar el usuario.';
        console.error('Error en guardarUsuario:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cambiarEstadoUsuario(idUsuario) {
      const usuarioIndex = this.usuarios.findIndex(u => u.IdUsuario === idUsuario);
      if (usuarioIndex === -1) return;

      const usuario = this.usuarios[usuarioIndex];
      const originalEstado = { ...usuario.Estado };
      const nuevoEstadoId = originalEstado.IdEstado === 1 ? 2 : 1;

      // Optimistic update
      this.usuarios[usuarioIndex].Estado = { ...originalEstado, IdEstado: nuevoEstadoId };

      try {
        const response = await DeleteUsuario(idUsuario);
        // The optimistic update is already done. We can optionally refresh just this user
        // but for now, we will rely on the optimistic update.
        return response.message;
      } catch (error) {
        // Revert on error
        this.usuarios[usuarioIndex].Estado = originalEstado;
        this.error = 'Error al cambiar el estado del usuario.';
        console.error('Error en cambiarEstadoUsuario:', error);
        throw error;
      }
    },

    async guardarRolUsuario(idUsuario, idRol, tieneRol) {
      this.loading = true;
      this.error = null;
      try {
        const data = { IdUsuario: idUsuario, IdRol: idRol };
        const response = tieneRol ? await updateRolUsuario(data) : await AsignarRolUsuario(data);

        const usuarioIndex = this.usuarios.findIndex(u => u.IdUsuario === idUsuario);
        if (usuarioIndex !== -1) {
          const nuevoRol = this.rolesDisponibles.find(r => r.IdRol === idRol);
          if (nuevoRol) {
            const usuarioActualizado = { ...this.usuarios[usuarioIndex] };
            if (!usuarioActualizado.Rolusuario || usuarioActualizado.Rolusuario.length === 0) {
              usuarioActualizado.Rolusuario = [{ Rol: nuevoRol }];
            } else {
              usuarioActualizado.Rolusuario[0].Rol = nuevoRol;
            }
            this.usuarios[usuarioIndex] = usuarioActualizado;
          }
        }
        return response.message;
      } catch (error) {
        this.error = 'Error al asignar el rol.';
        console.error('Error en guardarRolUsuario:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setFiltros(nuevosFiltros) {
      this.filtros = nuevosFiltros;
      this.paginaActual = 1;
    },

    setPaginaActual(pagina) {
      this.paginaActual = pagina;
    }
  }
});