/* eslint-disable consistent-return */
import type { EVMChain, Route, Token } from '@lifi/sdk';
import { useQuery } from '@tanstack/react-query';
import Big from 'big.js';
import { useChains } from '.';
import { useWallet } from '../providers';
import { isRouteCompleted } from '../stores';
import { useTokenBalance } from './useTokenBalance';

export interface GasSufficiency {
  gasAmount: Big;
  tokenAmount?: Big;
  insufficientAmount?: Big;
  insufficient?: boolean;
  token: Token;
  chain?: EVMChain;
}

const refetchInterval = 30_000;

export const useGasSufficiency = (route?: Route) => {
  const { account } = useWallet();
  const { getChainById } = useChains();
  const { token: fromToken, getTokenBalancesWithRetry } = useTokenBalance(
    route?.fromToken,
  );

  const { data: insufficientGas, isInitialLoading: insufficientGasLoading } =
    useQuery(
      ['gas-sufficiency-check', account.address, route?.id],
      async () => {
        if (!account.address || !route) {
          return null;
        }
        const gasCosts = route.steps
          .filter((step) => !step.execution || step.execution.status !== 'DONE')
          .reduce((groupedGasCosts, step) => {
            if (step.estimate.gasCosts) {
              const { token } = step.estimate.gasCosts[0];
              const gasCostAmount = step.estimate.gasCosts
                .reduce(
                  (amount, gasCost) => amount.plus(Big(gasCost.amount || 0)),
                  Big(0),
                )
                .div(10 ** token.decimals);
              const groupedGasCost = groupedGasCosts[token.chainId];
              const gasAmount = groupedGasCost
                ? groupedGasCost.gasAmount.plus(gasCostAmount)
                : gasCostAmount;
              groupedGasCosts[token.chainId] = {
                gasAmount,
                tokenAmount: gasAmount,
                token,
              };
              return groupedGasCosts;
            }
            return groupedGasCosts;
          }, {} as Record<number, GasSufficiency>);

        if (
          route.fromToken.address === gasCosts[route.fromChainId]?.token.address
        ) {
          gasCosts[route.fromChainId].tokenAmount = gasCosts[
            route.fromChainId
          ]?.gasAmount.plus(
            Big(route.fromAmount).div(10 ** route.fromToken.decimals),
          );
        }

        const tokenBalances = await getTokenBalancesWithRetry(
          account.address,
          Object.values(gasCosts).map((item) => item.token),
        );

        if (!tokenBalances?.length) {
          return null;
        }

        [route.fromChainId, route.toChainId].forEach((chainId) => {
          if (gasCosts[chainId]) {
            const gasTokenBalance = Big(
              tokenBalances?.find(
                (t) =>
                  t.chainId === gasCosts[chainId].token.chainId &&
                  t.address === gasCosts[chainId].token.address,
              )?.amount ?? 0,
            );

            const insufficient =
              gasTokenBalance.lte(0) ||
              gasTokenBalance.lt(gasCosts[chainId].gasAmount ?? Big(0)) ||
              gasTokenBalance.lt(gasCosts[chainId].tokenAmount ?? Big(0));

            const insufficientAmount = insufficient
              ? gasCosts[chainId].tokenAmount?.minus(gasTokenBalance) ??
                gasCosts[chainId].gasAmount.minus(gasTokenBalance)
              : undefined;

            gasCosts[chainId] = {
              ...gasCosts[chainId],
              insufficient,
              insufficientAmount: insufficientAmount?.round(5, Big.roundUp),
              chain: insufficient ? getChainById(chainId) : undefined,
            };
          }
        });

        const gasCostResult = Object.values(gasCosts).filter(
          (gasCost) => gasCost.insufficient,
        );

        return gasCostResult;
      },
      {
        enabled: Boolean(account.address && route),
        refetchIntervalInBackground: true,
        refetchInterval,
        staleTime: refetchInterval,
        cacheTime: refetchInterval,
      },
    );

  const {
    data: insufficientFunds,
    isInitialLoading: insufficientFundsLoading,
  } = useQuery(
    ['funds-sufficiency-check', account.address, route?.id],
    async () => {
      if (!account.address || !fromToken || !route || isRouteCompleted(route)) {
        return null;
      }
      let currentTokenBalance = Big(fromToken?.amount ?? 0);
      const currentAction = route.steps.filter(
        (step) => !step.execution || step.execution.status !== 'DONE',
      )[0]?.action;

      if (
        fromToken.chainId === currentAction.fromToken.chainId &&
        fromToken.address === currentAction.fromToken.address &&
        currentTokenBalance.gt(0)
      ) {
        const insufficientFunds = Big(route.fromAmount)
          .div(10 ** route.fromToken.decimals)
          .gt(currentTokenBalance);
        return insufficientFunds;
      }

      const tokenBalances = await getTokenBalancesWithRetry(account.address, [
        currentAction.fromToken,
      ]);

      currentTokenBalance = Big(tokenBalances?.[0]?.amount ?? 0);
      const insufficientFunds = Big(currentAction.fromAmount)
        .div(10 ** currentAction.fromToken.decimals)
        .gt(currentTokenBalance);
      return insufficientFunds;
    },
    {
      enabled: Boolean(account.address && route && fromToken),
      refetchIntervalInBackground: true,
      refetchInterval,
      staleTime: refetchInterval,
      cacheTime: refetchInterval,
    },
  );

  return {
    insufficientGas,
    insufficientFunds,
    isLoading: insufficientGasLoading || insufficientFundsLoading,
  };
};
