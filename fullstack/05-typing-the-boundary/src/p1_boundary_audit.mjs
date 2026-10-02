/**
 * Load the user profile the account screen renders.
 *
 * `client` is the thin fetch wrapper the app uses everywhere: `get(path)`
 * resolves to the response, and `json()` resolves to the body.
 */

export async function fetchProfile(client, id) {
  const response = await client.get(`/api/users/${id}`);
  const data = await response.json();
  return data;
}
