"use client"

import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SaleData {
  date: string;
  totalSales: number;
}

const ProductsPage: NextPage = () => {
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingSales, setLoadingSales] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch('/api/redis/options');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch sales data when a product is selected
  useEffect(() => {
    if (!selectedProduct) {
      setSalesData([]);
      return;
    }

    const fetchSalesData = async () => {
      setLoadingSales(true);
      try {
        const response = await fetch(`/api/redis/sales?product=${encodeURIComponent(selectedProduct)}`);
        const data = await response.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        // Assuming the API returns an array of { date: string, sales: number }
        const formattedData: SaleData[] = data.sales.map((item: any) => ({
          date: item.date,
          totalSales: Number(item.sales),
        }));
        setSalesData(formattedData);
      } catch (err) {
        setError('Failed to fetch sales data.');
        console.error(err);
      } finally {
        setLoadingSales(false);
      }
    };

    fetchSalesData();
  }, [selectedProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Total Sales Over Time</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="product" className="block text-lg font-medium mb-2">
          Select a Product
        </label>
        <select
          id="product"
          value={selectedProduct || ''}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loadingProducts}
        >
          <option value="" disabled>
            {loadingProducts ? 'Loading products...' : 'Choose a product'}
          </option>
          {products.map((product) => (
            <option key={product} value={product}>
              {product}
            </option>
          ))}
        </select>
      </div>

      {loadingSales ? (
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span className="ml-2 text-blue-500">Loading sales data...</span>
        </div>
      ) : salesData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={salesData}
            margin={{
              top: 20, right: 30, left: 20, bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalSales" stroke="#2563EB" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : selectedProduct ? (
        <div className="bg-blue-100 text-blue-700 p-4 rounded">
          No sales data available for the selected product.
        </div>
      ) : (
        <div className="bg-gray-100 text-gray-700 p-4 rounded">
          Please select a product to view sales data.
        </div>
      )}
    </div>
  );
};

export default ProductsPage;