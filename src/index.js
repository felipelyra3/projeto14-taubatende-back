import express from "express";
import cors from "cors";
import Joi from "joi";
import bcrypt from "bcrypt";
import db from "./database/db.js";
import signup from "./routers/signup.routers.js";

const server = express();
const port = process.env.PORT || 5000;

server.use(cors());
server.use(express.json());

//Schemas

//SignUp
server.use(signup);

server.get('/', async (req, res) => {
    try {
        const search = await db.collection('users').find().toArray();
        res.send(search);
    } catch (error) {
        res.send(error);
    }
});

server.listen(port, () => {
    console.log("Server running on port " + port);
});