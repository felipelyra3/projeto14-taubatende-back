import db from "../database/db.js";
import Joi from "joi";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";


////////// Schemas //////////
const idAddCartSchema = Joi.object({
    id: Joi.string().empty().required()
});

const idRemoveCart = Joi.object({
    id: Joi.string().empty().required()
});

const emptyCartSchema = Joi.object({
    cardName: Joi.string().empty().required(),
    cardNumber: Joi.string().alphanum().empty().required(),
    cardSecureCode: Joi.string().alphanum().empty().required(),
    totalPurchase: Joi.number().empty().required()
});

////////// Get Products //////////
async function GetProducts(req, res) {
    const products = await db.collection('products').find().toArray();
    res.send(products);
}

////////// AddCart //////////
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
    } catch (error) {
        res.status(422).send(error.message);
    }
}

////////// Remove From Cart //////////
async function RemoveFromCart(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('User not found');
        return;
    }

    try {
        await idRemoveCart.validateAsync(req.body);
        const product = await db.collection('products').findOne({ _id: ObjectId(req.body.id) });
        const session = await db.collection('sessions').findOne({ token });
        const user = await db.collection('users').findOne({ _id: session.userId });

        if (!user) {
            res.status(401).send('User not found');
            return;
        }

        await db.collection('users').updateOne({ _id: session.userId }, { $pull: { cart: { image: product.image } } });
        const user2 = await db.collection('users').findOne({ _id: session.userId });
        res.send(user2);
    } catch (error) {
        res.status(422).send(error.message);
    }
};

////////// Empty Cart //////////
async function EmptyCart(req, res) {
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

        await emptyCartSchema.validateAsync(req.body);

        const body = {
            userId: user._id,
            name: user.name,
            email: user.email,
            date: dayjs().format('YYYY/MM/DD'),
            time: dayjs().format('HH:mm:ss'),
            cart: user.cart,
            cardName: req.body.cardName,
            cardNumber: req.body.cardNumber,
            cardSecureCode: req.body.cardSecureCode,
            totalPurchase: req.body.totalPurchase
        };

        await db.collection('finishedpurchases').insertOne(body);
        await db.collection('users').updateOne({ _id: session.userId }, { $pull: { cart: {} } });

        const user2 = await db.collection('users').findOne({ _id: session.userId });
        res.send(user2);
    } catch (error) {
        res.status(422).send(error.message);
    }
};

////////// Best Sellers //////////
async function MaisVendidos(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')

    if (!token) return res.sendStatus(401)

    const sessao = await db.collection("sessions").findOne({ token })

    if (!sessao) return res.sendStatus(401)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })

    if (usuario) {

        const registros = await db.collection("bestsellers").find({}).toArray()

        return res.status(200).send({ registros, usuario })
    } else {
        return res.sendStatus(401)
    }
}

////////// Get Cart //////////
async function GetCart(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('User not found');
        return;
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        const user = await db.collection('users').findOne({ _id: session.userId });

        if (!user) {
            res.status(401).send('User not found');
            return;
        } else {
            delete user._id;
            delete user.name;
            delete user.avatar;
            delete user.email;
            delete user.password;
        }

        res.send(user);
    } catch (error) {
        res.send(error);
    }
};

export { GetProducts, AddCart, MaisVendidos, GetCart, RemoveFromCart, EmptyCart };