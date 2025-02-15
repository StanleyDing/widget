import type { QueryClientProviderProps } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';
import { Fragment } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, useInRouterContext } from 'react-router-dom';
import { i18n } from './i18n';
import type { WidgetConfig } from '.';
import { queryClient } from './config/queryClient';
import {
  SDKProvider,
  SwapFormProvider,
  TelemetryProvider,
  ThemeProvider,
  WalletProvider,
  WidgetProvider,
} from './providers';
import type { WidgetProps } from './types';

const QueryProvider = QueryClientProvider as FC<
  PropsWithChildren<QueryClientProviderProps>
>;

export const AppProvider: React.FC<PropsWithChildren<WidgetProps>> = ({
  children,
  config,
}) => {
  return (
    <QueryProvider client={queryClient}>
      <WidgetProvider config={config}>
        <SDKProvider>
          <TelemetryProvider>
            <SwapFormProvider>
              <ThemeProvider>
                <WalletProvider>
                  <I18nextProvider i18n={i18n}>
                    <AppRouter>{children}</AppRouter>
                  </I18nextProvider>
                </WalletProvider>
              </ThemeProvider>
            </SwapFormProvider>
          </TelemetryProvider>
        </SDKProvider>
      </WidgetProvider>
    </QueryProvider>
  );
};

export const AppRouter: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const inRouterContext = useInRouterContext();
  const Router = inRouterContext ? Fragment : MemoryRouter;
  return <Router>{children}</Router>;
};
