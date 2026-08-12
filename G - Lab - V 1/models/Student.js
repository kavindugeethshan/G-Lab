import mongoose from "mongoose";

//mongo db schema for student

const studentschema = new mongoose.Schema({
  name: String,
  age: Number,
  city: String,
});

const Student = mongoose.model("Student", studentschema);

export default Student;