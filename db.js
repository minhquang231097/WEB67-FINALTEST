import { MongoClient } from 'mongodb';

const db = {};
const uri =
   'mongodb+srv://minhquang231097:Chrono%40e650@cluster0.8fsusfq.mongodb.net/';

const connectToDb = async () => {
   const client = new MongoClient(uri);
   try {
      await client.connect();
      const database = client.db('store.product');
      db.inventories = database.collection('inventories');
      db.orders = database.collection('orders');
      db.users = database.collection('users');

      // Import inventory data
      const inventoryData = [
         { _id: 1, sku: 'almonds', description: 'product 1', instock: 120 },
         { _id: 2, sku: 'bread', description: 'product 2', instock: 80 },
         { _id: 3, sku: 'cashews', description: 'product 3', instock: 60 },
         { _id: 4, sku: 'pecans', description: 'product 4', instock: 70 },
      ];

      await db.inventories.insertMany(inventoryData);
      console.log('Inventory data imported successfully');

      // Import order data
      const orderData = [
         { _id: 1, item: 'almonds', price: 12, quantity: 2 },
         { _id: 2, item: 'pecans', price: 20, quantity: 1 },
         { _id: 3, item: 'pecans', price: 20, quantity: 3 },
      ];

      await db.orders.insertMany(orderData);
      console.log('Order data imported successfully');
   } catch (err) {
      console.error('Error connecting to MongoDB:', err);
   } finally {
      await client.close();
   }
};

export { connectToDb, db };
