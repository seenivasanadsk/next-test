import PasswordResetForm from "@/components/forms/PasswordResetForm";
import { getUserOptions } from "@/services/userService";
import { serializeDoc } from "@/utils/serialize";

export default async function ResetPasswordPage() {
  let users = await getUserOptions();
  users = serializeDoc(users);
  return (
    <div className="flex justify-center mt-24">
      <PasswordResetForm users={users} />
    </div>
  );
}
