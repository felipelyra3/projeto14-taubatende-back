import express from 'express';
import { SignUp } from "../controllers/users.controllers.js";
const router = express.Router();

router.post('/signup', SignUp);

export default router;