export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  imageUrl: string;
  images: string[];
  category: string;
  subcategory: string;
  brand: string;
  stock: number;
  rating: number;
  reviewCount: number;
  features: string[];
  specifications: { [key: string]: string };
  variants?: {
    size?: string[];
    color?: string[];
  };
  tags: string[];
  isOnSale: boolean;
  isFeatured: boolean;
}

export const categories = [
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'home', name: 'Home & Kitchen', icon: '🏠' },
  { id: 'sports', name: 'Sports & Outdoors', icon: '⚽' },
  { id: 'beauty', name: 'Beauty & Personal Care', icon: '💄' },
  { id: 'toys', name: 'Toys & Games', icon: '🧸' },
  { id: 'grocery', name: 'Grocery & Essentials', icon: '🛒' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 1199.99,
    originalPrice: 1299.99,
    description: 'Latest iPhone with A17 Pro chip and titanium design',
    longDescription: 'The iPhone 15 Pro Max features the powerful A17 Pro chip, a stunning 6.7-inch Super Retina XDR display, and an advanced camera system. Built with aerospace-grade titanium for durability and style.',
    imageUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
    images: [
      'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
      'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
      'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'
    ],
    category: 'electronics',
    subcategory: 'smartphones',
    brand: 'Apple',
    stock: 25,
    rating: 4.8,
    reviewCount: 1247,
    features: ['A17 Pro Chip', '48MP Camera System', 'Titanium Design', '5G Connectivity'],
    specifications: {
      'Display': '6.7-inch Super Retina XDR',
      'Processor': 'A17 Pro',
      'Storage': '256GB',
      'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
      'Battery': 'Up to 29 hours video playback'
    },
    variants: {
      color: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium']
    },
    tags: ['smartphone', 'apple', 'premium', '5g'],
    isOnSale: true,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Samsung 65" 4K Smart TV',
    price: 799.99,
    originalPrice: 999.99,
    description: 'Crystal clear 4K display with smart TV features',
    longDescription: 'Experience stunning 4K resolution with HDR support, smart TV capabilities, and seamless streaming. Features Samsung\'s Crystal Processor 4K for enhanced picture quality.',
    imageUrl: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg',
    images: [
      'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg',
      'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg'
    ],
    category: 'electronics',
    subcategory: 'televisions',
    brand: 'Samsung',
    stock: 15,
    rating: 4.6,
    reviewCount: 892,
    features: ['4K Ultra HD', 'HDR Support', 'Smart TV', 'Voice Control'],
    specifications: {
      'Screen Size': '65 inches',
      'Resolution': '4K Ultra HD (3840 x 2160)',
      'HDR': 'HDR10+',
      'Smart Platform': 'Tizen OS',
      'Connectivity': 'Wi-Fi, Bluetooth, 3x HDMI, 2x USB'
    },
    tags: ['tv', 'samsung', '4k', 'smart'],
    isOnSale: true,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Nike Air Max 270',
    price: 149.99,
    description: 'Comfortable running shoes with Max Air cushioning',
    longDescription: 'The Nike Air Max 270 delivers all-day comfort with its large Max Air unit in the heel and lightweight mesh upper. Perfect for running, training, or casual wear.',
    imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    images: [
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
      'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg'
    ],
    category: 'sports',
    subcategory: 'footwear',
    brand: 'Nike',
    stock: 50,
    rating: 4.4,
    reviewCount: 567,
    features: ['Max Air Cushioning', 'Lightweight Mesh', 'Durable Rubber Outsole'],
    specifications: {
      'Material': 'Mesh and synthetic',
      'Sole': 'Rubber',
      'Closure': 'Lace-up',
      'Weight': '10.5 oz'
    },
    variants: {
      size: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
      color: ['Black/White', 'Navy/Red', 'Grey/Blue']
    },
    tags: ['shoes', 'nike', 'running', 'athletic'],
    isOnSale: false,
    isFeatured: false
  },
  {
    id: '4',
    name: 'KitchenAid Stand Mixer',
    price: 379.99,
    originalPrice: 449.99,
    description: 'Professional-grade stand mixer for all your baking needs',
    longDescription: 'The KitchenAid Artisan Series 5-Quart Stand Mixer is perfect for nearly any task or recipe. From mixing the heaviest bread doughs to whipping delicate egg whites.',
    imageUrl: 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg',
    images: [
      'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg',
      'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg'
    ],
    category: 'home',
    subcategory: 'kitchen',
    brand: 'KitchenAid',
    stock: 20,
    rating: 4.9,
    reviewCount: 1834,
    features: ['5-Quart Bowl', '325-Watt Motor', '10 Speeds', 'Tilt-Head Design'],
    specifications: {
      'Capacity': '5 Quart',
      'Power': '325 Watts',
      'Speeds': '10',
      'Dimensions': '14.3" x 8.7" x 14"',
      'Weight': '22 lbs'
    },
    variants: {
      color: ['Empire Red', 'Onyx Black', 'White', 'Silver']
    },
    tags: ['kitchen', 'baking', 'mixer', 'appliance'],
    isOnSale: true,
    isFeatured: true
  },
  {
    id: '5',
    name: 'Levi\'s 501 Original Jeans',
    price: 59.99,
    description: 'Classic straight-leg jeans with authentic fit',
    longDescription: 'The original blue jean since 1873. The Levi\'s 501 Original Jeans are a classic straight fit with a timeless style that never goes out of fashion.',
    imageUrl: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    images: [
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg'
    ],
    category: 'clothing',
    subcategory: 'jeans',
    brand: 'Levi\'s',
    stock: 75,
    rating: 4.3,
    reviewCount: 2156,
    features: ['100% Cotton', 'Button Fly', 'Straight Fit', 'Classic 5-Pocket Design'],
    specifications: {
      'Material': '100% Cotton',
      'Fit': 'Straight',
      'Rise': 'Mid Rise',
      'Leg Opening': '16.5"',
      'Care': 'Machine wash cold'
    },
    variants: {
      size: ['28', '29', '30', '31', '32', '33', '34', '36', '38', '40'],
      color: ['Dark Stonewash', 'Medium Stonewash', 'Light Stonewash', 'Black']
    },
    tags: ['jeans', 'denim', 'casual', 'classic'],
    isOnSale: false,
    isFeatured: false
  },
  {
    id: '6',
    name: 'Dyson V11 Vacuum Cleaner',
    price: 499.99,
    description: 'Powerful cordless vacuum with intelligent suction',
    longDescription: 'The Dyson V11 features intelligent suction that automatically adapts to different floor types, an LCD screen that shows performance data, and up to 60 minutes of run time.',
    imageUrl: 'https://images.pexels.com/photos/4107278/pexels-photo-4107278.jpeg',
    images: [
      'https://images.pexels.com/photos/4107278/pexels-photo-4107278.jpeg'
    ],
    category: 'home',
    subcategory: 'appliances',
    brand: 'Dyson',
    stock: 12,
    rating: 4.7,
    reviewCount: 743,
    features: ['Intelligent Suction', 'LCD Screen', 'Up to 60min Runtime', 'Whole-Machine Filtration'],
    specifications: {
      'Type': 'Cordless Stick',
      'Battery Life': 'Up to 60 minutes',
      'Bin Capacity': '0.76L',
      'Weight': '6.68 lbs',
      'Filtration': 'Advanced whole-machine filtration'
    },
    tags: ['vacuum', 'cordless', 'cleaning', 'dyson'],
    isOnSale: false,
    isFeatured: true
  },
  {
    id: '7',
    name: 'MacBook Air M2',
    price: 1099.99,
    originalPrice: 1199.99,
    description: 'Lightweight laptop with M2 chip and all-day battery',
    longDescription: 'The MacBook Air with M2 chip delivers incredible performance in an ultra-thin design. Features a stunning 13.6-inch Liquid Retina display and up to 18 hours of battery life.',
    imageUrl: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg',
    images: [
      'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg',
      'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg'
    ],
    category: 'electronics',
    subcategory: 'laptops',
    brand: 'Apple',
    stock: 18,
    rating: 4.8,
    reviewCount: 956,
    features: ['M2 Chip', '13.6" Liquid Retina Display', '18-hour Battery', 'MagSafe Charging'],
    specifications: {
      'Processor': 'Apple M2 chip',
      'Display': '13.6-inch Liquid Retina',
      'Memory': '8GB unified memory',
      'Storage': '256GB SSD',
      'Battery': 'Up to 18 hours'
    },
    variants: {
      color: ['Midnight', 'Starlight', 'Space Gray', 'Silver']
    },
    tags: ['laptop', 'apple', 'portable', 'm2'],
    isOnSale: true,
    isFeatured: true
  },
  {
    id: '8',
    name: 'Sony WH-1000XM4 Headphones',
    price: 279.99,
    originalPrice: 349.99,
    description: 'Industry-leading noise canceling wireless headphones',
    longDescription: 'Experience premium sound quality with industry-leading noise cancellation. The WH-1000XM4 headphones feature 30-hour battery life and touch sensor controls.',
    imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
    images: [
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'
    ],
    category: 'electronics',
    subcategory: 'audio',
    brand: 'Sony',
    stock: 35,
    rating: 4.6,
    reviewCount: 1423,
    features: ['Noise Canceling', '30-hour Battery', 'Touch Controls', 'Quick Charge'],
    specifications: {
      'Driver': '40mm',
      'Frequency Response': '4Hz-40kHz',
      'Battery Life': '30 hours',
      'Charging': 'USB-C',
      'Weight': '254g'
    },
    variants: {
      color: ['Black', 'Silver', 'Blue', 'Limited Edition']
    },
    tags: ['headphones', 'wireless', 'noise-canceling', 'sony'],
    isOnSale: true,
    isFeatured: false
  },
  {
    id: '9',
    name: 'Instant Pot Duo 7-in-1',
    price: 89.99,
    originalPrice: 119.99,
    description: 'Multi-functional electric pressure cooker',
    longDescription: 'The Instant Pot Duo combines 7 kitchen appliances in one: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.',
    imageUrl: 'https://images.pexels.com/photos/4226769/pexels-photo-4226769.jpeg',
    images: [
      'https://images.pexels.com/photos/4226769/pexels-photo-4226769.jpeg'
    ],
    category: 'home',
    subcategory: 'kitchen',
    brand: 'Instant Pot',
    stock: 40,
    rating: 4.5,
    reviewCount: 3247,
    features: ['7-in-1 Functionality', '6-Quart Capacity', '14 Smart Programs', 'Stainless Steel'],
    specifications: {
      'Capacity': '6 Quart',
      'Functions': '7-in-1',
      'Programs': '14 Smart Programs',
      'Material': 'Stainless Steel',
      'Dimensions': '13.43" x 12.4" x 12.7"'
    },
    tags: ['pressure-cooker', 'kitchen', 'multi-cooker', 'instant-pot'],
    isOnSale: true,
    isFeatured: false
  },
  {
    id: '10',
    name: 'Adidas Ultraboost 22',
    price: 189.99,
    description: 'Premium running shoes with responsive cushioning',
    longDescription: 'The Adidas Ultraboost 22 features responsive BOOST midsole cushioning and a Primeknit upper for a comfortable, adaptive fit during your runs.',
    imageUrl: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg',
    images: [
      'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg',
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
    ],
    category: 'sports',
    subcategory: 'footwear',
    brand: 'Adidas',
    stock: 60,
    rating: 4.4,
    reviewCount: 892,
    features: ['BOOST Cushioning', 'Primeknit Upper', 'Continental Rubber Outsole', 'Torsion System'],
    specifications: {
      'Midsole': 'BOOST',
      'Upper': 'Primeknit',
      'Outsole': 'Continental Rubber',
      'Drop': '10mm',
      'Weight': '11.2 oz'
    },
    variants: {
      size: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
      color: ['Core Black', 'Cloud White', 'Solar Red', 'Navy Blue']
    },
    tags: ['running', 'adidas', 'boost', 'athletic'],
    isOnSale: false,
    isFeatured: false
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.isFeatured);
};

export const getOnSaleProducts = (): Product[] => {
  return products.filter(product => product.isOnSale);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.brand.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};