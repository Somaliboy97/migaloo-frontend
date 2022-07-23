import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

export type TokenInfo = {
  id: string
  chain_id: string
  token_address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  tags: string[]
  denom: string
  native: boolean
}

export type TokenInfoWithReward = TokenInfo & {
  rewards_address: string
}

export type PoolEntityType = {
  pool_id: string
  pool_assets: [TokenInfo, TokenInfo]
  swap_address: string
  staking_address: string
  rewards_tokens: Array<TokenInfoWithReward>
}

type PoolsListQueryResponse = {
  base_token: TokenInfo
  pools: Array<PoolEntityType>
  poolsById: Record<string, PoolEntityType>
  name: string
  logoURI: string
  keywords: Array<string>
  tags: Record<string, { name: string; description: string }>
}

export const usePoolsListQuery = (options?: Parameters<typeof useQuery>[1]) => {
  const { chainId } = useRecoilValue(walletState)


  return useQuery<PoolsListQueryResponse>(
    ['@pools-list', chainId],
    async () => {
      const response = await fetch(`${chainId}/${process.env.NEXT_PUBLIC_POOLS_LIST_URL}`)
      const tokenList = await response.json()

      return {
        ...tokenList,
        poolsById: tokenList.pools.reduce(
          (poolsById, pool) => ((poolsById[pool.pool_id] = pool), poolsById),
          {}
        ),
      }
    },
    Object.assign(
      {
        enabled: !!chainId,
        refetchOnMount: false,
      },
      options || {}
    )
  )
}

export const usePoolFromListQueryById = ({ poolId }: { poolId: string }) => {
  const { data: poolListResponse, isLoading } = usePoolsListQuery()
  return [poolListResponse?.poolsById[poolId], isLoading] as const
}
