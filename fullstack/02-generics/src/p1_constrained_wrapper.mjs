/** Look an item up by its id. */
export function getById(items, id) {
  return items.find((item) => item.id === id);
}
