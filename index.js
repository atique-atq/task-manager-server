const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

//mongoDb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mzfy2kt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const tasksCollection = client.db("task-tracer").collection("tasks");
    const usersCollection = client.db("task-tracer").collection("users");
    //post a task
    app.post("/task", async (req, res) => {
      console.log("came here..");
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    // insert user
    app.post("/saveusers", async (req, res) => {
      const userInfo = req.body;

      //checking if user with same email address already inserted
      const query = { email: userInfo.email };
      const alreadyBooked = await usersCollection.find(query).toArray();
      if (alreadyBooked.length) {
        const message = `Already registered with email ${userInfo.email}`;
        return res.send({ acknowledged: false, message });
      }

      const result = await usersCollection.insertOne(userInfo);
      res.send(result);
    });

    //get all tasks
    app.get("/alltasks", async (req, res) => {
      console.log("shob dekhtesi");
      const query = {};
      const tasks = await tasksCollection.find(query).toArray();
      res.send(tasks);
    });

    //get my tasks
    app.get("/mytasks", async (req, res) => {
      const email = req.query.email;
      console.log("Email is:", email);
      const query = { createdEmail: email };
      const tasks = await tasksCollection.find(query).toArray();
      res.send(tasks);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Task Tracer is running");
});

app.listen(port, () => console.log(`Task Tracer is running on ${port}`));
