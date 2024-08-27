import HomePage from "@/components/pageComponents/HomePage";
import { SettingsProvider } from "@/context/realmContext";
import { InferGetServerSidePropsType } from "next";
import { getServerSideProps } from "@/lib/getSettings";
import Layout from "@/components/Layout";

export default function Map({ settings }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <Layout>
            <SettingsProvider data={settings}>
                <HomePage />
            </SettingsProvider>
        </Layout>
    )
}

export { getServerSideProps };