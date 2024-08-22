import React, { FC, useEffect } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent
} from "@/components/shadcn/dialog"
import { useAccount, useConfig, useSwitchChain } from "wagmi";
import { readContract, writeContract } from "wagmi/actions";
import { Loader, Loader2 } from "lucide-react";
import Link from "next/link";
import { shortenAddress } from "@/lib/utils";
import LandfieldABI from "@/lib/abis/LanfieldABI.json";

const r = 100;

const Hex = ({ landfields, x, y, side, isActive, account, onClick, ...props }: { landfields: Landfield[], x: number, y: number, side: string, isActive: boolean, account: string, onClick: () => void }) => {
    const landfield = landfields.find((t: any) => t.x === x && t.y === y);
    const terrain = landfield?.type === 'landfield' ? terrainResolver(landfield?.terrainType) : null

    const building = landfield?.type === 'building' ? buildingResolver(landfield?.buildingType) : null

    const all = building || terrain || 'deepWater';

    const isVilian = (landfield?.owner && landfield?.owner !== '0x0000000000000000000000000000000000000000') && all !== 'deepWater' && landfield?.owner !== account
    const isMine = (landfield?.owner && landfield?.owner !== '0x0000000000000000000000000000000000000000' && all !== 'deepWater') && landfield?.owner === account

    const src = (landfield?.owner && landfield?.owner !== '0x0000000000000000000000000000000000000000') ? `/assets/${all}/${all}${isVilian ? 'Enemy' : 'My'}.png` : `/assets/${all}/${all}.png`;

    return (
        <div
            {...props}
            className={`relative ${side}`}
            style={{
                border: "1px solid #000",
                boxSizing: "border-box",
                height: `${r}px`,
                width: `${r}px`,
                position: "relative",
                borderRadius: "100%"
            }}
        >
            <div
                style={{
                    borderTop: "1px solid #000",
                    borderBottom: "1px solid #000",
                    boxSizing: "border-box",
                    width: 100 / Math.sqrt(3) + "px",
                    height: "100%",
                    margin: "0 auto",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: "rotate(90deg)"
                }}
            />
            <div
                style={{
                    borderTop: "1px solid #000",
                    borderBottom: "1px solid #000",
                    boxSizing: "border-box",
                    width: 100 / Math.sqrt(3) + "px",
                    height: "100%",
                    margin: "0 auto",
                    transform: "rotate(150deg)",
                    transformOrigin: "center center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0
                }}
            />
            <div
                style={{
                    borderTop: "1px solid #000",
                    borderBottom: "1px solid #000",
                    boxSizing: "border-box",
                    width: 100 / Math.sqrt(3) + "px",
                    height: "100%",
                    margin: "0 auto",
                    transform: "rotate(210deg)",
                    transformOrigin: "center center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0
                }}
            />
            <Image src={src} alt="hexTile" width={10000} height={10000} className={`absolute -bottom-2 hover:bottom-0 hover:brightness-110 transform transition-all duration-200 hover:cursor-pointer ${isActive && 'bottom-0'} ${(isMine || isVilian) && '-bottom-1'}`} />
        </div>
    );
};

function createBoard(height?: number | undefined, width?: number | undefined) {
    let rosLengthList = [];

    height = height || 20;
    width = width || 33;

    for (let i = 0; i < height / 2; i++) {
        rosLengthList.push(width, width - 1);
    }

    return rosLengthList.map((length) => new Array(length).fill(0));
}

function put(board: any, rowIndex: number, cellIndex: number, side: string) {
    const newBoard = board.map((row: any) => [...row]);
    newBoard[rowIndex][cellIndex] = side;
    return newBoard;
}

function changeSide(side: string) {
    return side === "A" ? "B" : "A";
}

function reducer(state: any, action: any) {
    switch (action.type) {
        case "put":
            return {
                ...state,
                board: put(
                    state.board,
                    action.payload.rowIndex,
                    action.payload.cellIndex,
                    state.currentSide
                ),
                currentSide: changeSide(state.currentSide)
            };
        default:
            return state;
    }
}

export default function App() {

    const config = useConfig()
    const { data: chain } = useSwitchChain()
    const { address } = useAccount()
    const [loading, setLoading] = React.useState(false);
    const [landfields, setLandfields] = React.useState<Landfield[]>([]);
    const [dimensions, setDimensions] = React.useState<{ width: number, height: number } | undefined>(undefined);
    const [allRecipes, setAllRecipes] = React.useState<string[]>([])

    const contract = '0xEB2557914c032386A0aFc786ff56BF10187Cb6cE' as `0x${string}`
    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const landfieldsResult = await readContract(config, {
                    abi: LandfieldABI,
                    address: contract,
                    functionName: 'getLandfields',
                    chainId: chain?.id,
                })

                const buildingsResult = await readContract(config, {
                    abi: LandfieldABI,
                    address: contract,
                    functionName: 'getBuildings',
                    chainId: chain?.id,
                })
                const dimensionsResult = await readContract(config, {
                    abi: LandfieldABI,
                    address: contract,
                    functionName: 'getDimensions',
                    chainId: chain?.id,
                })
                setDimensions({ width: Number((dimensionsResult as bigint[])[1] as bigint), height: Number((dimensionsResult as bigint[])[0]) })

                const parsedLandfieldsResult = (landfieldsResult as unknown as LandfieldResponse[]).map((r: LandfieldResponse) => ({
                    x: Number(r.y),
                    y: Number(r.x),
                    type: 'landfield',
                    terrainType: r.terrainType,
                    owner: r.owner,
                    price: Number(r.price),
                    sellPrice: Number(r.sellPrice),
                    recipe: r.recipe,
                }))

                const parsedBuildingsResult = (buildingsResult as unknown as LandfieldResponse[]).map((r: LandfieldResponse) => ({
                    x: Number(r.x),
                    y: Number(r.y),
                    buildingType: r.buildingType,
                    owner: r.owner,
                    price: Number(r.price),
                    sellPrice: Number(r.sellPrice),
                    recipe: r.recipe,
                    type: 'building'
                }))

                setLandfields([...parsedLandfieldsResult as any, ...parsedBuildingsResult as any])
            }
            catch (e) {
                console.log(e)
            }
            finally {
                setLoading(false)
            }
        })()
    }, [chain])

    return (
        <>
            {
                loading ?
                    <div className="h-full w-full flex flex-col justify-center items-center ">
                        <Loader2 className="animate-spin h-20 w-20" />
                    </div>
                    :
                    dimensions && landfields && address && <Map dimensions={dimensions} landfields={landfields} account={address} />
            }
        </>
    );
}

const Map = ({ dimensions, landfields, account }: { dimensions: { height: number, width: number }, landfields: Landfield[], account: string }) => {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedCell, setSelectedCell] = React.useState<{ rowIndex: number, cellIndex: number } | undefined>(undefined);
    const selectedLandfield = landfields.find(l => l.x === selectedCell?.rowIndex && l.y === selectedCell?.cellIndex);

    const selectedLandfieldIndex = landfields.findIndex(l => l.x === selectedCell?.rowIndex && l.y === selectedCell?.cellIndex);

    const onClickHandler = (rowIndex: number, cellIndex: number) => {
        const landfield = landfields.find(l => l.x === selectedCell?.rowIndex && l.y === selectedCell?.cellIndex);
        if (landfield?.terrainType !== Terrains.DeepWater) {
            setSelectedCell({ rowIndex, cellIndex })
            setOpenDialog(true)
        }
    }

    const onClose = () => {
        setOpenDialog(false);
        setSelectedCell(undefined);
    }
    const [state, dispatch] = React.useReducer(reducer, {
        board: createBoard(dimensions.height, dimensions.width),
        currentSide: "A"
    });

    return (
        <>
            <div className="scale-[.45] absolute -top-[200px]" style={{ width: "4000px" }}>
                {state.board.map((row: any, rowIndex: number) => {
                    return (
                        <div
                            key={rowIndex}
                            style={{
                                marginTop: "-14px",
                                display: "flex",
                                justifyContent: "center"
                            }}
                        >
                            {row.map((side: string, cellIndex: number) => (
                                <Hex
                                    isActive={selectedCell?.rowIndex === rowIndex && selectedCell?.cellIndex === cellIndex}
                                    landfields={landfields}
                                    x={rowIndex}
                                    y={cellIndex}
                                    side={side}
                                    onClick={() => onClickHandler(rowIndex, cellIndex)}
                                    account={account}
                                    key={`${rowIndex}-${cellIndex}`}
                                />


                            ))}
                        </div>
                    );
                })}
            </div >
            <Dialog open={openDialog} onOpenChange={onClose}>
                <DialogContent>
                    <LandfieldDetails landfield={selectedLandfield} landfieldIndex={selectedLandfieldIndex} />
                </DialogContent>
            </Dialog>
        </>
    )
}


enum Terrains {
    Mountains,
    Forest,
    Water,
    DeepWater,
    Sand,
    Grass
}

enum Buildings {
    VendorShop,
    RecipeShop,
    Tavern,
    Brothel,
    Residential
}

type Landfield = {
    type: 'landfield' | 'building';
    terrainType?: Terrains;
    buildingType?: Buildings;
    name?: string;
} & Common

type Common = {
    x: number;
    y: number;
    owner: string;
    price: number;
    sellPrice: number;
    recipe: string;
}

type LandfieldResponse = {
    type: 'landfield' | 'building';
    terrainType?: Terrains;
    buildingType?: Buildings;
    name?: string;
} & CommonResponse

type CommonResponse = {
    x: bigint;
    y: bigint;
    owner: string;
    price: number;
    sellPrice: number;
    recipe: string;
}

const terrainResolver = (terrain: number | undefined) => {
    switch (terrain) {
        case Terrains.Mountains:
            return "mountains";
        case Terrains.Forest:
            return "forest";
        case Terrains.Water:
            return "water";
        case Terrains.DeepWater:
            return "deepWater";
        case Terrains.Sand:
            return "sand";
        case Terrains.Grass:
            return "grass";

        default: return "deepWater";
    }
}

const buildingResolver = (building: number | undefined) => {
    switch (building) {
        case Buildings.VendorShop:
            return "vendorShop";
        case Buildings.RecipeShop:
            return "recipeShop";
        case Buildings.Tavern:
            return "tavern";
        case Buildings.Brothel:
            return "brothel";
        case Buildings.Residential:
            return "residential";

        default: return "brothel";
    }
}



const LandfieldDetails: FC<{ landfield: Landfield | undefined, landfieldIndex: number }> = ({ landfield, landfieldIndex }) => {
    const [loading, setLoading] = React.useState(false);
    const config = useConfig()
    const { address } = useAccount()
    const contract = '0xEB2557914c032386A0aFc786ff56BF10187Cb6cE' as `0x${string}`


    const isOwnerMe = landfield?.owner === address

    const recipes = [
        {
            name: 'Wood',
            contract: '0x75f1589501a546ec579E022B65853cD84322958d'
        }
    ]

    if (!landfield) return <div>
        Not found
    </div>;


    const buyLandfield = async () => {

        if (!address) return

        try {
            setLoading(true)

            await writeContract(config, {
                account: address,
                address: contract,
                abi: LandfieldABI,
                args: [landfieldIndex],
                functionName: 'buyLandfield',
            })

        }
        catch (e) {
            console.log(e)
        }
        finally {
            setLoading(false)
        }

    }

    const setRecipe = async () => {
        if (!address) return

        try {
            setLoading(true)

            await writeContract(config, {
                account: address,
                address: contract,
                abi: LandfieldABI,
                args: [landfieldIndex],
                functionName: 'setRecipe',
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
        <div className="flex flex-col gap-3 w-full h-full">
            <dl className="divide-y divide-gray-600">
                <div className=" py-6 sm:grid sm:grid-cols-3 sm:gap-4 ">
                    <dt className="text-sm font-medium text-gray-200">Owner</dt>
                    <Link href={''} target="_blank" className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{shortenAddress(landfield.owner)}</Link>
                </div>
                <div className=" py-6 sm:grid sm:grid-cols-3 sm:gap-4 ">
                    <dt className="text-sm font-medium text-gray-200">Terrain</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{landfield.terrainType ? terrainResolver(landfield.terrainType) : buildingResolver(landfield.buildingType)}</dd>
                </div>
                <div className=" py-6 sm:grid sm:grid-cols-3 sm:gap-4 ">
                    <dt className="text-sm font-medium text-gray-200">Sell price</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{landfield?.sellPrice}</dd>
                </div>
                <div className=" py-6 sm:grid sm:grid-cols-3 sm:gap-4 ">
                    <dt className="text-sm font-medium text-gray-200">Price</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{landfield.price}</dd>
                </div>
                <div className=" py-6 sm:grid sm:grid-cols-3 sm:gap-4 ">
                    <dt className="text-sm font-medium text-gray-200">Coordinates</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
                        <span>X:</span> <span>{landfield.x}</span>, <span>Y:</span> <span>{landfield.y}</span>
                    </dd>
                </div>
            </dl>


            <div>
                <button disabled={loading} onClick={buyLandfield} className="px-4 p-2 font-semibold text-lg bg-yellow-600 rounded-lg w-fit">{loading ? <Loader className='h-4 w-4' /> : 'Buy'}</button>
            </div>
            
        </div>
    )
}
