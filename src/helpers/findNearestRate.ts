import { ApiRates } from '../types';

export const findNearestRate = (
  ratesMap: Map<string, ApiRates>,
  targetDate: string,
): ApiRates | Record<string, never> => {
  const allDates = Array.from(ratesMap.keys());
  const datesBeforeTarget = allDates.filter((date) => new Date(date) < new Date(targetDate));

  if (datesBeforeTarget.length === 0) {
    // If there are no dates before the target date, return an empty object or handle it accordingly
    return {};
  }

  const nearestDate = datesBeforeTarget.reduce((a, b) =>
    Math.abs(new Date(b).getTime() - new Date(targetDate).getTime()) <
    Math.abs(new Date(a).getTime() - new Date(targetDate).getTime())
      ? b
      : a,
  );

  return ratesMap.get(nearestDate) || {};
};
