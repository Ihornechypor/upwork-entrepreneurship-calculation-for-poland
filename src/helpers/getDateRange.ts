import { differenceInDays, endOfYear, startOfYear } from 'date-fns';
import { minusDay, minusMonth, reformatDate, toDateType } from '.';
import { API_DATE_FORMAT, MAX_API_DATE_RANGE, MAX_MINUS_DAYS, MAX_MINUS_MONTH } from '../consts';
import { RateItem } from '../types';

export const getDateRange = (rate: RateItem[]) => {
  const dateStart = rate[0].formatedDate;
  const dateEnd = rate[rate.length - 1].formatedDate;
  const dateDiffernse = differenceInDays(toDateType(dateEnd, API_DATE_FORMAT), toDateType(dateStart, API_DATE_FORMAT));

  if (MAX_API_DATE_RANGE < dateDiffernse) {
    return [
      {
        dateStart: reformatDate(minusDay(dateStart, MAX_MINUS_DAYS, API_DATE_FORMAT), API_DATE_FORMAT),
        dateEnd: reformatDate(endOfYear(toDateType(dateStart, API_DATE_FORMAT)), API_DATE_FORMAT),
      },
      {
        dateStart: reformatDate(startOfYear(toDateType(dateEnd, API_DATE_FORMAT)), API_DATE_FORMAT),
        dateEnd: dateEnd,
      },
    ];
  } else {
    return [
      {
        dateStart: reformatDate(minusDay(dateStart, MAX_MINUS_DAYS, API_DATE_FORMAT), API_DATE_FORMAT),
        dateEnd,
      },
    ];
  }
};
