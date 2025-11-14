import ProfileForm from "@/components/ProfileForm";
import getCurrentSession from "@/lib/session";
import { getUserById } from "@/services/userService";
import { serializeDoc, unserializeId } from "@/utils/serialize";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getCurrentSession();
  if (!session.isValid) {
    redirect("/login");
    throw new Error("Session is Not Valid");
  }
  const userId = unserializeId(session.userId);
  const user = await getUserById(userId);

  const config = {
    title: "Profile",
    description: "Update user details",
    cancel: "/",
    isEdit: true,
  };

  return (
    <div className="p-5">
      <ProfileForm config={config} user={serializeDoc(user)} />
    </div>
  );
}
