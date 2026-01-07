export const secondMs = 1000;
export const minuteMs = secondMs * 60;
export const hourMs = minuteMs * 60;
export const dayMs = hourMs * 24;
export const halfYearMs = dayMs * 30 * 6;

export const epochStartDate = new Date(0);
export const epochStartDateStr = epochStartDate.toUTCString(); // 'Thu, 01 Jan 1970 00:00:00 UTC';
