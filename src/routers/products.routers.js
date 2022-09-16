import express from 'express';
import { GetProducts, AddCart, MaisVendidos, GetCart, RemoveFromCart, EmptyCart } from "../controllers/products.controllers.js";
const router = express.Router();

router.get('/products', GetProducts);
router.post('/addcart', AddCart);
router.get('/maisvendidos', MaisVendidos);
router.get('/getcart', GetCart);
router.post('/removefromcart', RemoveFromCart);
router.post('/emptycart', EmptyCart);

export default router;