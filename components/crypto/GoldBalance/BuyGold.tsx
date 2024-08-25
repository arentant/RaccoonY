import { Loader } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useAccount, useConfig, useSwitchChain } from "wagmi";
import { getBalance, writeContract } from "wagmi/actions";
import LandfieldABI from "../../../lib/abis/LanfieldABI.json";
import { parseEther } from 'viem'
import { worldContract } from "@/lib/contracts";
import { formatAmount } from "@/lib/utils";

const BuyGold: FC = () => {
    const config = useConfig()

    const [loading, setLoading] = useState<boolean>(false)
    const [balance, setBalance] = useState<number | null>(null)
    const { data: chain } = useSwitchChain()
    const { address } = useAccount()
    const [amount, setAmount] = useState<string>('')

    useEffect(() => {

        (async () => {
            try {

                if (!chain || !address) return

                setLoading(true)
            
                const res = await getBalance(config, {
                    address,
                    chainId: chain?.id,
                })
                setBalance(formatAmount(res.value, 18))

            }
            catch (e) {
                console.log(e)
            }
            finally {
                setLoading(false)
            }
        })()

    }, [address, chain, config])

    const buyGold = async () => {

        if (!address || !amount) return

        try {
            setLoading(true)

            await writeContract(config, {
                account: address,
                address: worldContract,
                abi: LandfieldABI,
                value: parseEther(amount),
                functionName: 'buyGold',
            })

        }
        catch (e) {
            console.log(e)
        }
        finally {
            setLoading(false)
        }

    }

    return (
        <div className="flex flex-col gap-2">
            <p>
                1 ETH = 100000 Gold
            </p>
            <input
                className="border border-slate-600 bg-slate-400 p-2 rounded-lg"
                type="string"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <button className="px-4 p-2 font-semibold text-lg bg-yellow-600 rounded-lg w-fit" disabled={!amount} onClick={buyGold}> {loading ? <Loader className="h-4 w-4 animate-spin" /> : 'Buy'}</button>
        </div>
    );
}

export default BuyGold;