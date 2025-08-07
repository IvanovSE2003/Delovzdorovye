export enum ITimeZones {
  KALININGRAD = 0,      // Калининград (-1 МСК)
  MOSCOW = 1,            // Москва
  SAMARA = 2,            // Самара (+1 МСК)
  EKATERINBURG = 3,      // Екатеринбург (+2 МСК)
  OMSK = 4,              // Омск (+3 МСК)
  KRASNOYARSK = 5,       // Красноярск (+4 МСК)
  IRKUTSK = 6,           // Иркутск (+5 МСК)
  YAKUTSK = 7,           // Якутск (+6 МСК)
  VLADIVOSTOK = 8,       // Владивосток (+7 МСК)
  MAGADAN = 9,           // Магадан (+8 МСК)
  KAMCHATKA = 10         // Камчатский край (+9 МСК)
}

// Объект для получения названия по значению enum
export const TimeZoneLabels: Record<ITimeZones, string> = {
  [ITimeZones.KALININGRAD]: 'Калининград (-1 МСК)',
  [ITimeZones.MOSCOW]: 'Москва',
  [ITimeZones.SAMARA]: 'Самара (+1 МСК)',
  [ITimeZones.EKATERINBURG]: 'Екатеринбург (+2 МСК)',
  [ITimeZones.OMSK]: 'Омск (+3 МСК)',
  [ITimeZones.KRASNOYARSK]: 'Красноярск (+4 МСК)',
  [ITimeZones.IRKUTSK]: 'Иркутск (+5 МСК)',
  [ITimeZones.YAKUTSK]: 'Якутск (+6 МСК)',
  [ITimeZones.VLADIVOSTOK]: 'Владивосток (+7 МСК)',
  [ITimeZones.MAGADAN]: 'Магадан (+8 МСК)',
  [ITimeZones.KAMCHATKA]: 'Камчатский край (+9 МСК)',
};

// Тип для значений временных зон
export type TimeZoneValue = keyof typeof TimeZoneLabels;

// Функция для получения названия по значению
export function getTimeZoneLabel(value: ITimeZones): string {
  return TimeZoneLabels[value] || 'Неизвестная зона';
}