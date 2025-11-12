import DataTable from "@/components/DataTable";
import { getUsersForDataTable } from "@/services/userService";
import { serializeDoc } from "@/utils/serialize";

export default async function UsersPage({ searchParams }) {
  let usersData = await getUsersForDataTable();
  usersData = serializeDoc(usersData);

  const config = {
    title: "Users",
    addButtonText: "Add User",
    showDateNavigator: false,
    entityType: "users",
    firstData: usersData,
  };
  return (
    <>
      <DataTable config={config} />
      {/* <UserForm key={editId || "add"} /> */}
    </>
  );
}
