import express from "express";
import Student from "../models/Student.js";
//controller functions
import { getStudents, createStudent, updateStudent, deleteStudent } from "../Controllers/studentController.js";

const studentRouter = express.Router();

// get request to fetch all students
studentRouter.get("/",getStudents);

// post request to add a new student
studentRouter.post("/",createStudent);

//put request to update a student by id
studentRouter.put("/:id",updateStudent);

//delete request to delete a student by id
studentRouter.delete("/:id",deleteStudent);


export default studentRouter;
