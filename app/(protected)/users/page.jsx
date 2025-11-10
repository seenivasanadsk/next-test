import { deleteUserAction } from "@/actions/userAction";
import DataTable from "@/components/DataTable";
import { getUsersForDataTable } from "@/services/userService";
import normalizeData from "@/utils/normalizeData";
import { serializeDoc } from "@/utils/serialize";

export default async function UsersPage({ searchParams }) {
  const params = await searchParams;
  const parsedData = normalizeData(params);
  let users = await getUsersForDataTable(parsedData);
  users = serializeDoc(users);

  const config = {
    title: "Users",
    addButtonText: "Add User",
    items: users.items,
    headers: users.headers,
    filterable: users.filterable,
    total: users.total,
    filtered: users.filtered,
    search: parsedData.search || "",
    page: users.page,
    showDateNavigator: false,
    itemsPerPage: users.itemsPerPage,
    entityType: "users",
    loading: false,
  };
  return (
    <>
      <DataTable config={config} />
      {/* <UserForm key={editId || "add"} /> */}
    </>
  );
}
