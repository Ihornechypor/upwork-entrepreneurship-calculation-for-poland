import { useState, useEffect } from 'react';
import { getCurrecyRate } from '../../api/getCurrecyRate';
import Papa from 'papaparse';
import { reformatDate, minusDay, getDateRange, calculateLocalAmounts, findNearestRate } from '../../helpers';
import { API_DATE_FORMAT, CSV_DATE_FORMAT } from '../../consts';
import { RateItem, CsvData, ApiRates } from '../../types';
import { ResultTable } from '../ResultTable';
import { ResultTotal } from '../ResultTotal';
import { Button, ErrorMsg } from '../UI';

const Controller = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<RateItem[]>([]);
  const [rates, setRates] = useState<RateItem[]>([]);
  const [totalData, setTotalData] = useState({
    amountOfIncum: 0,
    amountOfCosts: 0,
    amountOfCostsWithVat: 0,
    ammountOfFeeOfVat: 0,
    ammoutClear: 0,
    ammoutClearAndVat: 0,
  });
  const [apiRates, setApiRate] = useState<ApiRates[]>([{ effectiveDate: '', mid: 0 }]);
  const [csvData, setCsvData] = useState<string>('');

  const handleDate = (date: string): string => {
    const prevDate = minusDay(date, 1, CSV_DATE_FORMAT);
    const dateForApi = reformatDate(prevDate, API_DATE_FORMAT);
    return dateForApi;
  };

  const getRatesRange = async (dateStart: string, dateEnd: string) => {
    try {
      const rates = await getCurrecyRate(dateStart, dateEnd);
      setApiRate((prev) => [...prev, ...rates]);
    } catch (error) {
      setError(`Error to fetch api:${error}`);
    }
  };

  const handleReset = () => {
    setInitialData([]);
    setRates([]);
    setApiRate([]);
    setDataFetched(false);
    setError('');
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
              item.Type === 'Withdrawal Fee',
          );

          const filteredArray = flArr
            .map((obj) => ({
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
            }))
            .reverse();
          setInitialData(filteredArray);
        },
        header: true,
        transformHeader: function (h) {
          return h.trim();
        },
      });
    } catch (error) {
      setError(`Error parsing CSV:${error}`);
      console.error('Error parsing CSV:', error);
    }
  };

  // calculate data
  useEffect(() => {
    if (apiRates && dataFetched) {
      const ratesMap = new Map(apiRates.map((item) => [item.effectiveDate, item]));

      const mergedArray = initialData.map((item) => {
        const formattedDate = item.formatedDate;
        const rateObject = ratesMap.get(formattedDate) || findNearestRate(ratesMap, formattedDate);
        const rate = rateObject.mid;
        const currecyDate = rateObject.effectiveDate;

        return {
          ...item,
          currecyDate,
          currecyRate: rate,
          ...calculateLocalAmounts(item.amount, rate, item.type),
        };
      });

      setRates((prev) => [
        ...prev,
        ...mergedArray.map((item) => ({
          ...item,
          currecyDate: String(item.currecyDate),
        })),
      ]);
    }
  }, [apiRates, dataFetched]);

  useEffect(() => {
    const fetchData = async () => {
      if (initialData.length !== 0) {
        for (const item of getDateRange(initialData)) {
          await getRatesRange(item.dateStart, item.dateEnd);
        }
        setDataFetched(true);
      }
    };

    fetchData();
  }, [initialData]);

  // calculate total
  useEffect(() => {
    if (hasMounted) {
      const onlyPayments = rates.filter(
        (item) => item.type === 'Fixed Price' || item.type === 'Hourly' || item.type === 'Bonus',
      );

      const ifAdditionalCosts = rates
        .filter((item) => item.type === 'Membership Fee' || item.type === 'Withdrawal Fee')
        .reduce((acc, currentValue) => acc + currentValue.amountLocal, 0);

      const amountOfIncum = onlyPayments.reduce((acc, currentValue) => acc + currentValue.amountLocal, 0);

      const amountOfCosts =
        rates.reduce((acc, currentValue) => acc + currentValue.amountFeeLocal, 0) + ifAdditionalCosts;
      const amountOfCostsWithVat = rates.reduce(
        (acc, currentValue) => acc + currentValue.amountFeeLocal + currentValue.amountFeeVat,
        0 + ifAdditionalCosts,
      );

      const ammountOfFeeOfVat = rates.reduce((acc, currentValue) => acc + currentValue.amountFeeVat, 0);

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
  }, [rates]);

  return (
    <>
      <textarea value={csvData} onChange={handleCsvInputChange} placeholder="Paste CSV data here" rows={5} cols={50} />

      <div>
        <Button onClick={parseCSVToArray} disabled={dataFetched}>
          Load csv
        </Button>
        &nbsp;
        <Button onClick={handleReset} disabled={!dataFetched}>
          Reset Data
        </Button>
      </div>
      {error ? <ErrorMsg>{error}</ErrorMsg> : null}
      {dataFetched ? (
        <>
          <ResultTotal totalData={totalData} />
          <ResultTable rate={rates} />
        </>
      ) : null}
    </>
  );
};

export default Controller;
