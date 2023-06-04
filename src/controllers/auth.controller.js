//Servicios
const { UserModel } = require("../services/auth.service");

//Loggers
const { logger } = require("../loggers/loggers");

//Conexion con JWT
const jwt = require("jsonwebtoken");

//Funciones 
const getRegistroController = ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        const errorMsg = req.session.messages ? req.session.messages[ req.session.messages.length - 1 ] : "";
        /*res.render( "signup" , { error: errorMsg } );*/
        res.send({  message: errorMsg } )
        req.session.messages = [];
    } catch (error) {
        logger.error("Error en el get de registro");
        res.status(500).send({ status:"failed" , message: error.message });
    }
};

const getInicioSesionController =  ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        res.send({ status:"success" , message:"Get de inicio de sesion funcionando correctamente"});
    } catch (error) {
        logger.error("Error en el get de inicio de sesion");
        res.status(500).send({status:"failed" , message: error.message });
    }
};

const getLoginController = ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        const errorMsg = req.session.messages ? req.session.messages[ req.session.messages.length - 1 ] : "";
        /*res.render( "login" , { error: errorMsg } );*/
        res.send({ message: errorMsg })
        req.session.messages = [];
    } catch (error) {
        logger.error("Error en el get de login");
        res.status(500).send({ message: error.message });
    } 
};

const getLogoutController = ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`)
        req.session.destroy((error) => {
        if (error) {
            logger.error(error);
            /*res.redirect("/")*/
            res.send( { status:"failed" , messsage: "No se cerro la sesión correctamente" } )
        } else {
            logger.info("Se cerro la sesion correctamente");
            /*res.render("logout")*/
            res.send( { status:"success" , message: "Se cerro la sesíon correctamente"})
        }
    })
    } catch (error) {
        logger.error(`Error en el servidor en la ruta ${method} ${url}`);
        res.send({ status:"failed" , message: error.message });    }
};

const postSignupController = async ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);        
        res.send({ status:"success" , message:"Usuario registrado"})
    } catch (error) {
        logger.error("Error en el post del signup");
        res.status(500).send( { status:"failed" , message: error.message });
    };
};

const postLoginController = async ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        const { username  } = req.body;
        req.session.username = username;
        const usuarioArr = await UserModel.find( { username : username });
        const usuarioObj = usuarioArr[0];
        const usuarioName = usuarioObj.name;
        const usuarioTel = usuarioObj.telefono;
        req.session.userName = usuarioName;
        req.session.telefono = usuarioTel;
        logger.info( usuarioTel )
        jwt.sign({ username: username } , "claveToken" , { expiresIn:"7d"} , ( error , token ) => {
            req.session.acces_token = token;
            logger.info(`Token de la session: ${ req.session.acces_token }` )
        });
        res.send({status:"success" , data: username , message:`Usuario autorizado: ${ username }`})
    } catch (error) {
        logger.error("Error en la autorizacion de ingreso de usuario");
        res.status(500).send({ status:"failed" , message: error.message });
    }
};


module.exports = { getRegistroController ,getInicioSesionController , getLoginController , getLogoutController , postSignupController , postLoginController , UserModel };