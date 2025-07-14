const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: "Samsung 65\" 4K Smart TV",
    description: "Experience stunning 4K resolution with HDR support and smart TV capabilities.",
    price: 799.99,
    originalPrice: 999.99,
    category: "electronics",
    subcategory: "televisions",
    brand: "Samsung",
    images: [
      {
        url: "https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg",
        alt: "Samsung 4K TV"
      }
    ],
    stock: 25,
    sku: "SAM-TV-65-4K",
    specifications: [
      { key: "Screen Size", value: "65 inches" },
      { key: "Resolution", value: "4K Ultra HD" },
      { key: "Smart TV", value: "Yes" }
    ],
    rating: { average: 4.5, count: 123 },
    tags: ["electronics", "tv", "smart", "4k"],
    isFeatured: true,
    discount: 20
  },
  {
    name: "Apple iPhone 15 Pro",
    description: "The most advanced iPhone with A17 Pro chip and titanium design.",
    price: 999.99,
    category: "electronics",
    subcategory: "smartphones",
    brand: "Apple",
    images: [
      {
        url: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg",
        alt: "iPhone 15 Pro"
      }
    ],
    stock: 50,
    sku: "APL-IP15-PRO",
    specifications: [
      { key: "Storage", value: "128GB" },
      { key: "Processor", value: "A17 Pro" },
      { key: "Camera", value: "48MP Pro" }
    ],
    rating: { average: 4.8, count: 87 },
    tags: ["electronics", "smartphone", "apple", "ios"],
    isFeatured: true
  },
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes with Max Air cushioning for all-day comfort.",
    price: 149.99,
    category: "sports",
    subcategory: "footwear",
    brand: "Nike",
    images: [
      {
        url: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
        alt: "Nike Air Max 270"
      }
    ],
    stock: 100,
    sku: "NIKE-AM270",
    specifications: [
      { key: "Size Range", value: "US 6-13" },
      { key: "Material", value: "Synthetic" },
      { key: "Sole", value: "Rubber" }
    ],
    rating: { average: 4.3, count: 256 },
    tags: ["sports", "shoes", "nike", "running"],
    isFeatured: false
  },
  {
    name: "KitchenAid Stand Mixer",
    description: "Professional-grade stand mixer perfect for baking and cooking.",
    price: 379.99,
    originalPrice: 449.99,
    category: "home",
    subcategory: "kitchen",
    brand: "KitchenAid",
    images: [
      {
        url: "https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg",
        alt: "KitchenAid Stand Mixer"
      }
    ],
    stock: 30,
    sku: "KA-MIXER-PRO",
    specifications: [
      { key: "Capacity", value: "5 Quart" },
      { key: "Power", value: "325 Watts" },
      { key: "Attachments", value: "3 Included" }
    ],
    rating: { average: 4.7, count: 189 },
    tags: ["home", "kitchen", "baking", "mixer"],
    isFeatured: true,
    discount: 15
  },
  {
    name: "Levi's 501 Original Jeans",
    description: "Classic straight-leg jeans with the authentic fit and style.",
    price: 59.99,
    category: "clothing",
    subcategory: "jeans",
    brand: "Levi's",
    images: [
      {
        url: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
        alt: "Levi's 501 Jeans"
      }
    ],
    stock: 75,
    sku: "LEVI-501-ORIG",
    specifications: [
      { key: "Material", value: "100% Cotton" },
      { key: "Fit", value: "Straight" },
      { key: "Rise", value: "Mid Rise" }
    ],
    rating: { average: 4.2, count: 342 },
    tags: ["clothing", "jeans", "denim", "casual"],
    isFeatured: false
  },
  {
    name: "Dyson V11 Vacuum Cleaner",
    description: "Powerful cordless vacuum with intelligent suction and LCD screen.",
    price: 499.99,
    category: "home",
    subcategory: "appliances",
    brand: "Dyson",
    images: [
      {
        url: "https://images.pexels.com/photos/4107278/pexels-photo-4107278.jpeg",
        alt: "Dyson V11 Vacuum"
      }
    ],
    stock: 20,
    sku: "DYS-V11-CORD",
    specifications: [
      { key: "Type", value: "Cordless" },
      { key: "Battery Life", value: "Up to 60 minutes" },
      { key: "Bin Capacity", value: "0.76L" }
    ],
    rating: { average: 4.6, count: 98 },
    tags: ["home", "cleaning", "vacuum", "cordless"],
    isFeatured: true
  }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/walmart-ecommerce');
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData();