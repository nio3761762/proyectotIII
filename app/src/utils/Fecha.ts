export const getFechaBolivia = (): string => {
  const now = new Date();

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
};

export const getHoraBolivia = (): string => {
  const now = new Date();

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);
};

export const getFechaHoraBolivia = () => {
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

  const get = (type: string) =>
    partes.find(p => p.type === type)?.value ?? '';

  const fechaStr = `${get('year')}-${get('month')}-${get('day')}`;
  const hora = `${get('hour')}:${get('minute')}:${get('second')}`;

  return {
    fecha: new Date(`${fechaStr}T00:00:00`),
    hora
  };
};
export const parseFechaLocal = (fechaStr: string): Date => {
  if (!fechaStr) {
    throw new Error("Fecha requerida");
  }

  const [year, month, day] = fechaStr.split('-').map(Number);

  return new Date(year, month - 1, day);
};