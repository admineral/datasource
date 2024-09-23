'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RedisTestPage() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const [allKeys, setAllKeys] = useState<string[]>([]);

  useEffect(() => {
    fetchAllKeys();
  }, []);

  const handleSet = async () => {
    try {
      const response = await fetch('/api/redis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      fetchAllKeys(); // Refresh the list of keys
    } catch (error) {
      setResult('Error setting value');
    }
  };

  const handleGet = async () => {
    try {
      const response = await fetch(`/api/redis?key=${encodeURIComponent(key)}`);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error getting value');
    }
  };

  const fetchAllKeys = async () => {
    try {
      const response = await fetch('/api/redis?key=all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAllKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching all keys:', error);
      setAllKeys([]);
      setResult(`Error: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    if (key && value) {
      await handleSet();
      setKey('');
      setValue('');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Redis Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <Input
              placeholder="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 mb-4">
            <Button onClick={handleSet} variant="default">Set</Button>
            <Button onClick={handleGet} variant="secondary">Get</Button>
            <Button onClick={handleSave} variant="outline">Save</Button>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-muted p-2 rounded-md overflow-x-auto">
              {result}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Keys in Database</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allKeys.map((key) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setKey(key);
                        handleGet();
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}