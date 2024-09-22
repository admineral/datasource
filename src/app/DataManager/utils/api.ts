interface Entry {
  id: string;
  warehouse: string;
  client: string;
  product: string;
  price: number;
  sales: number;
}

const API_BASE_URL = '/api/upstash';

export const api = {
  fetchEntries: async (): Promise<Entry[]> => {
    const res = await fetch(`${API_BASE_URL}`);
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const json = await res.json();
    return json.data;
  },

  uploadEntry: async (entry: Omit<Entry, 'id'>): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to upload data');
    }
  },

  deleteEntries: async (ids: string[]): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      throw new Error('Failed to delete entries');
    }
  },
};