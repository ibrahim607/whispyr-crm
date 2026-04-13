import { authenticateUser } from "@/utils/autheticateUser";
import { DashboardPageClient } from "@/components/dashboard/Dashboard-page-client";

const DashboardPage = async () => {
    const profile = await authenticateUser();

    return <DashboardPageClient role={profile.role} />;

}

export default DashboardPage;