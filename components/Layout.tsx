import { ReactNode } from "react";
import RainbowKit from "./RainbowKit";

const Layout = ({ children }: { children: ReactNode }) => {

    return (
        <main>
            <RainbowKit>
                {children}
            </RainbowKit>
        </main>
    )

}

export default Layout;