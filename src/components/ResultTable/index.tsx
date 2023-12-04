import { RateItem } from '../../types';
import * as Styled from './ResultTable.styles';
export const ResultTable = ({ rate }: { rate: RateItem[] }) => {
  return (
    <Styled.ResultTable>
      <thead>
        <tr>
          <th>CSV Date:</th>
          <th>Description:</th>
          <th>Formated Date:</th>
          <th>Currency Date:</th>
          <th>Currency Rate:</th>
          <th>Amount in USD:</th>
          <th>Amount fee in USD:</th>
          <th>Amount in PLN:</th>
          <th>Amount Fee in PLN:</th>
          <th>Amount Fee VAT in PLN:</th>
        </tr>
      </thead>
      <tbody>
        {rate.map((item, index) => (
          <tr key={index}>
            <td>{item.initialDate}</td>
            <td style={{ width: 200 }}>{item.description}</td>
            <td>{item.formatedDate}</td>
            <td>{item.currecyDate}</td>
            <td>{item.currecyRate}</td>
            <td>{item.amount}</td>
            <td>{item.amountFee}</td>
            <td>{item.amountLocal}</td>
            <td>{item.amountFeeLocal}</td>
            <td>{item.amountFeeVat}</td>
          </tr>
        ))}
      </tbody>
    </Styled.ResultTable>
  );
};
