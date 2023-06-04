//Conexion con express y Router

const Router = require("express").Router;


//Middlewares Locales

const { checkUserLogged, userNotLogged , isValidToken , soloAdmins  } = require("../middlewares/auth.middlewares");

//Router

const router = Router();

//Controllers
const { getAllCartsController , postNewCartController , deleteCartByIdController , getProductsInCartController , postProductInCartController , confirmPurchaseController, deleteProductFromCartController  } = require("../controllers/carts.controller");

//Endpoints

router.get('/', checkUserLogged , getAllCartsController );

router.post('/', checkUserLogged , postNewCartController );

router.delete('/:id', checkUserLogged , deleteCartByIdController )

//--------------------------------------------------
// router de productos en carrito

router.get('/:id/productos', checkUserLogged , getProductsInCartController );

router.post('/:id/productos', checkUserLogged , postProductInCartController);

router.post("/checkout" , checkUserLogged , confirmPurchaseController );

router.delete('/:id/productos/:idProd', checkUserLogged , deleteProductFromCartController)


module.exports = { CarritosRouter: router  };