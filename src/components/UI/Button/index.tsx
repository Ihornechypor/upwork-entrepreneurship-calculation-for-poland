import { ReactNode } from 'react';
import * as Styled from './Button.styles';
interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ children, onClick, disabled }: ButtonProps) => {
  return (
    <Styled.Button onClick={onClick} disabled={disabled}>
      {children}
    </Styled.Button>
  );
};
