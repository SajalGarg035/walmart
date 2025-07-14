const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      subcategory, 
      brand, 
      minPrice, 
      maxPrice, 
      search, 
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-reviews');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .limit(12)
    .select('-reviews');

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'username firstName lastName avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subcategories by category
router.get('/categories/:category/subcategories', async (req, res) => {
  try {
    const subcategories = await Product.aggregate([
      { $match: { category: req.params.category, isActive: true } },
      { $group: { _id: '$subcategory', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(subcategories);
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products (for shared cart)
router.get('/', async (req, res) => {
  try {
    // For demo purposes, return static product data
    // In a real app, this would query your product database
    const products = [
      {
        id: 'iphone-14-pro',
        name: 'iPhone 14 Pro',
        price: 999.99,
        images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'],
        stock: 10
      },
      {
        id: 'macbook-air-m2',
        name: 'MacBook Air M2',
        price: 1199.99,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        stock: 5
      }
      // Add more products as needed
    ];
    
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID (for shared cart)
router.get('/:id', async (req, res) => {
  try {
    // Mock product data - in real app, query your product database
    const productData = {
      'iphone-14-pro': {
        id: 'iphone-14-pro',
        name: 'iPhone 14 Pro',
        price: 999.99,
        images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'],
        stock: 10
      },
      'macbook-air-m2': {
        id: 'macbook-air-m2',
        name: 'MacBook Air M2',
        price: 1199.99,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        stock: 5
      }
    };

    const product = productData[req.params.id];
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create/update product for shared cart
router.post('/sync', async (req, res) => {
  try {
    const { externalId, name, price, images } = req.body;
    
    let product = await Product.findOne({ externalId });
    
    if (product) {
      product.name = name;
      product.price = price;
      product.images = images;
      await product.save();
    } else {
      product = new Product({
        externalId,
        name,
        price,
        images,
        tempData: true
      });
      await product.save();
    }
    
    res.json(product);
  } catch (error) {
    console.error('Sync product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;