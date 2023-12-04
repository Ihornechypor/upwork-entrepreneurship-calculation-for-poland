import { ReactNode } from 'react';
import * as Styled from './ErrorMsg.styles';
interface ButtonProps {
  children: ReactNode;
}

export const ErrorMsg = ({ children }: ButtonProps) => {
  return <Styled.ErrorMsg>{children}</Styled.ErrorMsg>;
};
