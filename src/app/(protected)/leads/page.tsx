
import { authenticateUser } from "@/utils/autheticateUser";
import LeadsPageComponent from "@/components/leads/LeadsPageComponent";

export default async function LeadsPage() {
    const profile = await authenticateUser();

    return <LeadsPageComponent role={profile.role} />;
}