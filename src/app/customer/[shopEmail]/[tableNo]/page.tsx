import CustomerShopClient from "@/components/CustomerShopClient";

export default async function TableCustomerPage({
    params
}: {
    params: Promise<{ shopEmail: string; tableNo: string }>
}) {
    const { shopEmail, tableNo } = await params;

    return (
        <CustomerShopClient
            shopIdentifier={shopEmail}
            tableNo={tableNo}
        />
    );
}
