import express from "express";
import cors from "cors";
import db from "./database/db.js";

const server = express();

server.use(cors());
server.use(express.json());

console.log(process.env.MONGO_URI);
console.log(process.env.PORT);

server.get('/', async (req, res) => {
    res.send('AAAAAAA');
});

server.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});