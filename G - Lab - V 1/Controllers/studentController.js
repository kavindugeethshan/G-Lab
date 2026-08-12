import Student from "../models/Student.js"; 

export function getStudents(req, res) {  
  console.log("Get request received");
  console.log(req.body);
  Student.find().then((Students) => {
    res.json(Students);
  });
}

export function createStudent(req, res) {
  console.log("Post request received");
  const newStudent = new Student(req.body);
  newStudent.save().then(() => {
    res.json({
      message: "Student saved successfully",
    });
  });
}

export function updateStudent(req, res) {
  console.log("Put request received");
  console.log(req.body);
  Student.findByIdAndUpdate(req.params.id, req.body).then(() => {
    res.json("Student updated successfully");
  });
}


export function deleteStudent(req, res) {
  console.log("Delete request received");
  console.log(req.body);
  Student.findByIdAndDelete(req.params.id).then(() => {
    res.json("Student deleted successfully");
  });
}