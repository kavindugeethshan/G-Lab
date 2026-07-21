import express from "express";
import Student from "../models/Student.js";

const studentRouter = express.Router();

studentRouter.get("/", (req, res) => {
  console.log("Get request received");
  console.log(req.body);
  Student.find().then((Students) => {
    res.json(Students);
  });
});
studentRouter.post("/", (req, res) => {
  console.log("Post request received");
  const newStudent = new Student(req.body);
  newStudent.save().then(() => {
    res.json({
      message: "Student saved successfully",
    });
  });
});
studentRouter.put("/:id", (req, res) => {
  console.log("Put request received");
  console.log(req.body);
  Student.findByIdAndUpdate(req.params.id, req.body).then(() => {
    res.json("Student updated successfully");
  });
});
studentRouter.delete("/:id", (req, res) => {
  console.log("Delete request received");
  console.log(req.body);
  Student.findByIdAndDelete(req.params.id).then(() => {
    res.json("Student deleted successfully");
  });
});

export default studentRouter;
