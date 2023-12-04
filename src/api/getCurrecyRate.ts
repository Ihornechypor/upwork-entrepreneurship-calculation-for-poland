export const getCurrecyRate = async (dateStart: string, dateEnd: string) => {
  try {
    const rsp = await fetch(`https://api.nbp.pl/api/exchangerates/rates/a/usd/${dateStart}/${dateEnd}/?format=json`);
    const data = await rsp.json();
    return data.rates;
  } catch (error) {
    console.error('Error making API call:', error);
    throw error;
  }
};
