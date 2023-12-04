import { useEffect } from 'react';

export const useMaunted = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, []);
};
