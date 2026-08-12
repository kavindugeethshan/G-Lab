import Student from "../models/Student.js"; 

export async function getStudents(req, res) {  
  console.log("Get request received");
  console.log(req.body);
  try {
    const Students = await Student.find();
    res.json(Students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createStudent(req, res) {
  console.log("Post request received");
  const newStudent = new Student(req.body);
  try {
    await newStudent.save();
    res.json({
      message: "Student saved successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateStudent(req, res) {
  console.log("Put request received");
  console.log(req.body);
  try {
    await Student.findByIdAndUpdate(req.params.id, req.body);
    res.json("Student updated successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export async function deleteStudent(req, res) {
  console.log("Delete request received");
  console.log(req.body);
  try {
    await Student.findByIdAndDelete(req.params.id); 
    res.json("Student deleted successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}