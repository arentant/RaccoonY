import { FC, useEffect, useState } from "react"
import { createPublicClient, erc20Abi, http } from "viem"
import { useAccount, useSwitchChain } from "wagmi"
import Image from "next/image"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "../../shadcn/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import BuyGold from "./BuyGold"
import { currency } from "@/lib/contracts"

const GoldBalance: FC = () => {

    const [loading, setLoading] = useState<boolean>(false)
    const [balance, setBalance] = useState<number | null>(null)

    const { data: chain } = useSwitchChain()
    const { address } = useAccount()
    const publicClient = createPublicClient({
        chain,
        transport: http('https://eth-sepolia.public.blastapi.io/')
    })

    useEffect(() => {

        (async () => {
            try {

                setLoading(true)
                const balance = await publicClient.readContract({
                    address: currency.contract as `0x${string}`,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [address as `0x${string}`]
                })

                const resolvedBalance = {
                    network: chain?.id,
                    token: currency.symbol,
                    amount: Number(balance),
                    request_time: new Date().toJSON(),
                    decimals: currency.decimals,
                }

                setBalance(resolvedBalance.amount)

            }
            catch (e) {
                console.log(e)
            }
            finally {
                setLoading(false)
            }
        })()


    }, [address, chain, publicClient])


    return (
        <div className="flex items-center gap-3 bg-yellow-600/90 pl-3 rounded-xl">
            <Dialog>
                <DialogTrigger className="bg-yellow-500/90 p-1 rounded-lg">
                    <Plus className="h-5 w-5" />
                </DialogTrigger>
              
                <DialogContent>
                <DialogTitle>
                    Buy Gold
                </DialogTitle>
                    <BuyGold/>
                </DialogContent>
            </Dialog>
            <div className="flex items-center gap-1 p-2 py-1.5 bg-yellow-600/90 rounded-xl border-2 border-yellow-500 w-fit">
                <Image src={'/assets/raccoonyGold.png'} height={20} width={20} alt="RaccoonY_Gold" className="h-6 w-6" />
                <p><span>Gold:</span> {loading ? <span className="h-5 w-10 border-slate-500 animate-pulse" /> : <span>{balance?.toLocaleString()}</span>}</p>
            </div>
        </div>
    )

}

export default GoldBalance