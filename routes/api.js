const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');

// نموذج MongoDB لتخزين الإعجابات
const StockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  likes: { type: [String], default: [] },
});

const Stock = mongoose.model('Stock', StockSchema);

// وظيفة مساعدة لإخفاء عنوان IP
const anonymizeIP = (ip) => {
  if (!ip) return '';
  const hash = crypto.createHash('sha256');
  hash.update(ip);
  return hash.digest('hex');
};

// الحصول على بيانات الأسهم من الوكيل
async function getStockData(stock) {
  try {
    const response = await axios.get(
      `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
    );
    return {
      stock: stock.toUpperCase(),
      price: response.data.latestPrice.toString(),
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }
}

module.exports = function (app) {
  // الاتصال بقاعدة البيانات
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.route('/api/stock-prices').get(async (req, res) => {
    let { stock, like } = req.query;
    
    if (!stock) {
      return res.json({ error: 'Stock symbol is required' });
    }

    // معالجة متعددة للأسهم
    const stocks = Array.isArray(stock) ? stock : [stock];
    const stockData = [];
    const likesData = [];

    // أمان المعلومات: الحصول على IP العميل وإخفاءه
    const ip = anonymizeIP(req.ip);

    for (const s of stocks) {
      // الحصول على بيانات السهم
      const data = await getStockData(s);
      if (!data) {
        return res.json({ error: 'Invalid stock symbol' });
      }
      stockData.push(data);

      // معالجة الإعجابات
      let stockDoc = await Stock.findOne({ symbol: s.toUpperCase() });
      if (!stockDoc) {
        stockDoc = new Stock({ symbol: s.toUpperCase() });
      }

      if (like === 'true' && !stockDoc.likes.includes(ip)) {
        stockDoc.likes.push(ip);
        await stockDoc.save();
      }

      likesData.push({
        stock: s.toUpperCase(),
        likes: stockDoc.likes.length,
      });
    }

    // تجهيز الاستجابة بناءً على عدد الأسهم
    if (stocks.length === 1) {
      res.json({
        stockData: {
          stock: stockData[0].stock,
          price: stockData[0].price,
          likes: likesData[0].likes,
        },
      });
    } else {
      res.json({
        stockData: [
          {
            stock: stockData[0].stock,
            price: stockData[0].price,
            rel_likes: likesData[0].likes - likesData[1].likes,
          },
          {
            stock: stockData[1].stock,
            price: stockData[1].price,
            rel_likes: likesData[1].likes - likesData[0].likes,
          },
        ],
      });
    }
  });
};
