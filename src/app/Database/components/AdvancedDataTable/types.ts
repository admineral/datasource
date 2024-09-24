// types.ts
export type SearchResult = {
    client: string;
    warehouse: string;
    product: string;
    sales: Record<string, number>;
    price: Record<string, number>;
  };
  
  export type SearchData = {
    id: string;
    client: string;
    warehouse: string;
    product: string;
    [key: string]: any; // For dynamic date columns
  };