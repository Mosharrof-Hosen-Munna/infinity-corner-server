const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const { verifyJWT } = require("./middleware");

const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project.wytfk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", (req, res) => {
  res.json("Server is running");
});

const run = async () => {
  try {
    // await client.connect();
    const database = client.db("InfinityCorner");
    const productCollections = database.collection("Products");
    const userCollections = database.collection("Users");
    const orderCollections = database.collection("Orders");
    const reportCollections = database.collection("Reports");

    // verify admin middleware
    const verifyAdmin = async (req, res, next) => {
      const email = req.user.email;
      const databaseUser = await userCollections.findOne({ email });
      if (!databaseUser?.role === "admin") {
        return res.stutus(401).json({
          message: "unauthorized access",
        });
      } else {
        next();
      }
    };

    // verify seller middleware
    const verifySeller = async (req, res, next) => {
      const email = req.user.email;
      const databaseUser = await userCollections.findOne({ email });
      if (!databaseUser?.role === "seller") {
        return res.stutus(401).json({
          message: "unauthorized access",
        });
      } else {
        next();
      }
    };

    app.get("/api/products/all", async (req, res) => {
      const products = await productCollections.find({}).toArray();
      res.json(products);
    });

    app.get("/api/seller/verify/:email", async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email);
        const updatedUser = await userCollections.updateOne(
          { email },
          { $set: { isVerified: true } }
        );
        // const updatedUser = await userCollections.findOne({email})
        const updateProducts = await productCollections.updateMany(
          { sellerEmail: email },
          { $set: { isVerified: true } }
        );
        res.json(updatedUser);
      } catch (error) {
        console.log(error);
      }
    });

    //  get user by email
    app.get("/api/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const user = await userCollections.findOne(filter);
      res.json(user);
    });

    // find seller user by role
    app.get("/api/user/seller/all",verifyJWT, async (req, res) => {
      const sellerUser = await userCollections
        .find({ role: "seller" })
        .toArray();
      res.json(sellerUser);
    });

    // will delete route
    app.get("/api/users", async (req, res) => {
      const sellerUser = await userCollections.find({}).toArray();
      res.json(sellerUser);
    });

    // find buyer user by role
    app.get("/api/user/buyer/all",verifyJWT, async (req, res) => {
      const buyerUsers = await userCollections
        .find({ role: "buyer" })
        .toArray();
      res.json(buyerUsers);
    });

    // get products for specific category by category name
    app.get("/api/products/category/:categoryName", async (req, res) => {
      try {
        const categoryName = req.params.categoryName.toLowerCase();
        const products = await productCollections
          .find({ category: categoryName })
          .toArray();
        res.json(products);
      } catch (e) {
        console.log(e);
      }
    });

    // get products for specific seller by sellerEmail
    app.get("/api/products/seller/:sellerEmail", async (req, res) => {
      try {
        const sellerEmail = req.params.sellerEmail.toLowerCase();
        const products = await productCollections
          .find({ sellerEmail })
          .toArray();
        res.json(products);
      } catch (e) {
        console.log(e);
      }
    });

    // make product as advertised
    app.get("/api/product/advertised/:productId", async (req, res) => {
      try {
        const id = req.params.productId;
        const updateProduct = await productCollections.findOneAndUpdate(
          { _id: ObjectId(id) },
          { $set: { isAdvertise: true } }
        );
        res.json(updateProduct);
      } catch (e) {
        console.log(e);
      }
    });

    // get all adverticed product
    app.get("/api/product/adverticed/all", async (req, res) => {
      try {
        const filter = { isAdvertise: true };
        const products = await productCollections.find(filter).toArray();
        res.json(products);
      } catch (e) {
        console.log(e);
      }
    });

    // TODO: add a post about ssc exam timeline

    // get all orders
    app.get("/api/orders/all", async (req, res) => {
      try {
        const allOrders = await orderCollections.find({}).toArray();
        res.json(allOrders);
      } catch (e) {
        console.log(e);
      }
    });

    // get specific user orders by user email
    app.get("/api/orders/user/:useremail",verifyJWT, async (req, res) => {
      try {
        const email = req.params.useremail;
        const filter = { buyerEmail: email };
        const orders = await orderCollections.find(filter).toArray();
        res.json(orders);
      } catch (e) {
        console.log(e);
      }
    });

    // get reported Product
    app.get("/api/product/reported-product", async (req, res) => {
      try {
        const filter = {};
        const reportedProduct = await reportCollections.find(filter).toArray();
        res.json(reportedProduct);
      } catch (e) {
        console.log(e);
      }
    });

    //   create new user
    app.post("/api/user/create", async (req, res) => {
      const userData = req.body;
      const createdUser = await userCollections.insertOne(userData);
      res.json(createdUser);
    });

    // create an user google user
    app.put("/api/user/create", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.post("/api/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.json({ token });
    });

    app.post("/api/product/create", async (req, res) => {
      const productData = req.body;
      const createdProduct = await productCollections.insertOne(productData);
      res.json(createdProduct);
    });

    // post new order
    app.post("/api/order/create", async (req, res) => {
      try {
        const orderData = req.body;
        console.log(orderData);
        const updatedProduct = await productCollections.updateOne(
          { _id: ObjectId(orderData.orderProduct._id) },
          { $set: { isAvailable: false } }
        );
        console.log(updatedProduct, req.body.orderProduct._id);
        const createdOrder = await orderCollections.insertOne(orderData);
        res.json(createdOrder);
      } catch (e) {
        console.log(e);
      }
    });

    // post reported product
    app.post("/api/report-product/create", async (req, res) => {
      try {
        const reportedProductData = req.body;
        const createdReport = await reportCollections.insertOne(
          reportedProductData
        );
        res.json(createdReport);
      } catch (e) {
        console.log(e);
      }
    });

    app.delete("/api/product/delete/:productId", async (req, res) => {
      try {
        const id = req.params.productId;
        const deletedProduct = await productCollections.findOneAndDelete({
          _id: ObjectId(id),
        });
        res.json(deletedProduct);
      } catch (e) {
        console.log(e);
      }
    });

    // delete user by user email
    app.delete("/api/user/delete/:userId", async (req, res) => {
      try {
        const userId = req.params.userId;
        const deleteUser = await userCollections.deleteOne({
          _id: ObjectId(userId),
        });
        res.json(deleteUser);
      } catch (e) {
        console.log(e);
      }
    });

    // delete report
    app.delete("/api/reported-product/delete", async(req, res) => {
      try{
        const reportId = req.query.reportId
        const productId = req.query.productId
        const filter = {_id: ObjectId(reportId)}
        const deletedReport = await reportCollections.deleteOne(filter)
        const deletedProduct = await productCollections.deleteOne({
          _id: ObjectId(productId)
        })
        res.json(deletedReport)
      }catch(e){
        console.log(e)
      }


    });
  } finally {
    // await client.close()
  }
};
run().catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});
