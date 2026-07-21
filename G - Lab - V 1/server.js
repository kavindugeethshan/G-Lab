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

app.get("/", (req, res) => {
  console.log("Get request received");
  console.log(req.body);

  Student.find().then((Students) => {
    res.json(Students);
  });
});

app.post("/", (req, res) => {
  console.log("Post request received");

  const newStudent = new Student(req.body);
  newStudent.save().then(() => {
    res.json({
      message: "Student saved successfully",
    });
  });
});

app.put("/:id", (req, res) => {
  console.log("Put request received");
  console.log(req.body);

  Student.findByIdAndUpdate(req.params.id, req.body).then(() => {
    res.json("Student updated successfully");
  });
});

app.delete("/:id", (req, res) => {
  console.log("Delete request received");
  console.log(req.body);
  Student.findByIdAndDelete(req.params.id).then(() => {
    res.json("Student deleted successfully");
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
