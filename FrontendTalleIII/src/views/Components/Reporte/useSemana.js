import { ref } from 'vue';

const DEFAULT_WEEKDAY = 1;

const toISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const defaultInicio = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() - DEFAULT_WEEKDAY + 7) % 7));
  return toISO(monday);
};

const inicioSemana = ref(defaultInicio());

const useInicioSemana = () => inicioSemana;

const setInicioSemana = (fecha) => {
  inicioSemana.value = fecha || '';
};

const getAnchorWeekday = () => {
  if (!inicioSemana.value) return DEFAULT_WEEKDAY;
  const d = new Date(inicioSemana.value + 'T12:00:00');
  return isNaN(d.getTime()) ? DEFAULT_WEEKDAY : d.getDay();
};

const getWeekStart = (dateStr) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'Sin fecha') return dateStr;
  const clean = String(dateStr).split('T')[0];
  const d = new Date(clean + 'T12:00:00');
  if (isNaN(d.getTime())) return clean;
  const offset = getAnchorWeekday();
  const diff = (d.getDay() - offset + 7) % 7;
  d.setDate(d.getDate() - diff);
  return toISO(d);
};

const fmt = (date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const getWeekLabel = (weekStartStr) => {
  if (!weekStartStr || weekStartStr === 'N/A' || weekStartStr === 'Sin fecha') return weekStartStr;
  const d = new Date(String(weekStartStr).split('T')[0] + 'T12:00:00');
  if (isNaN(d.getTime())) return weekStartStr;
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  return `${fmt(d)} - ${fmt(end)}`;
};

export { useInicioSemana, setInicioSemana, getAnchorWeekday, getWeekStart, getWeekLabel };