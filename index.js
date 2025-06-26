import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { use } from "react";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zui8vyn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("coffeeDB").collection("users");

    // get coffee
    app.get("/coffee", async (req, res) => {
      let cursor = coffeeCollection.find();
      let result = await cursor.toArray();
      res.send(result);
    });

    // add coffee
    app.post("/add", async (req, res) => {
      let coffee = req.body;
      const result = await coffeeCollection.insertOne(coffee);
      res.send(result);
    });

    // delete coffee
    app.delete("/coffee/:id", async (req, res) => {
      let id = req.params.id;

      let query = { _id: new ObjectId(id) };
      let result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // get single coffee
    app.get("/coffee/:id", async (req, res) => {
      let id = req.params.id;
      let query = { _id: new ObjectId(id) };
      let result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    // update single coffee
    app.put("/coffee/:id", async (req, res) => {
      let id = req.params.id;
      let updateCoffee = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const coffee = {
        $set: {
          name: updateCoffee.name,
          chef: updateCoffee.chef,
          supplier: updateCoffee.supplier,
          taste: updateCoffee.taste,
          category: updateCoffee.category,
          details: updateCoffee.details,
          photo: updateCoffee.photo,
        },
      };

      const result = await coffeeCollection.updateOne(filter, coffee, options);
      res.send(result);
    });

    // add user
    app.post("/user/add", async (req, res) => {
      let newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // all users
    app.get("/users", async (req, res) => {
      let cursor = userCollection.find();
      let result = await cursor.toArray();
      res.send(result);
    });

    // delete user
    app.delete("/user/:id", async (req, res) => {
      let id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // update info
    app.patch("/user/update", async (req, res) => {
      let email = req.body.email;
      let lastSignInTime = req.body.lastSignInTime;

      const filter = { email };

      const updateDoc = {
        $set: {
          lastSignInTime: lastSignInTime,
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.log(error);
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
});
