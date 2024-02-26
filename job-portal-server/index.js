const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
// console.log(process.env);
const path = require("path");

//middleware
app.use(express.json());
app.use(cors());

//user kshitijawasthi51
//password UsCRe60Yc2X3kAxc
// ip 14.139.236.226/32

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@job-portal-website.wsgptvm.mongodb.net/?retryWrites=true&w=majority&appName=job-portal-website`;

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

    //create db
    const db = client.db("mernJobPortal");
    const jobsCollections = db.collection("demoJobs");

    //post a job
    app.post("/api/post-job", async (req, res) => {
      const body = req.body;
      body.createAt = new Date();
      const result = await jobsCollections.insertOne(body);
      if (result.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again later",
          status: false,
        });
      }
    });

    //get all JObs
    app.get("/api/all-jobs", async (req, res) => {
      const jobs = await jobsCollections.find({}).toArray();
      res.send(jobs);
    });

    // get single jobs using id
    app.get("/api/all-jobs/:id", async (req, res) => {
      const id = req.params.id;
      const job = await jobsCollections.findOne({
        _id: new ObjectId(id),
      });
      res.send(job);
    });

    //get jobs by email
    app.get("/api/myJobs/:email", async (req, res) => {
      // console.log(req.params.email)
      const jobs = await jobsCollections
        .find({ postedBy: req.params.email })
        .toArray();
      res.send(jobs);
    });

    //delete a jobs
    app.delete("/api/job/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await jobsCollections.deleteOne(filter);
      res.send(result);
    });

    //update a jobs
    app.patch("/api/update-job/:id", async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...jobData,
        },
      };
      const result = await jobsCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// for deployment
const __dirName = path.resolve();
// get the current working directory's parent directory
const rootDir = path.resolve(__dirName, "..");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(rootDir, "/job-Portal-client/build")));
  app.get("*", (req, res) => {
    // console.log(__dirName);
    res.sendFile(
      path.resolve(rootDir, "job-Portal-client", "build", "index.html")
    );
  });

} else {
  app.get("/", (req, res) => {
    res.send("The server is running in development mode.");
  });
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
