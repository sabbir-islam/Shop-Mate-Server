const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnvafd5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("shopmate-DB");
    const userCollection = database.collection("user");
    const productCollection = database.collection("product");

    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to create user", error });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch users", error });
      }
    });

    // Product endpoints
    app.post("/products", async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await productCollection.insertOne(newProduct);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to create product", error });
      }
    });

    app.get("/products", async (req, res) => {
      try {
        const result = await productCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch products", error });
      }
    });

    app.get("/products/:userEmail", async (req, res) => {
      try {
        const userEmail = req.params.userEmail;
        const result = await productCollection.find({ userEmail }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch products", error });
      }
    });

    // Update product stock
    app.patch("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { stock } = req.body;
        const result = await productCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { stock } }
        );
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to update product", error });
      }
    });

    // sale data here 

    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ShopMate server is running!");
});

app.listen(PORT, () => {
  console.log(`ShopMate Server Successfully deployed on port ${PORT}`);
});