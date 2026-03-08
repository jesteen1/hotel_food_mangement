import CustomerShopClient from "@/components/CustomerShopClient";

export default async function ShopCustomerPage({
    params
}: {
    params: Promise<{ shopEmail: string }>
}) {
    const { shopEmail } = await params;

    return (
        <CustomerShopClient
            shopIdentifier={shopEmail}
        />
    );
}
