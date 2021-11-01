const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.prbxk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("TRAVEL_FOREST");
    const courses_Collection = database.collection("courses");
    const cart_Collection = database.collection("cart");

    // get api

    app.get("/courses", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = req.query.page;
      const cursor = courses_Collection.find({});
      const count = await cursor.count();
      let courses;

      if (size && page) {
        courses = await cursor
          .skip(size * page)
          .limit(size)
          .toArray();
      } else {
        courses = await cursor.toArray();
      }
      res.json({ count, courses });
    });

    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const course = await courses_Collection.findOne(query);
      res.json(course);
    });

    app.get("/cart/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.find(query).toArray();
      res.json(result);
    });

    app.post("/course/add", async (req, res) => {
      const course = req.body;
      const result = await cart_Collection.insertOne(course);
      res.json(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cart_Collection.deleteOne(query);
      res.json(result);
    });

    app.delete("/purchase/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.deleteMany(query);
      res.json(result);
    });

    app.get("/orders", async (req, res) => {
      const result = await cart_Collection.find({}).toArray();
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running on port", port);
});
