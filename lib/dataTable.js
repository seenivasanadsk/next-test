/**
 * Generic MongoDB DataTable helper.
 * Handles pagination, search, filtering, and sorting — all from `options`.
 *
 * @param {Object} params
 * @param {Object} params.collection - MongoDB Collection instance
 * @param {Array}  params.headers - Table headers config (with searchable/filterable info)
 * @param {Object} [params.options={}] - Raw options object containing filter/sort/search/page info
 *
 * @returns {Promise<Object>} { items, headers, total, filtered, filterable, page, itemsPerPage }
 */
export async function findWithTableOptions({
  collection,
  headers = [],
  options = {},
}) {
  // --- Step 1: Extract and parse filters, sort, search, pagination ---
  const parsed = {
    filter: {},
    sort: {},
    search: "",
    page: 1,
    itemsPerPage: 25,
  };

  for (const [key, value] of Object.entries(options)) {
    // --- Handle Filters ---
    const header = headers.find((h) => h.valuePath === key);
    if (header?.filterable) {
      parsed.filter[key] = value;
      continue;
    }

    // --- Handle Sorts ---
    if (key.startsWith("sort_")) {
      const sortKey = key.replace(/^sort_/, "");
      const sortHeader = headers.find(
        (h) => h.valuePath === sortKey && h.sortable
      );
      if (sortHeader) {
        parsed.sort[sortKey] = value === "asc" || value === 1 ? 1 : -1;
      }
      continue;
    }

    // --- Handle search/pagination ---
    if (key === "search") parsed.search = value;
    if (key === "page") parsed.page = Number(value) || 1;
    if (key === "itemsPerPage") parsed.itemsPerPage = Number(value) || 25;
  }

  // --- Step 2: Build query ---
  let query = { ...parsed.filter };
  const searchableFields = headers
    .filter((h) => h.searchable)
    .map((h) => h.valuePath);

  if (parsed.search && searchableFields.length > 0) {
    const regex = new RegExp(parsed.search, "i");
    query.$or = searchableFields.map((field) => ({ [field]: regex }));
  }

  // --- Step 3: Build filterable options (for UI Select fields) ---
  const filterableFields = headers
    .filter((h) => h.filterable === "Select")
    .map((h) => h.valuePath);

  const filterableFieldsOptions = {};
  for (const field of filterableFields) {
    filterableFieldsOptions[field] = await collection.distinct(field);
  }

  // --- Step 4: Query execution ---
  const total = await collection.countDocuments();
  const filtered = await collection.countDocuments(query);

  const items = await collection
    .find(query)
    .sort(Object.keys(parsed.sort).length ? parsed.sort : { _id: -1 })
    .skip((parsed.page - 1) * parsed.itemsPerPage)
    .limit(parsed.itemsPerPage)
    .toArray();

  // --- Step 5: Return response ---
  return {
    items,
    headers,
    total,
    filtered,
    filterable: filterableFieldsOptions,
    page: parsed.page,
    itemsPerPage: parsed.itemsPerPage,
  };
}
