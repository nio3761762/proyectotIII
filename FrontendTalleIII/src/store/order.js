import { defineStore } from 'pinia';
import { ref } from 'vue';
import { registrarPago } from '../Server/Pago.js';

export const useAppStore = defineStore('app', {
  state: () => ({
    Url:"",
    Fecha: "",
    IdPEdido:"",
    IdSucursal:""
  }),
  actions: {
     setUrl(nuevo) {
      this.Url = nuevo
    },
    setFecha(nuevo) {
      this.Fecha = nuevo
    },
     setPedido(nuevo) {
      this.IdPEdido = nuevo
    },
     setSucursal(nuevo) {
      this.IdSucursal = nuevo
    }
  }
})