import { createContext, useState, useContext } from "react";

type Error = {
  title?: string;
  description?: string;
};

type ErrorProviderState = {
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
};

const initialState: ErrorProviderState = {
  error: {} as Error,
  setError: () => null,
};

const ErrorProviderContext = createContext<ErrorProviderState>(initialState);

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<Error | undefined>(() => {
    return undefined;
  });

  const value = {
    error,
    setError: (error: Error | undefined) => {
      if (!error) {
        setError(undefined);
        return;
      }
      setError(error);
    },
  };

  return (
    <ErrorProviderContext.Provider value={value}>
      {children}
    </ErrorProviderContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorProviderContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

export default ErrorProviderContext;
