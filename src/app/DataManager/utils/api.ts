interface WeeklyData {
  [week: string]: number;
}

interface OldEntry {
  id: string;
  warehouse: string;
  client: string;
  product: string;
  price: number;
  sales: number;
}

interface NewEntry {
  client: string;
  warehouse: string;
  product: string;
  price: WeeklyData;
  sales: WeeklyData;
}

const API_BASE_URL = '/api/upstash';

export const api = {
  // Old methods
  fetchEntries: async (page: number): Promise<OldEntry[]> => {
    const res = await fetch(`${API_BASE_URL}?page=${page}`);
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const json = await res.json();
    return json.data;
  },

  uploadEntry: async (entry: Omit<OldEntry, 'id'>): Promise<void> => {
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

  // New methods
  fetchNewEntries: async (): Promise<NewEntry[]> => {
    const res = await fetch(`${API_BASE_URL}/data`);
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const json = await res.json();
    return json.data;
  },

  fetchFilteredEntries: async (filter: Partial<Pick<NewEntry, 'client' | 'warehouse' | 'product'>>): Promise<NewEntry[]> => {
    const queryParams = new URLSearchParams(filter as Record<string, string>);
    const res = await fetch(`${API_BASE_URL}/data?${queryParams}`);
    if (!res.ok) {
      throw new Error('Failed to fetch filtered data');
    }
    const json = await res.json();
    return json.data;
  },

  uploadCSVToUpstash: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload-csv`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to upload CSV data');
    }
  },

  getClients: async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE_URL}/clients`);
    if (!res.ok) {
      throw new Error('Failed to fetch clients');
    }
    const json = await res.json();
    return json.data;
  },

  getWarehouses: async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE_URL}/warehouses`);
    if (!res.ok) {
      throw new Error('Failed to fetch warehouses');
    }
    const json = await res.json();
    return json.data;
  },

  getProducts: async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const json = await res.json();
    return json.data;
  }
};