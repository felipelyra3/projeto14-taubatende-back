import express from "express";
import cors from "cors";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import db from "./database/db.js";
import signup from "./routers/signuplogin.routers.js";
import login from "./routers/signuplogin.routers.js";
import products from "./routers/products.routers.js";
import addcart from "./routers/products.routers.js";
import { ObjectId } from "mongodb";

const server = express();
const port = process.env.PORT || 5000;

server.use(cors());
server.use(express.json());

//Schemas

////////// User Controllers //////////
//SignUp
server.use(signup);

//Login
server.use(login);

////////// Products Controllers //////////
//Get products
server.use(products);

//Add to cart
server.use(addcart);

////////// Internal //////////
server.get('/sessions', async (req, res) => {
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

// Product Register //
const productEntrySchema = Joi.object({
    name: Joi.string().empty().required(),
    description: Joi.string().empty().required(),
    image: Joi.string().empty().uri().required(),
    price: Joi.number().empty().required(),
    type: Joi.string().empty().valid('fabric', 'plastic', 'gel', 'latex').required()
});

server.post('/products', async (req, res) => {
    try {
        const product = {
            name: "Barriga em látex Premium Taubatende",
            description: "Barriga falsa premium totalmente feita em látex com sensação de pele ao toque, na cor bege. Modelo T212",
            image: "https://image.dhgate.com/0x0/f2/albu/g7/M00/EB/B1/rBVaSVripdSAQFnJAAEe0iY-JdA332.jpg",
            price: 489.99,
            type: "latex"
        };
        await productEntrySchema.validateAsync(product);
        db.collection('products').insertOne(product);
        const products = await db.collection('products').find().toArray();
        res.status(201).send(products);
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
});

server.delete('/products', async (req, res) => {
    await db.collection('products').deleteOne({ _id: ObjectId("6322f6ef21c80a6290ddb861") });
    const products = await db.collection('products').find().toArray();
    res.send(products);
});

server.delete('/deleteallusers', async (req, res) => {
    await db.collection('users').deleteMany({});
    const users = await db.collection('users').find().toArray();
    res.send(users);
});

////////// Server listen //////////
server.listen(port, () => {
    console.log("Server running on port " + port);
});

