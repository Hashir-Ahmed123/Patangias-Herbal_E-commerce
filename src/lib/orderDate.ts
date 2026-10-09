import { Timestamp } from 'firebase/firestore';

export type OrderDateValue = string | number | Date | Timestamp | null | undefined;

export const parseOrderDate = (value: OrderDateValue): Date | null => {
  if (value instanceof Timestamp) return value.toDate();
  if (value === null || value === undefined) return null;

  const parsedDate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const formatOrderDateTime = (value: OrderDateValue): string => {
  const parsedDate = parseOrderDate(value);
  if (!parsedDate) return 'Date unavailable';

  const formattedDate = new Intl.DateTimeFormat('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Karachi',
  }).format(parsedDate);

  return `${formattedDate} PKT`;
};