import { Chain, erc20Abi, http } from 'viem'
import { multicall } from '@wagmi/core'
import { createConfig, useSwitchChain } from 'wagmi'
import formatAmount from '@/lib/formatAmount'
import { useEffect, useState } from 'react'

const Balances = () => {

    const { data: chain } = useSwitchChain()
    const [balances, setBalances] = useState<ERC20Balance[] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        (async () => {
            if (!chain) return
            try {
                setLoading(true)
                const res = await getErc20Balances({
                    address: '',
                    assets: [],
                    chain: chain
                })

                if (res) {
                    const contractBalances = await resolveERC20Balances(res, [], chain)
                    setBalances(contractBalances)
                }
            } catch (e) {
                console.log(e)
            } finally {
                setLoading(false)
            }

        })()
    }, [chain])


    return (
        <div>
            <h1>Balances</h1>
            {loading && <p>Loading...</p>}
            {balances && balances.map(b => (
                <div key={b.token}>
                    <p>{b.token}: {b.amount}</p>
                </div>
            ))}
        </div>
    )
}


const resolveERC20Balances = async (
    multicallRes: ERC20ContractRes[],
    assets: { name: string, contract: string, symbol: string, decimals: number }[],
    chain: Chain
): Promise<ERC20Balance[]> => {

    const contractBalances = multicallRes?.map((d, index) => {
        const currency = assets[index]
        return {
            chainId: chain.id,
            token: currency.symbol,
            amount: formatAmount(d.result, currency.decimals),
            request_time: new Date().toJSON(),
            decimals: currency.decimals,
        }
    })
    return contractBalances
}


const getErc20Balances = async ({
    address,
    chain,
    assets,
}: { address: string, chain: Chain, assets: { name: string, contract: string }[] }): Promise<ERC20ContractRes[] | null> => {

    const contracts = assets?.filter(a => a.contract).map(a => ({
        address: a?.contract as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
    }))

    try {
        const config = createConfig({
            chains: [chain],
            transports: {
                [chain.id]: http()
            }
        })

        const contractRes = await multicall(config, {
            chainId: chain.id,
            contracts: contracts
        })
        return contractRes

    }
    catch (e) {
        console.log(e)
        return null;
    }

}

type ERC20ContractRes = ({
    error: Error;
    result?: undefined | null;
    status: "failure";
} | {
    error?: undefined | null;
    result: unknown;
    status: "success";
})

type ERC20Balance = {
    chainId: string | number,
    token: string,
    amount: number,
    request_time: string,
    decimals: number,
}


export default Balances;