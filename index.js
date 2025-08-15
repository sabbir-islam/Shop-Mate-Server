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
    const salesCollection = database.collection("sales");
    const employeeCollection = database.collection("employee");
    const supplierCollection = database.collection("supplier");

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

    // PUT /users/:email - Update user information
    app.put("/users/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const updateData = req.body;

        console.log(`[2025-08-15 11:04:04] User update request for ${email}`);

        // Basic validation
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        if (!updateData.name || !updateData.name.trim()) {
          return res.status(400).json({ message: "Name is required" });
        }

        // Check if user exists
        const existingUser = await userCollection.findOne({ email: email });

        if (!existingUser) {
          return res.status(404).json({ message: "User not found" });
        }

        console.log(`[2025-08-15 11:04:04] Found user: ${existingUser.name}`);

        // Update the user
        const result = await userCollection.updateOne(
          { email: email },
          {
            $set: {
              name: updateData.name.trim(),
              photo: updateData.photo || "",
              updatedAt: "2025-08-15 11:04:04",
            },
          }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).json({ message: "No changes made" });
        }

        // Get updated user
        const updatedUser = await userCollection.findOne({ email: email });

        console.log(
          `[2025-08-15 11:04:04] User "${updatedUser.name}" updated successfully`
        );

        res.json({
          success: true,
          message: "Profile updated successfully",
          data: updatedUser,
        });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update profile" });
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

    // Get a single product by ID
    app.get("/products/:userEmail/:productId", async (req, res) => {
      try {
        const { userEmail, productId } = req.params;

        // Log the request with current UTC time
        const currentTime = new Date();
        const formattedTime = currentTime
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        console.log(
          `[${formattedTime}] Product request by ${userEmail} for product ${productId}`
        );

        if (!ObjectId.isValid(productId)) {
          return res.status(400).send({
            success: false,
            message: "Invalid product ID format",
          });
        }

        // Find the product with both the user email and product ID
        const product = await productCollection.findOne({
          _id: new ObjectId(productId),
          userEmail: userEmail,
        });

        // If product not found or doesn't belong to this user
        if (!product) {
          return res.status(404).send({
            success: false,
            message:
              "Product not found or you don't have access to this product",
          });
        }

        // Return the product as an array with a single item (based on example response)
        res.status(200).send([product]);
      } catch (error) {
        console.error(`Error fetching product: ${error.message}`);
        res.status(500).send({
          success: false,
          message: "Failed to retrieve product",
          error: error.message,
        });
      }
    });

    // PUT /products/:userEmail/:productId - Update a specific product (SIMPLIFIED)
    app.put("/products/:userEmail/:productId", async (req, res) => {
      try {
        const { userEmail, productId } = req.params;
        const updateData = req.body;

        console.log(
          `[2025-08-15 10:36:36] Product update by ${userEmail} for ${productId}`
        );

        // Basic validation
        if (!ObjectId.isValid(productId)) {
          return res.status(400).json({ message: "Invalid product ID" });
        }

        if (
          !updateData.name ||
          !updateData.sellingPrice ||
          updateData.stock === undefined
        ) {
          return res
            .status(400)
            .json({ message: "Name, selling price, and stock are required" });
        }

        // Check if product exists and belongs to user
        const existingProduct = await productCollection.findOne({
          _id: new ObjectId(productId),
          userEmail: userEmail,
        });

        if (!existingProduct) {
          return res.status(404).json({ message: "Product not found" });
        }

        // Update the product
        const result = await productCollection.updateOne(
          { _id: new ObjectId(productId), userEmail: userEmail },
          {
            $set: {
              name: updateData.name,
              description: updateData.description || "",
              buyingPrice: updateData.buyingPrice || 0,
              sellingPrice: updateData.sellingPrice,
              stock: updateData.stock,
              category: updateData.category || "",
              image: updateData.image || "",
              updatedAt: "2025-08-15 10:36:36",
            },
          }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).json({ message: "No changes made" });
        }

        // Get updated product
        const updatedProduct = await productCollection.findOne({
          _id: new ObjectId(productId),
          userEmail: userEmail,
        });

        console.log(
          `[2025-08-15 10:36:36] Product "${updatedProduct.name}" updated successfully`
        );

        res.json({
          success: true,
          message: "Product updated successfully",
          data: updatedProduct,
        });
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product" });
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
    app.put("/products/:id", async (req, res) => {
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

    // SELLS SECTION
    // post sells data here
    app.post("/sales", async (req, res) => {
      const session = client.startSession();

      try {
        await session.withTransaction(async () => {
          const newSale = req.body;

          // Validate stock availability before processing
          for (const item of newSale.products) {
            const product = await productCollection.findOne(
              { _id: new ObjectId(item.productId) },
              { session }
            );

            if (!product) {
              throw new Error(`Product ${item.name} not found`);
            }

            if (product.stock < item.quantity) {
              throw new Error(
                `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`
              );
            }
          }

          // Insert the sale
          const saleResult = await salesCollection.insertOne(newSale, {
            session,
          });

          // Update product stock (decrease by sold quantity)
          for (const item of newSale.products) {
            await productCollection.updateOne(
              { _id: new ObjectId(item.productId) },
              { $inc: { stock: -item.quantity } },
              { session }
            );
          }

          res.send({
            success: true,
            saleId: saleResult.insertedId,
            message: "Sale completed successfully and stock updated",
          });
        });
      } catch (error) {
        console.error("Error processing sale:", error);
        res.status(500).send({
          success: false,
          message: error.message || "Failed to process sale",
          error: error.message,
        });
      } finally {
        await session.endSession();
      }
    });

    // Get all sales
    app.get("/sales", async (req, res) => {
      try {
        const result = await salesCollection
          .find()
          .sort({ saleDate: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch sales", error });
      }
    });

    // Get sales by user email
    app.get("/sales/:userEmail", async (req, res) => {
      try {
        const userEmail = req.params.userEmail;
        const result = await salesCollection
          .find({ soldBy: userEmail })
          .sort({ saleDate: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch sales", error });
      }
    });

    // Get sales analytics/summary
    app.get("/sales-summary/:userEmail", async (req, res) => {
      try {
        const userEmail = req.params.userEmail;
        const sales = await salesCollection
          .find({ soldBy: userEmail })
          .toArray();

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalQuantitySold = sales.reduce(
          (sum, sale) =>
            sum +
            sale.products.reduce((pSum, product) => pSum + product.quantity, 0),
          0
        );

        res.send({
          totalSales,
          totalRevenue,
          totalQuantitySold,
          averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        });
      } catch (error) {
        res
          .status(500)
          .send({ message: "Failed to fetch sales summary", error });
      }
    });

    // employee here
    app.post("/employees", async (req, res) => {
      try {
        const newEmployee = req.body;
        const result = await employeeCollection.insertOne(newEmployee);
        res.send(result);
      } catch (error) {
        console.error("Error adding employee:", error);
        res.status(500).send({ message: "Failed to add employee", error });
      }
    });

    app.get("/employees/:userEmail", async (req, res) => {
      try {
        const userEmail = req.params.userEmail;
        const result = await employeeCollection
          .find({ managedBy: userEmail })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).send({ message: "Failed to fetch employees", error });
      }
    });

    // Update employee
    app.put("/employees/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        const result = await employeeCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Employee not found" });
        }

        res.send({
          success: true,
          message: "Employee updated successfully",
          result,
        });
      } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).send({ message: "Failed to update employee", error });
      }
    });

    // Delete employee
    app.delete("/employees/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await employeeCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Employee not found" });
        }

        res.send({
          success: true,
          message: "Employee deleted successfully",
          result,
        });
      } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).send({ message: "Failed to delete employee", error });
      }
    });

    // SUPPLIER Section
    // Add new supplier
    app.post("/suppliers", async (req, res) => {
      try {
        const newSupplier = req.body;

        // Add current timestamp
        if (!newSupplier.createdAt) {
          newSupplier.createdAt = new Date().toISOString();
        }

        const result = await supplierCollection.insertOne(newSupplier);

        res.send({
          success: true,
          insertedId: result.insertedId,
          message: "Supplier added successfully",
        });
      } catch (error) {
        console.error("Error adding supplier:", error);
        res.status(500).send({ message: "Failed to add supplier", error });
      }
    });

    // Get suppliers by user email (show only suppliers added by current user)
    app.get("/suppliers/:userEmail", async (req, res) => {
      try {
        const userEmail = req.params.userEmail;
        const result = await supplierCollection
          .find({ createdBy: userEmail })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(500).send({ message: "Failed to fetch suppliers", error });
      }
    });

    // Update supplier
    app.put("/suppliers/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        // Add updated timestamp
        updatedData.updatedAt = new Date().toISOString();

        const result = await supplierCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Supplier not found" });
        }

        res.send({
          success: true,
          message: "Supplier updated successfully",
          result,
        });
      } catch (error) {
        console.error("Error updating supplier:", error);
        res.status(500).send({ message: "Failed to update supplier", error });
      }
    });

    // Delete supplier
    app.delete("/suppliers/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await supplierCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Supplier not found" });
        }

        res.send({
          success: true,
          message: "Supplier deleted successfully",
          result,
        });
      } catch (error) {
        console.error("Error deleting supplier:", error);
        res.status(500).send({ message: "Failed to delete supplier", error });
      }
    });

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
