import React, { FC, useEffect } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcn/dialog"
import { useConfig, useSwitchChain } from "wagmi";
import { readContract } from "wagmi/actions";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { shortenAddress } from "@/lib/utils";
import LandfieldABI from "@/lib/abis/LanfieldABI.json";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../shadcn/contextMenu";

const r = 100;

const Hex = (props) => {
    const { A, B, side = "", ...divProps } = props;
    const terrainEnum = props.landfields.find(t => t.x === props.x && t.y === props.y)?.terrainType;
    const terrain = terrainResolver(terrainEnum);
    return (
        <div
            {...divProps}
            className={`relative ${side}`}
            style={{
                border: "1px solid #000",
                boxSizing: "border-box",
                height: "100px",
                width: "100px",
                ...props.style,
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
            <Image src={`/assets/${terrain}/${terrain}.png`} alt="hexTile" width={10000} height={10000} className="absolute -bottom-2 hover:bottom-0 hover:brightness-110 transform transition-all duration-200 hover:cursor-pointer" />
        </div>
    );
};

function createBoard(height: number, width: number) {
    let rosLengthList = [];

    height = height || 10;
    width = width || 33;

    for (let i = 0; i < height; i++) {
        rosLengthList.push(width, width + 1);
    }

    return rosLengthList.map((length) => new Array(length).fill(0));
}

function put(board, rowIndex, cellIndex, side) {
    const newBoard = board.map((row) => [...row]);
    newBoard[rowIndex][cellIndex] = side;
    return newBoard;
}

function changeSide(side) {
    return side === "A" ? "B" : "A";
}

function reducer(state, action) {
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
    const [state, dispatch] = React.useReducer(reducer, {
        board: createBoard(),
        currentSide: "A"
    });
    const config = useConfig()
    const { data: chain } = useSwitchChain()

    const [loading, setLoading] = React.useState(false);
    const [landfields, setLandfields] = React.useState<Landfield[]>([]);


    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const result = await readContract(config, {
                    abi: LandfieldABI,
                    address: '0x3C68AEB6438207508c3484FEA96272a5Af16338a' as `0x${string}`,
                    functionName: 'getLandfields',
                    chainId: chain?.id,
                })

                const parsedResult = (result as unknown as LandfieldResponse[]).map((r: LandfieldResponse) => ({
                    x: Number(r.x),
                    y: Number(r.y),
                    terrainType: r.terrainType,
                    owner: r.owner,
                    price: Number(r.price),
                    sellPrice: Number(r.sellPrice),
                    recipe: r.recipe
                }))

                setLandfields(parsedResult)
            }
            catch (e) {
                console.log(e)
            }
            finally {
                setLoading(false)
            }
        })()
    }, [chain])

    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedCell, setSelectedCell] = React.useState<{ rowIndex: number, cellIndex: number } | undefined>(undefined);

    const onClickHandler = (rowIndex: number, cellIndex: number) => {
        const landfield = landfields.find(l => l.x === selectedCell?.rowIndex && l.y === selectedCell?.cellIndex);
        if (landfield?.terrainType !== Terrains.DeepWater) {
            setOpenDialog(true);
            setSelectedCell({ rowIndex, cellIndex })
        }
    }

    return (
        <>
            {
                loading ?
                    <div className="h-full w-full flex flex-col justify-center items-center ">
                        <Loader2 className="animate-spin h-20 w-20" />
                    </div>
                    :
                    <>
                        <div className="scale-[.45] absolute -top-[300px]" style={{ width: "4000px" }}>
                            {state.board.map((row, rowIndex) => {
                                return (
                                    <div
                                        style={{
                                            marginTop: "-14px",
                                            display: "flex",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {row.map((side, cellIndex) => (
                                            <ContextMenu>
                                                <ContextMenuTrigger>
                                                    <Hex
                                                        landfields={landfields}
                                                        x={rowIndex}
                                                        y={cellIndex}
                                                        side={side}
                                                        style={{ height: `${r}px`, width: `${r}px` }}
                                                        onClick={() => {
                                                            onClickHandler(rowIndex, cellIndex);
                                                        }}
                                                    /></ContextMenuTrigger>
                                                <ContextMenuContent>
                                                    <ContextMenuItem>Profile</ContextMenuItem>
                                                    <ContextMenuItem>Billing</ContextMenuItem>
                                                    <ContextMenuItem>Team</ContextMenuItem>
                                                    <ContextMenuItem>Subscription</ContextMenuItem>
                                                </ContextMenuContent>
                                            </ContextMenu>

                                        ))}
                                    </div>
                                );
                            })}
                        </div>


                    </>
            }
        </>
    );
}


enum Terrains {
    Mountains,
    Forest,
    Water,
    DeepWater,
    Sand,
    Grass
}

type Landfield = {
    x: number;
    y: number;
    terrainType: Terrains;
    owner: string;
    price: number;
    sellPrice: number;
    recipe: string;
}

type LandfieldResponse = {
    x: bigint;
    y: bigint;
    terrainType: Terrains;
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



const LandfieldDetails: FC<{ landfield: Landfield | undefined }> = ({ landfield }) => {

    if (!landfield) return <div>
        Not found
    </div>;

    return (
        <div>
            <dl className="divide-y divide-gray-600">
                <div className=" py-6 sm:grid sm:grid-cols-3 sm:gap-4 ">
                    <dt className="text-sm font-medium text-gray-200">Owner</dt>
                    <Link href={''} target="_blank" className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{shortenAddress(landfield.owner)}</Link>
                </div>
                <div className=" py-6 sm:grid sm:grid-cols-3 sm:gap-4 ">
                    <dt className="text-sm font-medium text-gray-200">Terrain</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">{terrainResolver(landfield.terrainType)}</dd>
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
        </div>
    )
}
