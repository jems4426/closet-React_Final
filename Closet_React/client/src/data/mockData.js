export const mockProducts = [
  {
    id: 1,
    name: "Classic White T-Shirt",
    price: 29.99,
    category: "Men",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    description: "A comfortable classic white t-shirt made from 100% cotton.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Gray"],
    inStock: true,
    rating: 4.5,
    reviews: 120
  },
  {
    id: 2,
    name: "Denim Jacket",
    price: 79.99,
    category: "Men",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500",
    description: "Stylish denim jacket perfect for casual outings.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Light Blue", "Dark Blue"],
    inStock: true,
    rating: 4.3,
    reviews: 89
  },
  {
    id: 3,
    name: "Summer Dress",
    price: 59.99,
    category: "Women",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
    description: "Beautiful floral summer dress for special occasions.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Floral", "Blue", "Pink"],
    inStock: true,
    rating: 4.7,
    reviews: 205
  },
  {
    id: 5,
    name: "Wool Sweater",
    price: 89.99,
    category: "Women",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500",
    description: "Cozy wool sweater perfect for cold weather.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige", "Gray", "Navy"],
    inStock: true,
    rating: 4.6,
    reviews: 98
  },
  {
    id: 6,
    name: "Cargo Pants",
    price: 69.99,
    category: "Men",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500",
    description: "Functional cargo pants with multiple pockets.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Khaki", "Black", "Olive"],
    inStock: false,
    rating: 4.2,
    reviews: 67
  },
  {
    id: 7,
    name: "Silk Blouse",
    price: 79.99,
    category: "Women",
    image: "https://images.unsplash.com/photo-1564257577-47b11038740c?w=500",
    description: "Elegant silk blouse for professional settings.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Cream", "Light Pink"],
    inStock: true,
    rating: 4.8,
    reviews: 143
  }
];

export const mockOrders = [
  {
    id: 1,
    orderNumber: "ORD-2025-001",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    date: "2025-01-15",
    status: "Delivered",
    total: 89.98,
    items: [
      { id: 1, name: "Classic White T-Shirt", quantity: 1, price: 29.99, size: "M" },
      { id: 3, name: "Summer Dress", quantity: 1, price: 59.99, size: "S" }
    ]
  },
  {
    id: 2,
    orderNumber: "ORD-2025-002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    date: "2025-01-18",
    status: "Processing",
    total: 79.99,
    items: [
      { id: 2, name: "Denim Jacket", quantity: 1, price: 79.99, size: "L" }
    ]
  },
  {
    id: 3,
    orderNumber: "ORD-2025-003",
    customerName: "Admin User",
    customerEmail: "admin@closet.com",
    date: "2025-01-20",
    status: "Shipped",
    total: 169.98,
    items: [
      { id: 5, name: "Wool Sweater", quantity: 1, price: 89.99, size: "M" },
      { id: 7, name: "Silk Blouse", quantity: 1, price: 79.99, size: "S" }
    ]
  }
];

export const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "555-0101",
    role: "user",
    joinDate: "2024-11-10",
    status: "Active",
    profilePicture: "https://i.pravatar.cc/150?u=john.doe@example.com"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "555-0102",
    role: "user",
    joinDate: "2024-12-01",
    status: "Active",
    profilePicture: "https://i.pravatar.cc/150?u=jane.smith@example.com"
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@closet.com",
    phone: "555-0100",
    role: "admin",
    joinDate: "2024-10-01",
    status: "Active",
    profilePicture: "https://i.pravatar.cc/150?u=admin@closet.com"
  },
  {
    id: 4,
    name: "Suspended Sam",
    email: "sam@example.com",
    phone: "555-0103",
    role: "user",
    joinDate: "2025-01-05",
    status: "Suspended",
    profilePicture: "https://i.pravatar.cc/150?u=sam@example.com"
  }
];


export const categories = [
  { id: 1, name: "All", count: 6 },
  { id: 2, name: "Men", count: 3 },
  { id: 3, name: "Women", count: 3 }
];
