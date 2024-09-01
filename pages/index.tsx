import Link from "next/link";
import Layout from "../components/Layout";
import Image from "next/image";

export default function Home() {

  return (
    <Layout>
      <div className={`flex flex-col items-center gap-3 h-screen w-full relative`}>
        <div className="h-full flex flex-col items-center justify-center gap-3">
          <Image src={"/logo.png"} alt={"logo"} width={500} height={500} />
          <Link href={'/11155111/0xa0347807707F4BFD8890361eD3D1D3d880E5397e'} className="px-5 py-2.5 text-xl mt-2 bg-accent-foreground rounded-xl text-accent active:scale-90 hover:brightness-90 duration-100 transition-all">
            Start game
          </Link>
        </div>
      </div>
    </Layout>
  );
}
