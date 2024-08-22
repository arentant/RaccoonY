import { darkTheme, getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { arbitrumSepolia, optimismSepolia, sepolia } from "viem/chains";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();
const RainbowKit = ({ children }: { children: ReactNode }) => {

    const config = getDefaultConfig({
        appName: 'RaccoonY',
        projectId: '6113382c2e587bff00e2b5c3d68531f3',
        chains: [sepolia, arbitrumSepolia, optimismSepolia],
        ssr: true, // If your dApp uses server side rendering (SSR)
    });

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()} modalSize="compact">
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default RainbowKit;