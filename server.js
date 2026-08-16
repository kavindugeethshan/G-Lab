import express from "express";
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";

import userRouter from "./routers/userRouter.js";
import productRouter from "./routers/productRouter.js";
import reviewRouter from "./routers/reviewRouter.js";

const app = express();
// cors error handling 
app.use(cors());
app.use(express.json());

// Create HTTP server & Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Attach io instance to app so controllers can access it via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// MongoDB connection
const mongoDBURI =
  "mongodb://admin:admin@ac-o01kguj-shard-00-00.rndjqi8.mongodb.net:27017,ac-o01kguj-shard-00-01.rndjqi8.mongodb.net:27017,ac-o01kguj-shard-00-02.rndjqi8.mongodb.net:27017/?ssl=true&replicaSet=atlas-pvbvb0-shard-0&authSource=admin&appName=Cluster-GLab";

mongoose.connect(mongoDBURI).then(() => {
  console.log("Connected to MongoDB successfully ");
});

// Routes
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/", reviewRouter);





server.listen(3001, () => {
  console.log("Server is running on port 3001");
});