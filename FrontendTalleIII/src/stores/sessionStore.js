import { defineStore } from 'pinia';
import { RolUsuario, SucursalUsuario } from '@/Server/Usuario';
import { Listarmenusrol } from '@/Server/rol';

export const useSessionStore = defineStore('session', {
  state: () => ({
    usuario: null,
    roles: [],
    rolSeleccionado: null,
    menus: [],
    loading: false,
    error: null
  }),

  actions: {
    async cargarUsuarioYRoles(idUsuario) {
      if (!idUsuario) return;
      this.loading = true;
      try {
        const response = await RolUsuario(idUsuario);
        this.usuario = response;
        
        let rolesEncontrados = [];
        if (response?.Roles) {
          rolesEncontrados = response.Roles;
        } else if (response?.usuario?.Rolusuario) {
          rolesEncontrados = response.usuario.Rolusuario.map(ru => ru.Rol);
        } else if (response?.Rolusuario) {
          rolesEncontrados = response.Rolusuario.map(ru => ru.Rol);
        }

        this.roles = rolesEncontrados;

        if (this.roles.length > 0) {
          const savedRoleId = localStorage.getItem('selectedRoleId');
          const foundRole = this.roles.find(r => r.IdRol === savedRoleId);
          
          if (foundRole) {
            await this.seleccionarRol(foundRole);
          } else {
            await this.seleccionarRol(this.roles[0]);
          }
        }
      } catch (err) {
        this.error = 'Error al cargar roles del usuario';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async seleccionarRol(rol) {
      if (!rol) return;
      this.rolSeleccionado = rol;
      localStorage.setItem('selectedRoleId', rol.IdRol);
      this.loading = true;
      try {
        const menusData = await Listarmenusrol(rol.IdRol);
        this.menus = menusData || [];
        localStorage.setItem('userMenus', JSON.stringify(this.menus));
      } catch (err) {
        this.error = 'Error al cargar menús del rol';
        console.error(err);
        this.menus = [];
      } finally {
        this.loading = false;
      }
    },
    async SucursalDelUsuario(idUsuario) {

    },

    resetSession() {
      this.usuario = null;
      this.roles = [];
      this.rolSeleccionado = null;
      this.menus = [];
      this.error = null;
      localStorage.removeItem('selectedRoleId');
      localStorage.removeItem('userMenus');
      localStorage.removeItem('usuario');
    }
  }
});
