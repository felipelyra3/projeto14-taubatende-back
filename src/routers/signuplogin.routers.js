import express from 'express';
import { SignUp, Login, ConfigUser, LogOut } from "../controllers/users.controllers.js";
const router = express.Router();

router.post('/signup', SignUp);
router.post('/login', Login);
router.put('/configuser', ConfigUser);
router.delete('/logout', LogOut);

export default router;