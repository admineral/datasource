'use client';

import React, { useState, useEffect } from 'react';
import { FaWarehouse, FaUser, FaBox, FaDollarSign, FaChartLine } from "react-icons/fa";
import { api } from './utils/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';

interface Entry {
  id: string;
  warehouse: string;
  client: string;
  product: string;
  price: number;
  sales: number;
}

const HomePage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [formData, setFormData] = useState<Omit<Entry, 'id'>>({
    warehouse: '',
    client: '',
    product: '',
    price: 0,
    sales: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.fetchEntries(1); // Hier fügen wir die Seitennummer hinzu
      setEntries(data.reverse());
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'sales' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.uploadEntry(formData);
      toast.success('Data uploaded successfully');
      setFormData({ warehouse: '', client: '', product: '', price: 0, sales: 0 });
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteEntries(selectedEntries);
      toast.success('Entries deleted successfully');
      setSelectedEntries([]);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold mb-6">Data Manager</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <FaWarehouse className="text-gray-500" />
                <Input
                  type="text"
                  name="warehouse"
                  value={formData.warehouse}
                  onChange={handleChange}
                  placeholder="Warehouse"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-500" />
                <Input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="Client"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <FaBox className="text-gray-500" />
                <Input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  placeholder="Product"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <FaDollarSign className="text-gray-500" />
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FaChartLine className="text-gray-500" />
                <Input
                  type="number"
                  name="sales"
                  value={formData.sales}
                  onChange={handleChange}
                  placeholder="Sales"
                  required
                  min="0"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Uploading...' : 'Upload Data'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Button onClick={fetchData} disabled={loading}>
              Refresh Data
            </Button>
            <Button
              onClick={() => setShowDeleteModal(true)}
              disabled={selectedEntries.length === 0}
              variant="destructive"
            >
              Delete Selected ({selectedEntries.length})
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedEntries.length === entries.length}
                        onCheckedChange={(checked) => {
                          setSelectedEntries(checked ? entries.map(e => e.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEntries.includes(entry.id)}
                          onCheckedChange={() => handleSelect(entry.id)}
                        />
                      </TableCell>
                      <TableCell>{entry.warehouse}</TableCell>
                      <TableCell>{entry.client}</TableCell>
                      <TableCell>{entry.product}</TableCell>
                      <TableCell>${entry.price.toFixed(2)}</TableCell>
                      <TableCell>{entry.sales}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the selected entries? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;