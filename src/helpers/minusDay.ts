import { subDays } from 'date-fns';
import { toDateType } from '.';

export const minusDay = (date: string, day: number, type: string) => subDays(toDateType(date, type), day);
