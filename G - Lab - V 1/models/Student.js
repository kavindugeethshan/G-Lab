import mongoose from "mongoose";

const studentschema = new mongoose.Schema({
  name: String,
  age: Number,
  city: String,
});

const Student = mongoose.model("Student", studentschema);

export default Student;