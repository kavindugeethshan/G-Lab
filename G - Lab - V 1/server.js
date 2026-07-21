import express from "express";
let app = express();
app.use(express.json());

const mongoDBURI =
  "mongodb://admin:admin@ac-o01kguj-shard-00-00.rndjqi8.mongodb.net:27017,ac-o01kguj-shard-00-01.rndjqi8.mongodb.net:27017,ac-o01kguj-shard-00-02.rndjqi8.mongodb.net:27017/?ssl=true&replicaSet=atlas-pvbvb0-shard-0&authSource=admin&appName=Cluster-GLab";
import mongoose from "mongoose";
mongoose.connect(mongoDBURI).then(() => {
  console.log("Connected to MongoDB successfully ");
});

import Student from "./models/Student.js";

import studentRouter from "./routers/studentRouter.js";
app.use("/students", studentRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
