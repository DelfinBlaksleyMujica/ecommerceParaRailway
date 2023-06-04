//Conexion con express y Router

const Router = require("express").Router;

//Middlewares Locales

const { checkUserLogged, userNotLogged , isValidToken , soloAdmins  } = require("../middlewares/auth.middlewares");

//Router

const router = Router();

//Controllers

const { getAllMessagesController , postMessageController } = require("../controllers/mensajes.controller");

//Endpoints

router.get('/', checkUserLogged , getAllMessagesController );

router.post('/', checkUserLogged , postMessageController );


module.exports = { MessageRouter: router  };