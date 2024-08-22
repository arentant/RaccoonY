import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Balances from "./crypto/Balances";
import { useAccount } from "wagmi";

const Header = () => {

    const { address } = useAccount()

    return (
        <header className="flex justify-between items-center p-3">
            <Image src='/logoSmall.png' alt={"raccoonySmall"} width={100} height={100} className="h-20 w-auto" />
            {
                address && <Balances />
            }
            <ConnectButton />
        </header>
    );
}

export default Header;