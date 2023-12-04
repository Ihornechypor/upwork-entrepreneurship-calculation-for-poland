import { parse } from 'date-fns';

export const toDateType = (date: string, type: string) => parse(date, type, new Date());
