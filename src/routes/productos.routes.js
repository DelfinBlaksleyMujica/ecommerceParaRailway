//Conexion con express y Router

const Router = require("express").Router;

//Middlewares Locales

const { checkUserLogged, userNotLogged , isValidToken , soloAdmins  } = require("../middlewares/auth.middlewares");

//Router

const router = Router();

//Controllers

const { getAllProductsController , getProductByIdController , postProductController , putProductByIdController , deleteProductByIdController } = require("../controllers/products.controller");

//Endpoints

router.get('/', checkUserLogged , getAllProductsController );

router.get('/test' , getAllProductsController );

router.get('/:id', checkUserLogged , getProductByIdController );

router.post('/', soloAdmins  , postProductController );

router.put('/:id' , soloAdmins  , putProductByIdController ); 

router.delete('/:id' ,  soloAdmins  , deleteProductByIdController );

module.exports = { ProductsRouter: router  };