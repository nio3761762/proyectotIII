"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFechaLocal = exports.getFechaHoraBolivia = exports.getHoraBolivia = exports.getFechaBolivia = void 0;
const getFechaBolivia = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);
};
exports.getFechaBolivia = getFechaBolivia;
const getHoraBolivia = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/La_Paz',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(now);
};
exports.getHoraBolivia = getHoraBolivia;
const getFechaHoraBolivia = () => {
    const zona = 'America/La_Paz';
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: zona,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(new Date());
    const get = (type) => partes.find(p => p.type === type)?.value ?? '';
    const fechaStr = `${get('year')}-${get('month')}-${get('day')}`;
    const hora = `${get('hour')}:${get('minute')}:${get('second')}`;
    return {
        fecha: new Date(`${fechaStr}T00:00:00`),
        hora
    };
};
exports.getFechaHoraBolivia = getFechaHoraBolivia;
const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) {
        throw new Error("Fecha requerida");
    }
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};
exports.parseFechaLocal = parseFechaLocal;
