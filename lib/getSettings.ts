import LandfieldABI from "@/lib/abis/LanfieldABI.json";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export async function getServerSideProps(context: any) {

    context.res.setHeader(
        'Cache-Control',
        's-maxage=60, stale-while-revalidate'
    );

    const contract = context.query.contract
    const chainId = Number(context.query.chainId)

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
    })
    const contractsData = await publicClient.readContract({
        address: contract,
        abi: LandfieldABI,
        functionName: 'getContracts',
    })
    const contracts = contractsData as { buildingContracts: `0x${string}`[], goldContract: `0x${string}`, castleContract: `0x${string}`, resourceContracts: `0x${string}`[] }

    const settings = {
        chainId,
        contract,
        goldContract: contracts.goldContract || null,
        castleContract: contracts.castleContract || null,
    }

    return {
        props: { settings }
    }
}