const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getDate()} ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

export interface TimeRemaining {
  totalMs: number;
  isExpired: boolean;
  label: string;
}

export function getTimeRemaining(expiresAtIso: string): TimeRemaining {
  const totalMs = new Date(expiresAtIso).getTime() - Date.now();

  if (totalMs <= 0) {
    return { totalMs: 0, isExpired: true, label: 'Предложение истекло' };
  }

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return { totalMs, isExpired: false, label: `Осталось ${days} дн.` };
  }
  if (hours > 0) {
    return { totalMs, isExpired: false, label: `Осталось ${hours} ч ${minutes} мин` };
  }
  return { totalMs, isExpired: false, label: `Осталось ${minutes} мин` };
}
