import React, { useEffect } from "react";
import Image from "next/image";
import { useAccount, useConfig, useSwitchChain } from "wagmi";
import { readContract } from "wagmi/actions";
import { Loader2 } from "lucide-react";
import LandfieldABI from "@/lib/abis/LanfieldABI.json";
import { worldContract } from "@/lib/contracts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shadcn/dropdownMenu";
import LandfieldDetails from "./LandfieldDetails";
import { buildingResolver, Buildings, terrainResolver, Terrains } from "./Resolvers";
import ResizablePanel from "../ResizablePanel";

const r = 60;

const Hex = ({ landfields, x, y, side, isActive, account, onClick, ...props }: { landfields: Landfield[], x: number, y: number, side: string, isActive: boolean, account: string, onClick: () => void }) => {
    const landfield = landfields.find((t: any) => t.x === x && t.y === y);
    const terrain = landfield?.type === 'landfield' ? terrainResolver(landfield?.terrainType) : null

    const building = landfield?.type === 'building' ? buildingResolver(landfield?.buildingType) : null

    const all = building || terrain || 'deepWater';

    const isVilian = (landfield?.owner && landfield?.owner !== '0x0000000000000000000000000000000000000000') && all !== 'deepWater' && landfield?.owner !== account
    const isMine = (landfield?.owner && landfield?.owner !== '0x0000000000000000000000000000000000000000' && all !== 'deepWater') && landfield?.owner === account

    const border = isMine ? '/assets/blueBorder.svg' : isVilian ? '/assets/redBorder.svg' : undefined

    const src = `/assets/${all}/${all}.svg`;

    return (
        <>
            {
                border &&
                <Image
                    {...props}
                    src={border}
                    alt="hexTile"

                    width={r}
                    height={r}
                    className={`absolute z-20 hover:-translate-y-2 hover:brightness-110 transform transition-all duration-200 hover:cursor-pointer ${isActive && '-translate-y-2'} ${isMine && '-translate-y-1'}`} />
            }
            <Image
                {...props}
                src={src}
                alt="hexTile"

                width={r}
                height={r}
                className={`hover:-translate-y-2 hover:brightness-110 transform transition-all duration-200 hover:cursor-pointer ${isActive && '-translate-y-2'} ${isMine && '-translate-y-1'}`} />
        </>

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

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const landfieldsResult = await readContract(config, {
                    abi: LandfieldABI,
                    address: worldContract,
                    functionName: 'getLandfields',
                    chainId: chain?.id,
                })

                const buildingsResult = await readContract(config, {
                    abi: LandfieldABI,
                    address: worldContract,
                    functionName: 'getBuildings',
                    chainId: chain?.id,
                })
                const dimensionsResult = await readContract(config, {
                    abi: LandfieldABI,
                    address: worldContract,
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
                    type: 'building',
                    name: r.name
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
                    dimensions && landfields && address && 
                    <Map dimensions={dimensions} landfields={landfields} account={address} />
            }
        </>
    );
}

const Map = ({ dimensions, landfields, account }: { dimensions: { height: number, width: number }, landfields: Landfield[], account: string }) => {
    const [selectedCell, setSelectedCell] = React.useState<{ rowIndex: number, cellIndex: number } | undefined>(undefined);
    const selectedLandfield = landfields.find(l => l.x === selectedCell?.rowIndex && l.y === selectedCell?.cellIndex);

    const selectedLandfieldIndex = landfields.findIndex(l => l.x === selectedCell?.rowIndex && l.y === selectedCell?.cellIndex);

    const onClickHandler = (rowIndex: number, cellIndex: number) => {
        const landfield = landfields.find(l => l.x === rowIndex && l.y === cellIndex);
        if (!!landfield) {
            setSelectedCell({ rowIndex, cellIndex })
        }
    }

    const [state] = React.useReducer(reducer, {
        board: createBoard(dimensions.height, dimensions.width),
        currentSide: "A"
    });

    return (
        <>
            <div className="w-max pt-4" >
                {state.board.map((row: any, rowIndex: number) => {
                    return (
                        <div
                            key={rowIndex}
                            style={{
                                display: "flex",
                                justifyContent: "center"
                            }}
                        >
                            {row.map((side: string, cellIndex: number) => (
                                <div className="-mt-[23px]">
                                    <DropdownMenu onOpenChange={(open) => {
                                        if (open) {
                                            onClickHandler(rowIndex, cellIndex)
                                        } else {
                                            setSelectedCell(undefined)
                                        }
                                    }}>
                                        <DropdownMenuTrigger>
                                            <Hex
                                                isActive={selectedCell?.rowIndex === rowIndex && selectedCell?.cellIndex === cellIndex}
                                                landfields={landfields}
                                                x={rowIndex}
                                                y={cellIndex}
                                                side={side}
                                                onClick={() => { }}
                                                account={account}
                                                key={`${rowIndex}-${cellIndex}`}
                                            />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>{selectedLandfield?.name || 'Landfield'}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <ResizablePanel>
                                                <LandfieldDetails landfield={selectedLandfield} landfieldIndex={selectedLandfieldIndex} />
                                            </ResizablePanel>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </>
    )
}

export type Landfield = {
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
