import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Balances from "./crypto/Balances";
import { useAccount } from "wagmi";
import GoldBalance from "./crypto/GoldBalance";

const Header = () => {

    return (
        <header className="flex justify-between items-center p-3">
            <Image src='/logoSmall.png' alt={"raccoonySmall"} width={100} height={100} className="h-20 w-auto" />
        

            <div className="flex flex-col justify-end sm:flex-row items-center gap-3 ">
                <GoldBalance />
                <ConnectButton showBalance={false} />
            </div>
        </header>
    );
}

export default Header;