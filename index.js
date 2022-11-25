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
    const userCollections = database.collection('Users')

     app.get('/api/products/all',async(req,res)=>{
        const products = await productCollections.find({}).toArray()
        res.json(products)
     })

     app.get('/api/seller/verify/:email',async(req,res)=>{
        try {
          const email = req.params.email
        const updatedUser = await userCollections.findOneAndUpdate({email},{$set:{isVerified:true}})
        const updateProducts = await productCollections.updateMany({sellerEmail:email},{$set:{isVerified:true}})
        console.log(updateProducts)
        res.json(updatedUser)
        } catch (error) {
          console.log(error)
        }
     })

    //  get user by email
    app.get('/api/user/:email',async (req,res)=>{
      const email = req.params.email
      const filter = {email}
      const user = await userCollections.findOne(filter)
      res.json(user)
    }) 


    
    // find seller user by role
    app.get('/api/user/seller/all',async(req,res)=>{
    
        const sellerUser = await userCollections.find({role:'seller'}).toArray()
        res.json(sellerUser)
      
    })

    // will delete route
    app.get('/api/users',async(req,res)=>{
    
      const sellerUser = await userCollections.find({}).toArray()
      res.json(sellerUser)
    
  })

    // find buyer user by role
    app.get('/api/user/buyer/all',async(req,res)=>{
    
      const buyerUsers = await userCollections.find({role:'buyer'}).toArray()
      res.json(buyerUsers)
    
  })

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

      app.post('/api/product/create',async(req,res)=>{
        const productData = req.body
        const createdProduct = await productCollections.insertOne(productData)
        res.json(createdProduct)
      })

      app.delete('/api/product/delete/:productId',async(req,res)=>{
        try{
          const id = req.params.productId
          const deletedProduct = 
        }catch(e){
          console.log(e)
        }
      })

     
  
       
    } finally {
      // await client.close()
    }
  };
  run().catch((err) => console.log(err));
  
  app.listen(PORT, () => {
    console.log("server is running on port", PORT);
  }); 