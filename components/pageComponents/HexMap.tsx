import React, { MouseEventHandler, useEffect, useState } from "react";
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
import { isEven } from "@/lib/utils";
import TestApp from "./TestApp";
import build from "next/dist/build";

const r = 60;

const Hex = ({ tiles, x, y, side, isActive, account, onClick, isDeepWater, ...props }: { tiles: Tile[], x: number, y: number, side: string, isActive: boolean, account: string, onClick: MouseEventHandler<HTMLImageElement>, isDeepWater?: boolean }) => {
    const landfield = tiles.find((t: any) => t.x === x && t.y === y);
    const terrain = terrainResolver(landfield?.terrainType)
    console.log(tiles)
    const all = terrain || 'deepWater';

    const isVilian = (landfield?.owner && landfield?.owner !== '0x0000000000000000000000000000000000000000') && all !== 'deepWater' && landfield?.owner !== account
    const isMine = (landfield?.owner && landfield?.owner !== '0x0000000000000000000000000000000000000000' && all !== 'deepWater') && landfield?.owner === account

    // const border = isMine ? '/assets/blueBorder.svg' : isVilian ? '/assets/redBorder.svg' : undefined

    const src = `/assets/${all}/${all}.svg`;

    return (
        <>
            {/* {
                border &&
                <Image
                    {...props}
                    src={border}
                    onClick={onClick}
                    alt="hexTileBorder"
                    width={r}
                    height={r}
                    className={`hex absolute z-20 group-hover:-translate-y-2 group-hover:brightness-110 transform transition-all duration-200 hover:cursor-pointer ${isActive && '-translate-y-2'} ${isMine && '-translate-y-1'}`} />
            } */}
            <Image
                {...props}
                src={src}
                onClick={onClick}
                alt="hexTile"
                width={r}
                height={r}
                className={`${isDeepWater ? 'cursor-grab' : 'group-hover:-translate-y-2 hover:cursor-pointer hex'} group-hover:brightness-110 transform transition-all duration-200  ${isActive && '-translate-y-2'} ${isMine && '-translate-y-1'}`} />
        </>

    );
};

function createBoard(height?: number | undefined, width?: number | undefined) {
    let rosLengthList = [];

    height = height || 20;
    width = width || 33;

    for (let i = 0; i < height; i++) {
        if (isEven(i) || i == 0) rosLengthList.push(width);
        else rosLengthList.push(width - 1);
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
    const [map, setMap] = useState<Map | undefined>(undefined)
    const [allRecipes, setAllRecipes] = React.useState<string[]>([])

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const mapResult = await readContract(config, {
                    abi: LandfieldABI,
                    address: worldContract,
                    functionName: 'getMap',
                    chainId: chain?.id,
                })

                const mapResolved: Map = {
                    dimensions: {
                        height: Number((mapResult as unknown as any[])[0]),
                        width: Number((mapResult as unknown as any[])[1])
                    },
                    name: (mapResult as unknown as any[])[2],
                    tiles: (mapResult as unknown as any[])[3].map((t: TileResponse) => ({
                        terrainType: t.terrainType,
                        biomeType: t.biomeType,
                        name: t.name,
                        x: Number(t.y),
                        y: Number(t.x),
                        owner: t.owner,
                        blueprint: t.blueprint
                    })),
                }

                setMap(mapResolved)
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
                    map && address &&
                    <Map map={map} account={address} />
            }
        </>
    );
}

const Map = ({ map, account }: { map: Map, account: string }) => {
    const { dimensions, tiles } = map;
    console.log(map)
    const [selectedCell, setSelectedCell] = React.useState<{ rowIndex: number, cellIndex: number } | undefined>(undefined);
    const selectedLandfield = tiles.find(l => l.x === selectedCell?.rowIndex && l.y === selectedCell?.cellIndex);

    const selectedLandfieldIndex = tiles.findIndex(l => l.x === selectedCell?.rowIndex && l.y === selectedCell?.cellIndex);

    const onClickHandler = (rowIndex: number, cellIndex: number) => {
        const landfield = tiles.find(l => l.x === rowIndex && l.y === cellIndex);
        if (!!landfield) {
            setSelectedCell({ rowIndex, cellIndex })
        }
    }

    const [state] = React.useReducer(reducer, {
        board: createBoard(dimensions.height, dimensions.width),
        currentSide: "A"
    });

    return (
        <TestApp>
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
                            {row.map((side: string, cellIndex: number) => {

                                const isDeepWater = !tiles.find(l => l.x === rowIndex && l.y === cellIndex)

                                const [open, setOpen] = React.useState(false)

                                return <div onClick={() => {
                                    if (!isDeepWater) setOpen(true); onClickHandler(rowIndex, cellIndex)
                                }} className={`-mt-[17px] group relative ${!isDeepWater ? 'cursor-pointer' : 'cursor-grab'}`}>
                                    <Hex
                                        isActive={selectedCell?.rowIndex === rowIndex && selectedCell?.cellIndex === cellIndex}
                                        tiles={tiles}
                                        x={rowIndex}
                                        y={cellIndex}
                                        side={side}
                                        onClick={() => { { setOpen(true); onClickHandler(rowIndex, cellIndex) } }}
                                        account={account}
                                        key={`${rowIndex}-${cellIndex}`}
                                        isDeepWater={isDeepWater}
                                    />
                                    {
                                        open &&
                                        <DropdownMenu open={open} onOpenChange={(open) => {
                                            setOpen(open)
                                            if (!open) {
                                                setSelectedCell(undefined)
                                            }
                                        }}>
                                            <DropdownMenuTrigger className="absolute" />
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>{selectedLandfield?.name || 'Landfield'}</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <ResizablePanel>
                                                    <LandfieldDetails landfield={selectedLandfield} landfieldIndex={selectedLandfieldIndex} />
                                                </ResizablePanel>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    }
                                </div>
                            })}
                        </div>
                    );
                })}
            </div>
        </TestApp>
    )
}

export type Tile = {
    terrainType: Terrains;
    biomeType: number
    name: string;
    x: number;
    y: number;
    owner: string;
    blueprint: string;

}

type TileResponse = {
    terrainType: Terrains;
    biomeType: number;
    name: string;
    x: bigint;
    y: bigint;
    owner: string;
    blueprint: string;
}

type Map = {
    dimensions: { height: number, width: number },
    tiles: Tile[],
    name: string
}