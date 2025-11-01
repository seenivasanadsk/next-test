/**
 * Generic MongoDB DataTable helper.
 * Supports pagination, search, filtering, and sorting.
 *
 * @param {Object} params
 * @param {Object} params.collection - MongoDB Collection instance
 * @param {Array} params.headers - Table headers config (with searchable/filterable info)
 * @param {Object} [params.filter={}] - Custom filter query
 * @param {String} [params.search=""] - Search string
 * @param {Object} [params.sort={ _id: -1 }] - Sort config
 * @param {Number} [params.page=1] - Current page
 * @param {Number} [params.itemsPerPage=10] - Items per page
 *
 * @returns {Promise<Object>} { items, headers, total, filtered, filterable, page, itemsPerPage }
 */
export async function findWithTableOptions({
  collection,
  headers = [],
  filter = {},
  search = "",
  sort = { _id: -1 },
  page = 1,
  itemsPerPage = 10,
}) {
  // --- Build search query ---
  let query = { ...filter };

  const searchableFields = headers
    .filter((h) => h.searchable)
    .map((h) => h.valuePath);

  if (search && searchableFields.length > 0) {
    const regex = new RegExp(search, "i");
    query.$or = searchableFields.map((field) => ({ [field]: regex }));
  }

  // --- Build filterable options ---
  const filterableFields = headers
    .filter((h) => h.filterable === "Select")
    .map((h) => h.valuePath);

  const filterableFieldsOptions = {};
  for (const field of filterableFields) {
    filterableFieldsOptions[field] = await collection.distinct(field);
  }

  // --- Count ---
  const total = await collection.countDocuments();
  const filtered = await collection.countDocuments(query);

  // --- Fetch paginated data ---
  const items = await collection
    .find(query)
    .sort(sort)
    .skip((page - 1) * itemsPerPage)
    .limit(itemsPerPage)
    .toArray();

  return {
    items,
    headers,
    total,
    filtered,
    filterable: filterableFieldsOptions,
    page,
    itemsPerPage,
  };
}
