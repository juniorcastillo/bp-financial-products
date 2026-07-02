export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addOneYear(dateValue: string): string {
  const [year, month, day] = dateValue.split('-').map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return '';
  }

  const nextYear = year + 1;
  const lastDayOfTargetMonth = new Date(nextYear, month, 0).getDate();
  const safeDay = Math.min(day, lastDayOfTargetMonth);

  return toIsoDate(new Date(nextYear, month - 1, safeDay));
}