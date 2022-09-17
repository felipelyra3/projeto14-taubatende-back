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
import maisvendidos from "./routers/products.routers.js";
import getcart from "./routers/products.routers.js";
import removefromcart from "./routers/products.routers.js";
import emptycart from "./routers/products.routers.js";
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

server.put("/configuser", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    let { email, avatar, name, password } = req.body

    if(!email && !avatar && !name && !password ) res.sendStatus(400)
    
    if (!token) return res.sendStatus(401)

    const sessao = await db.collection("sessions").findOne({ token })

    if (!sessao) return res.sendStatus(401)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })

    if (usuario) {

        if(!email){
            if(avatar === "") avatar = usuario.avatar
            if(name === "") name = usuario.name
            if(password === "") password = usuario.password
            await db.collection("users").updateOne({ 
                _id: usuario._id 
            }, { $set: {avatar, name, password} })
            return res.sendStatus(200)
        }
    
        else if(!avatar){
            if(email === "") email = usuario.email
            if(name === "") name = usuario.name
            if(password === "") password = usuario.password
            await db.collection("users").updateOne({ 
                _id: usuario._id 
            }, { $set: {email, name, password} })
            return res.sendStatus(200)
        }
    
        else if(!name){
            if(email === "") email = usuario.email
            if(avatar === "") avatar = usuario.avatar
            if(password === "") password = usuario.password
            await db.collection("users").updateOne({ 
                _id: usuario._id 
            }, { $set: {email, avatar, password} })
            return res.sendStatus(200)
        }
    
        else if(!password ){
            if(email === "") email = usuario.email
            if(avatar === "") avatar = usuario.avatar
            if(name === "") name = usuario.name
            
            await db.collection("users").updateOne({ 
                _id: usuario._id 
            }, { $set: {email, avatar, name} })
            return res.sendStatus(200)
        }
        else{
            await db.collection("users").updateOne({ 
                _id: usuario._id 
            }, { $set: {email, avatar, name, password} })
            return res.sendStatus(200)
        }
        
    } else {
        return res.sendStatus(401)
    }

    

    

    
    
})

server.delete("/logout", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    
    if(!token) return res.sendStatus(401)
    
    const sessao = await db.collection("sessions").findOne({ token })

    if(!sessao) return res.sendStatus(402)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })
    
    if(usuario){
        await db.collection("sessions").deleteMany({userId: usuario._id})
        return res.status(200).send()
    }else{
        return res.sendStatus(403)
    }
})

////////// Server listen //////////
server.listen(port, () => {
    console.log("Server running on port " + port);
});

