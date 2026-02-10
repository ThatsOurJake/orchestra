import { type ReactElement, useState } from 'react';
import { RouterContext } from './context';

interface RouterProps {
  children: ReactElement | ReactElement[];
}

export const Router = ({ children }: RouterProps) => {
  const [currentLocation, setCurrentLocation] = useState<string>('/');

  return (
    <RouterContext.Provider
      value={{
        location: currentLocation,
        navigate(path) {
          setCurrentLocation(path);
        },
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};
