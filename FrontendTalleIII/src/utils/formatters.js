export const formatTimeAgo = (dateString, timeString) => {
  // Check for null or undefined inputs
  if (!dateString || !timeString) {
    return 'fecha inválida';
  }

  // Primary attempt: ISO 8601 format YYYY-MM-DDTHH:MM:SS
  let activityDateTime = new Date(`${dateString}T${timeString}`);

  // Fallback: If dateString is already a full timestamp (e.g., from new Date().toISOString())
  if (isNaN(activityDateTime.getTime())) {
    activityDateTime = new Date(dateString);
  }

  // If still invalid, we cannot proceed.
  if (isNaN(activityDateTime.getTime())) {
    console.error("Could not parse date:", dateString, timeString);
    return "fecha inválida";
  }

  const now = new Date();
  // Get difference in seconds. getTime() returns UTC milliseconds.
  const diffInSeconds = Math.floor((now.getTime() - activityDateTime.getTime()) / 1000);

  if (diffInSeconds < 5) {
    return 'ahora mismo';
  }

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  if (years > 0) return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
  if (months > 0) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  if (days > 0) return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  if (hours > 0) return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  if (minutes > 0) return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  return `hace unos segundos`;
};