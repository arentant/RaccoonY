import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import HexMap from "./HexMap";
import Image from "next/image";
import Header from "../Header";
import { useSettingsState } from "@/context/realmContext";
import { useCallback } from "react";

const HomePage = () => {

    return (
        <div className={`flex flex-col items-center gap-3 h-screen w-full relative`}>
            <Component />
        </div>
    );
}

const Component = () => {
    const { address, chain } = useAccount()
    const { switchChainAsync } = useSwitchChain()
    const { chainId } = useSettingsState()
    const switchNetwork = useCallback(async () => {
        try {
            await switchChainAsync({ chainId: chainId })

        } catch (e) {
            console.log(e)
        }
    }, [switchChainAsync, chainId])

    if (address && chain && chain?.id != chainId) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3">
                <Image src={"/logo.png"} alt={"logo"} width={500} height={500} />
                <button onClick={switchNetwork} className="px-5 py-2.5 text-xl mt-2 bg-accent-foreground rounded-xl text-accent active:scale-90 hover:brightness-90 duration-100 transition-all">
                    Switch chain
                </button>
            </div>
        )
    }

    return <>
        {
            address ?
                <>
                    <div className="w-full">
                        <Header />
                    </div>
                    <HexMap />
                </>
                :
                <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Image src={"/logo.png"} alt={"logo"} width={500} height={500} />
                    <ConnectButton />
                </div>
        }
    </>
}

export default HomePage;