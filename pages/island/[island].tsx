import { useRouter } from "next/router";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/Button";

const Island = () => {
    const router = useRouter();
    const { island } = router.query;

    const islandName = islandNameResolver(island as string);

    if (!islandName) {
        return (
            <div>
                <h1>Island not found</h1>
            </div>
        )
    }

    const goBack = () => {
        router.back();
    }

    return (
        <div className="relative">
            <Button className="absolute top-3 left-3" onClick={goBack} Icon={() => <ArrowLeft />}>
                <p>Back</p>
            </Button>
            <div className="flex flex-col justify-center items-center h-screen">
                <h1><span>Island</span> <span>{islandName}</span></h1>
                <div className="h-[90vh] w-auto">
                    <Image
                        src={`/assets/${island}Detailed.png`}
                        alt="island"
                        width={1000}
                        height={1000}
                        className="rounded-lg w-full h-full"
                    />
                </div>
            </div>
        </div>

    )
}

const islandNameResolver = (island: string) => {
    switch (island) {
        case 'kalimdor':
            return 'Kalimdor';
        case 'easternKingdoms':
            return 'Eastern Kingdoms';
        case 'northrend':
            return 'Northrend';
        default:
            return undefined;
    }
}


export default Island;