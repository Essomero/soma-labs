/**
 * Load the user profile the account screen renders.
 *
 * `client` is the thin fetch wrapper the app uses everywhere: `get(path)`
 * resolves to the response, and `json()` resolves to the body.
 */

export interface HttpClient {
  get(path: string): Promise<{ ok: boolean; json(): Promise<unknown> }>;
}

export async function fetchProfile(client: HttpClient, id: string): Promise<unknown> {
  const response = await client.get(`/api/users/${id}`);
  const data = await response.json();
  return data;
}
