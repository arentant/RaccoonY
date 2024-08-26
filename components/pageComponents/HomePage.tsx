import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import HexMap from "./HexMap";
import Image from "next/image";
import Header from "../Header";

const HomePage = () => {
    const { address } = useAccount()

    return (
        <div className={`flex flex-col items-center gap-3 h-screen w-full relative`}>
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
        </div>
    );
}

export default HomePage;