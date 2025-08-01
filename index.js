const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnvafd5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    // await client.connect();

    const database = client.db("shopmate-DB")
    const productsCollection = database.collection("products")
    


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully Connected to MongoDB");
  } catch {
    console.error('MongoDB connection error:', err);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('ShopMate server is running!')
})

app.listen(PORT, () => {
  console.log(`ShopMate Server Successfully deployed on port ${PORT}`)
})