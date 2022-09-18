import express from "express";
import cors from "cors";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
import db from "./database/db.js";
import signup from "./routers/signuplogin.routers.js";
import login from "./routers/signuplogin.routers.js";
import products from "./routers/products.routers.js";
import addcart from "./routers/products.routers.js";
import maisvendidos from "./routers/products.routers.js";
import getcart from "./routers/products.routers.js";
import removefromcart from "./routers/products.routers.js";
import emptycart from "./routers/products.routers.js";
import configuser from "./routers/products.routers.js";
import logout from "./routers/products.routers.js";
import { ObjectId, ServerType } from "mongodb";

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

//Get Cart
server.use(getcart);

//Best Sellers - Mais vendidos
server.use(maisvendidos);

//Remove From Cart
server.use(removefromcart);

//Empty Cart
server.use(emptycart);

//Update User
server.use(configuser);

//LogOut
server.use(logout);

////////// Internal //////////
server.get('/sessions', async (req, res) => {
    try {
        const search = await db.collection('sessions').find().toArray();
        res.send(search);
    } catch (error) {
        res.send(error);
    }
});

server.delete('/deleteallsessions', async (req, res) => {
    try {
        await db.collection('sessions').deleteMany({});
        const session = db.collection('sessions').find().toArray();
        res.send(session);
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

server.get('/heroku', async (req, res) => {
    res.send('Herokuuuuuu');
});

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
            name: "Barriga em Pano Premium Taubatende2",
            description: "Barriga falsa premium totalmente feita em gel com sensação de pele ao toque, na cor bege. Modelo T212",
            image: "https://image.dhgate.com/0x0/f2/albu/g7/M00/EB/B1/rBVaSVripdSAQFnJAAEe0iY-JdA332.jpg",
            price: 250.00,
            type: "gel"
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
    await db.collection('products').deleteOne({ _id: ObjectId("6323ca8dbd9302a05c209aa0") });
    const products = await db.collection('products').find().toArray();
    res.send(products);
});

server.delete('/deleteallusers', async (req, res) => {
    await db.collection('users').deleteMany({});
    const users = await db.collection('users').find().toArray();
    res.send(users);
});

server.post('/test', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('Token not found');
        return;
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        const user = await db.collection('users').findOne({ _id: session.userId });

        if (!user) {
            res.status(401).send('User not found');
            return;
        }

        const body = {
            userId: user._id,
            name: user.name,
            email: user.email,
            date: dayjs().format('YYYY/MM/DD'),
            time: dayjs().format('HH:mm:ss'),
            cart: user.cart
        };

        res.send(body);
    } catch (error) {
        res.send(error);
    }
});

server.get('/finishedpurchases', async (req, res) => {
    try {
        const finishedPurchases = await db.collection('finishedpurchases').find().toArray();
        res.send(finishedPurchases);
    } catch (error) {
        res.send(error);
    }
});

////////// Server listen //////////
server.listen(port, () => {
    console.log("Server running on port " + port);
});

