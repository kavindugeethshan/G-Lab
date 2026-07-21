import express from 'express';
let app =express(); 
const mongoDBURI= "mongodb://admin:admin@ac-o01kguj-shard-00-00.rndjqi8.mongodb.net:27017,ac-o01kguj-shard-00-01.rndjqi8.mongodb.net:27017,ac-o01kguj-shard-00-02.rndjqi8.mongodb.net:27017/?ssl=true&replicaSet=atlas-pvbvb0-shard-0&authSource=admin&appName=Cluster-GLab";
import mongoose from 'mongoose';
mongoose.connect(mongoDBURI).then(
    ()=>{
        console.log("Connected to MongoDB successfully ")
    }
)
app.use(express.json());

app.get("/",(req,res)=>{
    console.log("Get request received")
    console.log(req.body)

    res.json(
        {
            message:"Get request received",
    }
)
});

app.post("/",(req,res)=>{
    console.log("Post request received")
    console.log(req.body)
      res.json(
        {
            message:"post request received",
    }
)
});

app.put("/",(req,res)=>{
    console.log("Put request received")
    console.log(req.body)
      res.json(
        {
            message:"put request received",
    }
)
});

app.delete("/",(req,res)=>{
    console.log("Delete request received")
    console.log(req.body)
      res.json(
        {
            message:"delete request received",
    }
)
});


app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
