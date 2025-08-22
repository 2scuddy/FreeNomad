import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminStats } from "@/lib/data-access/admin";

export default async function AdminPage() {
  try {
    // Require admin authentication
    const user = await requireAdmin();

    // Get admin statistics
    const stats = await getAdminStats();

    const adminUser = {
      id: user.id || "",
      name: user.name || undefined,
      email: user.email || "",
      role: "ADMIN" as string,
    };

    const adminStats = {
      ...stats,
      growth: Array.isArray(stats.growth) ? stats.growth : [],
    };

    return <AdminDashboard user={adminUser} stats={adminStats} />;
  } catch (error) {
    // Redirect to login if not authenticated or not admin
    redirect("/auth/login?callbackUrl=/admin&error=AdminAccessRequired");
  }
}
