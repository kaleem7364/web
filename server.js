require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes/api');
const app = express();

// أمان المعلومات: استخدام Helmet لتحسين أمان HTTP headers
app.use(helmet());

// أمان المعلومات: تكوين CORS بشكل آمن
app.use(cors({ origin: '*' }));

// أمان المعلومات: منع تخزين ذاكرة التخزين المؤقت للبيانات الحساسة
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

apiRoutes(app);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // for testing
