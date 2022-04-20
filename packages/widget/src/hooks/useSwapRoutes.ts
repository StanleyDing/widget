import { useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useDebouncedWatch, useToken } from '.';
import { LiFi } from '../lifi';
import { SwapFormKey } from '../providers/SwapFormProvider';
import { useWallet } from '../providers/WalletProvider';

export const useSwapRoutes = () => {
  const { account } = useWallet();
  const [
    fromChainId,
    fromTokenAddress,
    toChainId,
    toTokenAddress,
    slippage,
    enabledBridges,
    enabledExchanges,
  ] = useWatch({
    name: [
      SwapFormKey.FromChain,
      SwapFormKey.FromToken,
      SwapFormKey.ToChain,
      SwapFormKey.ToToken,
      SwapFormKey.Slippage,
      SwapFormKey.EnabledBridges,
      SwapFormKey.EnabledExchanges,
    ],
  });
  const [fromTokenAmount] = useDebouncedWatch([SwapFormKey.FromAmount], 500);
  const { token } = useToken(fromChainId, fromTokenAddress);
  const isEnabled =
    Boolean(account.address) &&
    !isNaN(fromChainId) &&
    !isNaN(toChainId) &&
    Boolean(fromTokenAddress) &&
    Boolean(toTokenAddress) &&
    Boolean(fromTokenAmount) &&
    !isNaN(fromTokenAmount) &&
    !isNaN(slippage);

  const { data, isFetched, isLoading, status, fetchStatus } = useQuery(
    [
      'routes',
      account.address,
      fromChainId,
      fromTokenAddress,
      fromTokenAmount,
      toChainId,
      toTokenAddress,
      slippage,
      enabledBridges,
      enabledExchanges,
    ],
    async ({
      queryKey: [
        _,
        address,
        fromChainId,
        fromTokenAddress,
        fromTokenAmount,
        toChainId,
        toTokenAddress,
        slippage,
        enabledBridges,
        enabledExchanges,
      ],
    }) => {
      return LiFi.getRoutes({
        fromChainId,
        // TODO: simplify
        fromAmount: (
          Number(fromTokenAmount) *
          10 ** (token?.decimals ?? 0)
        ).toFixed(0), // new BigNumber(depositAmount).shiftedBy(fromToken.decimals).toFixed(0),
        fromTokenAddress,
        toChainId,
        toTokenAddress,
        fromAddress: address,
        toAddress: address,
        options: {
          slippage: slippage / 100,
          bridges: {
            allow: enabledBridges,
          },
          exchanges: {
            allow: enabledExchanges,
          },
        },
      });
    },
    {
      enabled: isEnabled,
      refetchIntervalInBackground: true,
      refetchInterval: 30_000,
      staleTime: 30_000,
      // TODO: probably should be removed
      cacheTime: 30_000,
    },
  );

  return {
    routes: data?.routes,
    isLoading: isEnabled && isLoading,
    isFetched,
    status,
    fetchStatus,
  };
};
