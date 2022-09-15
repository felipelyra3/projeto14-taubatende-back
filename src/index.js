import express from "express";
import cors from "cors";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import db from "./database/db.js";
import signup from "./routers/signup.routers.js";

const server = express();
const port = process.env.PORT || 5000;

server.use(cors());
server.use(express.json());

//Schemas
const usersLoginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

//SignUp
server.use(signup);

//Login
server.post('/login', async (req, res) => {
    const user = await db.collection('users').findOne({ email: req.body.email });
    if (!user) {
        res.status(422).send('E-mail or password not found');
        return;
    }

    try {
        await usersLoginSchema.validateAsync(req.body);
        const compare = bcrypt.compareSync(req.body.password, user.password);
        if (compare) {
            const token = uuidv4();
            db.collection('sessions').insertOne({ userId: user._id, token: token, user: user.name });
            res.status(200).send(token);
        } else {
            res.status(422).send(compare);
        }
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
});

server.get('/login', async (req, res) => {
    try {
        const search = await db.collection('sessions').find().toArray();
        res.send(search);
    } catch (error) {
        res.send(error);
    }
});

server.get('/', async (req, res) => {
    try {
        const search = await db.collection('users').find().toArray();
        res.send(search);
    } catch (error) {
        res.send(error);
    }
});

server.get("/maisvendidos", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    
    if(!token) return res.sendStatus(401)
    
    const sessao = await db.collection("sessions").findOne({ token })

    if(!sessao) return res.sendStatus(401)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })

    if(usuario){

        const registros = await db.collection("bestsellers").find({}).toArray()

        return res.status(200).send({registros, usuario})
    }else{
        return res.sendStatus(401)
    }
})

server.listen(port, () => {
    console.log("Server running on port " + port);
});

