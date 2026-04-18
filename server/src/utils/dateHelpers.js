export const dayAbbrev = (dateInput) => {
  const d = new Date(dateInput);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
};

export const startOfTravelDay = (dateStr) => {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0, 0));
};

export const endOfTravelDay = (dateStr) => {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day, 23, 59, 59, 999));
};
