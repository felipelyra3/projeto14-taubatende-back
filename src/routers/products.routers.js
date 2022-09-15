import express from 'express';
import { GetProducts, AddCart } from "../controllers/products.controllers.js";
const router = express.Router();

router.get('/products', GetProducts);
router.post('/addcart', AddCart);

export default router;