export async function getServerSideProps(context: any) {

    context.res.setHeader(
        'Cache-Control',
        's-maxage=60, stale-while-revalidate'
    );

    const contract = context.query.contract
    const chainId = context.query.chainId

    const settings = {
        chainId,
        contract
    }

    return {
        props: { settings }
    }
}