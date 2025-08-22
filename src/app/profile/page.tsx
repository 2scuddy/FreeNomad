import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UserProfile } from "@/components/user-profile";
import { getUserProfile } from "@/lib/data-access/users";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  if (!user.id) {
    redirect("/auth/login");
  }

  const userProfile = await getUserProfile(user.id);

  if (!userProfile) {
    redirect("/auth/login");
  }

  return <UserProfile user={userProfile} />;
}
