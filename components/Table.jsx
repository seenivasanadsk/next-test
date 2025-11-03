import Link from "next/link";
import TableHead from "./TableHead";
import TableDeleteButton from "./TableDeleteAction";
import display from "@/utils/display";
import cn from "@/utils/cn";

export default function Table({ config }) {
  const { items, headers, editURL, deleteAction, loading } = config;
  return (
    <table
      className={cn("min-w-full border-collapse", loading && "opacity-50")}
    >
      <thead className="sticky top-0 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 z-10">
        <tr className="uppercase">
          {headers.map((header, i) => (
            <TableHead key={i} header={header} />
          ))}
          <th className="border-b border-amber-300 dark:border-amber-950 px-3 py-2 text-center">
            Action
          </th>
        </tr>
      </thead>

      <tbody>
        {items.length ? (
          items.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${
                rowIndex % 2 === 0
                  ? "bg-gray-50 dark:bg-gray-800"
                  : "bg-white dark:bg-gray-900"
              } hover:bg-amber-100 dark:hover:bg-amber-800 border-b border-gray-200 dark:border-gray-700`}
            >
              {headers.map((header, colIndex) => (
                <td
                  key={colIndex}
                  className="whitespace-nowrap px-2 py-1 text-gray-900 dark:text-gray-100"
                  title={display(item[header["valuePath"]], header["display"], {
                    plain: true,
                  })}
                >
                  {display(item[header["valuePath"]], header["display"])} <br />
                </td>
              ))}
              <td className="px-2 py-1 text-center">
                <Link
                  href={editURL ? editURL + item._id : "#"}
                  scroll={false}
                  title="Edit"
                  className="inline-block cursor-pointer rounded-full p-1 hover:bg-amber-200 dark:hover:bg-amber-700 transition"
                >
                  ✏️
                </Link>

                {deleteAction && (
                  <TableDeleteButton
                    id={item._id}
                    deleteAction={deleteAction}
                  />
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={headers.length + 1}
              className="p-6 text-center text-gray-500 dark:text-gray-400"
            >
              No Records Found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
