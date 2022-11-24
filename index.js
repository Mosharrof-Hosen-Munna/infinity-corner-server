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
     
  
      app.post("/api/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        res.json({ token });
      });
  
       
    } finally {
      // await client.close()
    }
  };
  run().catch((err) => console.log(err));
  
  app.listen(PORT, () => {
    console.log("server is running on port", PORT);
  }); 