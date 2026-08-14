import express from "express";
let app = express();
app.use(express.json());

// mongo db connection
const mongoDBURI =
  "mongodb://admin:admin@ac-o01kguj-shard-00-00.rndjqi8.mongodb.net:27017,ac-o01kguj-shard-00-01.rndjqi8.mongodb.net:27017,ac-o01kguj-shard-00-02.rndjqi8.mongodb.net:27017/?ssl=true&replicaSet=atlas-pvbvb0-shard-0&authSource=admin&appName=Cluster-GLab";
import mongoose from "mongoose";
mongoose.connect(mongoDBURI).then(() => {
  console.log("Connected to MongoDB successfully ");
});

import userRouter from "./routers/userRouter.js"; // user router import
app.use("/users", userRouter);

import productRouter from "./routers/productRouter.js"; // product router import
app.use("/products", productRouter);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
