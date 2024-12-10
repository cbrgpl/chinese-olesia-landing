const normalizeDate = (date: string | number | Date): Date => {
  if (date instanceof Date) {
    return date;
  }

  return new Date(date);
};

type UDateFormattingVariants = 'date' | 'datetime' | 'time';
export const formatDate = (date: string | number | Date, variant: UDateFormattingVariants) => {
  const normalizedDate = normalizeDate(date);

  if (variant === 'date') {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
    }).format(normalizedDate);
  } else if (variant === 'datetime') {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(normalizedDate);
  }

  return new Intl.DateTimeFormat('ru-RU', {
    timeStyle: 'short',
  }).format(normalizedDate);
};
