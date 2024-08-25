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
import TileDetails from "./LandfieldDetails";
import { terrainResolver, Terrains } from "./Resolvers";
import ResizablePanel from "../ResizablePanel";
import { isEven } from "@/lib/utils";
import TestApp from "./TestApp";

const r = 60;

const Hex = ({ tiles, x, y, side, isActive, account, onClickHandler, isDeepWater, ...props }: { tiles: Tile[], x: number, y: number, side: string, isActive: boolean, account: string, onClickHandler: (x?: number, y?: number, mouseX?: number, mouseY?: number) => void, isDeepWater?: boolean }) => {
    const tile = tiles.find((t: any) => t.x === x && t.y === y);
    const terrain = terrainResolver(tile?.terrainType)
    const all = terrain || 'deepWater';
    const isVilian = (tile?.owner && tile?.owner !== '0x0000000000000000000000000000000000000000') && all !== 'deepWater' && tile?.owner !== account
    const isMine = (tile?.owner && tile?.owner !== '0x0000000000000000000000000000000000000000' && all !== 'deepWater') && tile?.owner === account

    // const border = isMine ? '/assets/blueBorder.svg' : isVilian ? '/assets/redBorder.svg' : undefined

    const src = `/assets/${all}/${all}.svg`;

    return (
        <>
            <svg
                height={r}
                width={r}
                viewBox={`0 0 ${r} ${r}`}
                key={`${y}-${x}`}
                onClick={(e) => {
                    if (!isDeepWater) onClickHandler(y, x, e.clientX, e.clientY)
                }}
                className={`group relative ${!isDeepWater ? 'cursor-pointer' : 'cursor-grab'} ${isDeepWater ? 'cursor-grab' : 'hover:-translate-y-2 hover:cursor-pointer hex'} hover:brightness-110 transform transition-all duration-200  ${isActive && '-translate-y-2'} ${isMine && '-translate-y-1'}`}>
                <image
                    {...props}
                    href={src}
                    // alt="hexTile"
                    width={r}
                    height={r}
                />
            </svg>

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
                        x: Number(t.x),
                        y: Number(t.y),
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
                    <div className="w-screen overflow-hidden relative">
                        <Map map={map} account={address} />
                    </div>
            }
        </>
    );
}

const Map = ({ map, account }: { map: Map, account: string }) => {
    const { dimensions, tiles } = map;

    const [selectedCell, setSelectedCell] = React.useState<{ y: number, x: number } | undefined>(undefined);
    const selectedTileIndex = tiles.findIndex(l => l.x === selectedCell?.x && l.y === selectedCell.y);

    const tile = tiles.find(l => l.x === selectedCell?.x && l.y === selectedCell?.y);
    const [open, setOpen] = useState(false)
    const [coordinates, setCoordinates] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
    const onClickHandler = (y?: number, x?: number, mouseX?: number, mouseY?: number) => {
        const tile = tiles.find(l => l.x === x && l.y === y);
        if (!!tile) {
            if (mouseX && mouseY) setCoordinates({ x: mouseX, y: mouseY })
                setOpen(true)
            setSelectedCell({ y: tile.y, x: tile.x })
        }
        else {
            setSelectedCell(undefined)
        }
    }

    const [state] = React.useReducer(reducer, {
        board: createBoard(dimensions.height, dimensions.width),
        currentSide: "A"
    });

    return (
        <>
             {
                open && tile &&
                <DropdownMenu modal={false} open={open} onOpenChange={(open) => {
                    setOpen(open)
                    onClickHandler()
                }}>
                    <DropdownMenuTrigger style={{
                        top: `${coordinates.y/1.2}px`,
                        left: `${coordinates.x}px`,
                        position: 'absolute',
                    }} />
                    <DropdownMenuContent sticky="always">
                        <DropdownMenuLabel>{tile?.name || 'Tile'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <ResizablePanel>
                            <TileDetails landfield={tile} landfieldIndex={selectedTileIndex} />
                        </ResizablePanel>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
            <TestApp>

                <div className="w-max min-w-[100vw] pt-4 relative -space-y-[15.5px]" >
                    {state.board.map((row: any, rowIndex: number) => {
                        return (
                            <div
                                key={rowIndex}
                                className="flex justify-center -space-x-[9px]"
                            >
                                {row.map((side: string, cellIndex: number) => {

                                    const isDeepWater = !tiles.find(l => l.x === cellIndex && l.y === rowIndex)

                                    return <Hex
                                    key={`${rowIndex}-${cellIndex}`}
                                        isActive={selectedCell?.y === rowIndex && selectedCell?.x === cellIndex}
                                        tiles={tiles}
                                        x={cellIndex}
                                        y={rowIndex}
                                        side={side}
                                        onClickHandler={onClickHandler}
                                        account={account}
                                        isDeepWater={isDeepWater}
                                    />
                                })}
                            </div>
                        );
                    })}

                </div>
              
            </TestApp>
        </>

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