import db from "../database/db.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

////////// Schemas //////////
const usersSchema = Joi.object({
    name: Joi.string().min(3).max(24).empty().required(),
    avatar: Joi.string().uri().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

const usersLoginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

////////// SigUp //////////
async function SignUp(req, res) {
    try {
        const search = await db.collection('users').find().toArray();
        for (let i = 0; i < search.length; i++) {
            if (search[i].name === req.body.name) {
                res.status(422).send('This name already exists');
                return;
            } else if (search[i].email === req.body.email) {
                res.status(422).send('This e-mail already exists');
                return;
            }
        };
        await usersSchema.validateAsync(req.body);
        const hashPassword = bcrypt.hashSync(req.body.password, 10);
        /* const avatar = "https://www.pikpng.com/pngl/m/16-168770_user-iconset-no-profile-picture-icon-circle-clipart.png";
        if (req.body.avatar !== '') {
            avatar = req.body.avatar;
        }; */
        const user = {
            name: req.body.name,
            avatar: req.body.avatar,
            email: req.body.email,
            password: hashPassword,
            cart: []
        };
        db.collection('users').insertOne(user);
        //res.send(user);
        res.sendStatus(201);
    } catch (error) {
        res.status(422).send(error.details.map((detail) => detail.message));
    }
}

////////// Login //////////
async function Login(req, res) {
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
}

////////// Update User //////////
async function ConfigUser(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    let { email, avatar, name, password } = req.body

    if (!email && !avatar && !name && !password) res.sendStatus(400)

    if (!token) return res.sendStatus(401)

    const sessao = await db.collection("sessions").findOne({ token })

    if (!sessao) return res.sendStatus(401)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })

    if (usuario) {

        if (!email) {
            if (avatar === "") avatar = usuario.avatar
            if (name === "") name = usuario.name
            if (password === "") password = usuario.password
            await db.collection("users").updateOne({
                _id: usuario._id
            }, { $set: { avatar, name, password } })
            return res.sendStatus(200)
        }

        else if (!avatar) {
            if (email === "") email = usuario.email
            if (name === "") name = usuario.name
            if (password === "") password = usuario.password
            await db.collection("users").updateOne({
                _id: usuario._id
            }, { $set: { email, name, password } })
            return res.sendStatus(200)
        }

        else if (!name) {
            if (email === "") email = usuario.email
            if (avatar === "") avatar = usuario.avatar
            if (password === "") password = usuario.password
            await db.collection("users").updateOne({
                _id: usuario._id
            }, { $set: { email, avatar, password } })
            return res.sendStatus(200)
        }

        else if (!password) {
            if (email === "") email = usuario.email
            if (avatar === "") avatar = usuario.avatar
            if (name === "") name = usuario.name

            await db.collection("users").updateOne({
                _id: usuario._id
            }, { $set: { email, avatar, name } })
            return res.sendStatus(200)
        }
        else {
            await db.collection("users").updateOne({
                _id: usuario._id
            }, { $set: { email, avatar, name, password } })
            return res.sendStatus(200)
        }

    } else {
        return res.sendStatus(401)
    }
}

////////// LogOut //////////
async function LogOut(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')

    if (!token) return res.sendStatus(401)

    const sessao = await db.collection("sessions").findOne({ token })

    if (!sessao) return res.sendStatus(402)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })

    if (usuario) {
        await db.collection("sessions").deleteMany({ userId: usuario._id })
        return res.status(200).send()
    } else {
        return res.sendStatus(403)
    }
}

export { SignUp, Login, ConfigUser, LogOut };