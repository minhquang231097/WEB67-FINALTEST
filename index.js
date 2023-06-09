import express from 'express';
import { connectToDb, db } from './db.js';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import { YOUR_SECRET_KEY } from './constant.js';

const app = express();

// Parse JSON bodies for login API
app.use(bodyParser.json());

app.post('/api/login', (req, res) => {
   const { username, password } = req.body;

   // Check username and password against the database
   db.users.findOne({ username, password }, (err, user) => {
      if (err) {
         console.error('Error finding user:', err);
         res.status(500).json({ error: 'Internal Server Error' });
      } else if (!user) {
         res.status(401).json({ error: 'Invalid username or password' });
      } else {
         // Generate token
         const token = jwt.sign({ username }, YOUR_SECRET_KEY, {
            expiresIn: '1h',
         });

         res.json({ token });
      }
   });
});

// Middleware to validate token
const authenticateToken = (req, res, next) => {
   const token = req.headers.authorization;

   if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
   }

   jwt.verify(token, 'your_secret_key', (err, decoded) => {
      if (err) {
         return res.status(403).json({ error: 'Forbidden' });
      }

      req.user = decoded;
      next();
   });
};

// Apply middleware to the protected API endpoint
app.get('/api/orders', authenticateToken, (req, res) => {
   db.orders.find().toArray((err, result) => {
      if (err) {
         console.error('Error retrieving orders:', err);
         res.status(500).json({ error: 'Internal Server Error' });
      } else {
         res.json(result);
      }
   });
});

app.get('/api/inventory', (req, res) => {
   const query = { instock: { $lt: 100 } };
   db.inventories.find(query).toArray((err, result) => {
      if (err) {
         console.error('Error retrieving inventory:', err);
         res.status(500).json({ error: 'Internal Server Error' });
      } else {
         res.json(result);
      }
   });
});

app.get('/api/orders', authenticateToken, (req, res) => {
   db.orders
      .aggregate([
         {
            $lookup: {
               from: 'inventories',
               localField: 'item',
               foreignField: 'sku',
               as: 'product',
            },
         },
         {
            $project: {
               _id: 1,
               item: 1,
               price: 1,
               quantity: 1,
               'product.description': 1,
            },
         },
      ])
      .toArray((err, result) => {
         if (err) {
            console.error('Error retrieving orders:', err);
            res.status(500).json({ error: 'Internal Server Error' });
         } else {
            res.json(result);
         }
      });
});

app.listen(3000, () => {
   console.log('App is running at 3000');
   connectToDb();
});
