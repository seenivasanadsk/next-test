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
  console.log(users);

  const config = {
    title: "Users",
    addButtonText: "Add User",
    footerContent: "Footer Information from Parent",
    items: users.items,
    headers: users.headers,
    filterable: users.filterable,
    editURL: (id) => "/users?open-form=true&edit-id=" + id,
    addURL: "/users?open-form=true",
    total: users.total,
    filtered: users.filtered,
    search: parsedData.search || "",
    page: users.page,
    itemsPerPage: users.itemsPerPage,
    deleteAction: deleteUserAction,
  };
  return (
    <>
      <DataTable config={config} />
      {/* <UserForm key={editId || "add"} /> */}
    </>
  );
}
