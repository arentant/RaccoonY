import React, { FC } from "react";
import { useAccount, useConfig } from "wagmi";
import { writeContract } from "wagmi/actions";
import { Loader, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { haveOwner, shortenAddress } from "@/lib/utils";
import LandfieldABI from "@/lib/abis/LanfieldABI.json";
import { buildingResolver, terrainResolver } from "./Resolvers";
import { Tile } from "./HexMap";


const TileDetails: FC<{ landfield: Tile | undefined, landfieldIndex: number }> = ({ landfield, landfieldIndex }) => {
    const [loading, setLoading] = React.useState(false);
    const config = useConfig()
    const { address } = useAccount()

    const isOwnerMe = landfield?.owner?.toLowerCase() === address?.toLowerCase()

    const setRecipe = async () => {
        if (!address) return

        try {
            setLoading(true)

            // await writeContract(config, {
            //     account: address,
            //     address: worldContract,
            //     abi: LandfieldABI,
            //     args: [landfieldIndex, resourcesContracts[0].contract],
            //     functionName: 'setRecipe',
            // })

        }
        catch (e) {
            console.log(e)
        }
        finally {
            setLoading(false)
        }
    }

    const Item = ({ children }: { children: React.JSX.Element | React.JSX.Element[] }) => {
        return (
            <div className="flex items-center justify-between w-full">
                {children}
            </div>
        )
    }

    if (!landfield)
        return (
            <div className="w-64 h-44 flex flex-col justify-center items-center">
                <Loader2 className="animate-spin h-12 w-12" />
            </div >
        )

    return (
        <div className="flex flex-col gap-3 h-full px-3 py-3 min-w-64 justify-between">
            <div>
                {/* {
                    landfield.type === 'landfield' &&
                    <Item>
                        <div className="text-sm font-medium text-gray-200">Owner</div>
                        <Link href={''} target="_blank" className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{shortenAddress(landfield.owner)}</Link>
                    </Item>
                } */}

                <Item>
                    <div className="text-sm font-medium text-gray-200">Terrain</div>
                    <div className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{terrainResolver(landfield.terrainType)}</div>
                </Item>
                {/* {
                    landfield.type === 'landfield' && !haveOwner(landfield.owner) &&
                    <Item>
                        <div className="text-sm font-medium text-gray-200">Price</div>
                        <div className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{landfield.price}</div>
                    </Item>
                } */}
                <Item>
                    <div className="text-sm font-medium text-gray-200">Coordinates</div>
                    <div className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
                        <span>X:</span> <span>{landfield.x}</span>, <span>Y:</span> <span>{landfield.y}</span>
                    </div>
                </Item>

            </div>

            {/* {
                !isOwnerMe && landfield.type === 'landfield' &&
                <button disabled={loading} onClick={buyLandfield} className="px-4 py-1 text-sm font-semibold bg-yellow-600 rounded-md w-fit flex items-center gap-2 disabled:opacity-80">{loading ? <Loader className='h-4 w-4 animate-spin' /> : <Wallet className="w-4 h-4" />} <span>{(!(haveOwner(landfield.owner)) ? 'Buy' : 'Cry')}</span></button>
            } */}

            {
                isOwnerMe &&
                <button disabled={loading} onClick={setRecipe} className="px-4 py-1 text-sm font-semibold bg-yellow-600 rounded-md w-fit flex items-center gap-2 disabled:opacity-80">{loading ? <Loader className='h-4 w-4 animate-spin' /> : <Wallet className="w-4 h-4" />} <span>Set recipe</span></button>
            }

        </div>
    )
}

export default TileDetails;