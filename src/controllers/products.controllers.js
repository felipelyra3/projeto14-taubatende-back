import db from "../database/db.js";
import Joi from "joi";
import { ObjectId } from "mongodb";

const idAddCartSchema = Joi.object({
    id: Joi.string().empty().required()
});

async function GetProducts(req, res) {
    const products = await db.collection('products').find().toArray();
    res.send(products);
}

async function AddCart(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('User not found');
        return;
    }

    try {
        await idAddCartSchema.validateAsync(req.body);
        const product = await db.collection('products').findOne({ _id: ObjectId(req.body.id) });
        const session = await db.collection('sessions').findOne({ token });
        const user = await db.collection('users').findOne({ _id: session.userId });

        if (!user) {
            res.status(401).send('User not found');
            return;
        }

        await db.collection('users').updateOne({ _id: session.userId }, { $push: { cart: product } });

        const user2 = await db.collection('users').findOne({ _id: session.userId });
        res.send(user2);

        /* if (!user.cart) {
            const cart = [{
                cart: product
            }];
            await db.collection('users').update({ _id: session.userId }, { $set: { cart } });
        } else {
            const cart = [...user.cart];
            cart.push({
                cart: product
            });
            await db.collection('users').update({ _id: session.userId }, { $set: { cart } });
        } */
    } catch (error) {
        res.status(422).send(error.message);
    }
}

export { GetProducts, AddCart };