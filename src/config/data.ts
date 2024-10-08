export type DataConfig = typeof dataConfig

export const dataConfig = {
  warehouseData: [
    {
      id: crypto.randomUUID(),
      warehouse: "East Coast Distribution",
      client: "Skate Shop Pro",
      product: "Pro Skateboard Deck",
      price: 59.99,
      sales: 150,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "West Coast Hub",
      client: "Boarders United",
      product: "Premium Trucks Set",
      price: 44.99,
      sales: 200,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "Midwest Storage",
      client: "Wheels & Deals",
      product: "High-Performance Wheels",
      price: 29.99,
      sales: 300,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "Southern Depot",
      client: "Grip It Good",
      product: "Ultra Grip Tape",
      price: 9.99,
      sales: 500,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "Northwest Center",
      client: "Extreme Sports Outlet",
      product: "Safety Helmet",
      price: 34.99,
      sales: 100,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "East Coast Distribution",
      client: "Urban Skate Co.",
      product: "Skate Tool Kit",
      price: 19.99,
      sales: 250,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "West Coast Hub",
      client: "Board & Beyond",
      product: "Skateboard Bearings",
      price: 14.99,
      sales: 400,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "Midwest Storage",
      client: "Skate Style",
      product: "Graphic T-Shirt",
      price: 24.99,
      sales: 175,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "Southern Depot",
      client: "Roll With It",
      product: "Skate Backpack",
      price: 39.99,
      sales: 125,
    },
    {
      id: crypto.randomUUID(),
      warehouse: "Northwest Center",
      client: "Shred Zone",
      product: "Protective Pads Set",
      price: 29.99,
      sales: 150,
    },
  ],
}