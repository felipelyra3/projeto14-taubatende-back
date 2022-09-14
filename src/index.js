import express from "express";
import cors from "cors";
import db from "./database/db.js";

const server = express();
const port = process.env.PORT || 5000;

server.use(cors());
server.use(express.json());

server.get('/', async (req, res) => {
    res.send('Aloha');
});

server.listen(port, () => {
    console.log("Server running on port " + port);
});