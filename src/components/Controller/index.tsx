import { useState, useEffect } from 'react';
import { getCurrecyRate } from '../../api/getCurrecyRate';
import { subDays, parse } from 'date-fns';
import Papa from 'papaparse';
import { reformatDate, updateSubDays, calculateLocalAmounts } from '../../helpers';
import { API_DATE_FORMAT, CSV_DATE_FORMAT } from '../../consts';
import { RateItem, ApiDataItem, CsvData } from '../../types';
import { ResultTable } from '../ResultTable';
import { ResultTotal } from '../ResultTotal';

const Controller = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [rate, setRate] = useState<RateItem[]>([]);
  const [apiData, setApiData] = useState<ApiDataItem[]>([]);
  const [totalData, setTotalData] = useState({
    amountOfIncum: 0,
    amountOfCosts: 0,
    amountOfCostsWithVat: 0,
    ammountOfFeeOfVat: 0,
    ammoutClear: 0,
    ammoutClearAndVat: 0,
  });
  // csv
  const [csvData, setCsvData] = useState<string>('');

  const fetchData = async (formatedDate: string): Promise<void> => {
    let currentDate = formatedDate;
    let retryCount = 0;
    while (retryCount < 6) {
      try {
        const data = await getCurrecyRate(currentDate, formatedDate);
        if (data && data.formatedDate) {
          setApiData((prev) => [...prev, data]);
          break;
        } else {
          console.error('Empty or invalid API response');
        }
      } catch (error) {
        const subDay = subDays(parse(currentDate, API_DATE_FORMAT, new Date()), 1);

        currentDate = reformatDate(subDay, API_DATE_FORMAT);
        retryCount += 1;
      }
    }
  };

  const handleDate = (date: string): string => {
    const prevDate = updateSubDays(date, 1, CSV_DATE_FORMAT);
    const dateForApi = reformatDate(prevDate, API_DATE_FORMAT);

    fetchData(dateForApi);

    return dateForApi;
  };

  useEffect(() => {
    if (hasMounted) {
      const onlyPayments = rate.filter(
        (item) => item.type === 'Fixed Price' || item.type === 'Hourly' || item.type === 'Bonus',
      );

      const ifAdditionalCosts = rate
        .filter((item) => item.type === 'Membership Fee' || item.type === 'Withdrawal Fee')
        .reduce((acc, currentValue) => acc + currentValue.amountLocal, 0);

      const amountOfIncum = onlyPayments.reduce((acc, currentValue) => acc + currentValue.amountLocal, 0);
      const amountOfCosts =
        rate.reduce((acc, currentValue) => acc + currentValue.amountFeeLocal, 0) + ifAdditionalCosts;
      const amountOfCostsWithVat = rate.reduce(
        (acc, currentValue) => acc + currentValue.amountFeeLocal + currentValue.amountFeeVat,
        0 + ifAdditionalCosts,
      );

      const ammountOfFeeOfVat = rate.reduce((acc, currentValue) => acc + currentValue.amountFeeVat, 0);

      const ammoutClear = amountOfIncum + amountOfCosts;
      const ammoutClearAndVat = amountOfIncum + amountOfCostsWithVat;

      setTotalData({
        amountOfIncum,
        amountOfCosts,
        amountOfCostsWithVat,
        ammountOfFeeOfVat,
        ammoutClear,
        ammoutClearAndVat,
      });
    } else {
      setHasMounted(true);
    }
  }, [rate, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      if (apiData.length === rate.length) {
        const sortedByDays = [...apiData].sort(
          (a, b) =>
            parse(b.formatedDate, API_DATE_FORMAT, new Date()).getTime() -
            parse(a.formatedDate, API_DATE_FORMAT, new Date()).getTime(),
        );
        const compairedArray = rate.map((item, index) => {
          const currentDate = parse(sortedByDays[index].formatedDate, API_DATE_FORMAT, new Date());
          const amount = item.amount;
          const currecyRate = sortedByDays[index].currecyRate;
          const type = item.type;

          if (currentDate && !isNaN(amount) && !isNaN(currecyRate)) {
            return {
              ...item,
              ...sortedByDays[index],
              ...calculateLocalAmounts(amount, currecyRate, type),
            };
          } else {
            console.error('Invalid data for calculation:', item, sortedByDays[index]);
            return item;
          }
        });

        setRate(compairedArray);
      }
    } else {
      setHasMounted(true);
    }
  }, [apiData]);

  const handleReset = () => {
    setRate([]);
    setApiData([]);
    console.clear();
  };

  const handleCsvInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setCsvData(() => e.target.value);

  const parseCSVToArray = () => {
    try {
      Papa.parse<CsvData>(csvData, {
        complete: (result) => {
          const flArr = result.data.filter(
            (item) =>
              item.Type === 'Fixed Price' ||
              item.Type === 'Hourly' ||
              item.Type === 'Bonus' ||
              item.Type === 'Membership Fee' ||
              item.Type === 'Miscellaneous' ||
              item.Type === 'Withdrawal Fee',
          );

          const filteredArray = flArr.map((obj) => ({
            initialDate: obj.Date,
            type: obj.Type,
            description: obj.Description,
            formatedDate: handleDate(obj.Date),
            amount: Number(obj.Amount),
            amountFee: 0,
            amountLocal: 0,
            amountFeeLocal: 0,
            amountFeeVat: 0,
            currecyDate: '',
            currecyRate: 0,
          }));

          setRate(filteredArray);
        },
        header: true,
        transformHeader: function (h) {
          return h.trim();
        },
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
    }
  };

  return (
    <>
      <p>
        Currency: <br />
      </p>
      <br />
      <textarea value={csvData} onChange={handleCsvInputChange} placeholder="Paste CSV data here" rows={5} cols={50} />
      <br />
      <button onClick={parseCSVToArray}>Load csv</button>
      <button onClick={handleReset}>Reset List</button>
      <ResultTable rate={rate} />
      <ResultTotal totalData={totalData} />
    </>
  );
};

export default Controller;
