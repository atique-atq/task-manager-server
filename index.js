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

    //get all pending/todo tasks
    app.get("/todotasks", async (req, res) => {
      const query = { status: { $ne: "completed" } };
      const tasks = await tasksCollection.find(query).toArray();
      res.send(tasks);
    });

    //get all completed tasks
    app.get("/completedtasks", async (req, res) => {
      const query = { status: "completed" };
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

    //complete a task
    app.put("/complete", async (req, res) => {
      const id = req.query.id;
      console.log("id is:", id);
      const filter = { _id: ObjectId(id) };
      const completeTask = {
        $set: {
          status: "completed",
        },
      };
      const result = await tasksCollection.updateOne(filter, completeTask);
      res.send(result);
    });

    //make task not completed
    app.put("/notcomplete", async (req, res) => {
      const id = req.query.id;
      console.log("id is:", id);
      const filter = { _id: ObjectId(id) };
      const completeTask = {
        $set: {
          status: "not completed",
        },
      };
      const result = await tasksCollection.updateOne(filter, completeTask);
      res.send(result);
    });

    //get specific task
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const task = await tasksCollection.findOne(query);
      console.log("single task", task);
      res.send(task);
    });

    //delete a  task
    app.delete("/delete", async (req, res) => {
      const id = req.query.id;
      const filter = { _id: ObjectId(id) };
      const result = await tasksCollection.deleteOne(filter);
      res.send(result);
    });
    //update a task
    app.patch("/update", async (req, res) => {
      console.log("came in update!");
      const id = req.query.id;
      const newTask = req.body;
      const filter = { _id: ObjectId(id) };

      const updatedValue = {
        $set: {
          name: newTask.name,
          description: newTask.description,
          deadline: newTask.deadline,
        },
      };
      const result = await tasksCollection.updateOne(filter, updatedValue);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Task Tracer is running");
});

app.listen(port, () => console.log(`Task Tracer is running on ${port}`));
