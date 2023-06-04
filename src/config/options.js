
//Yargs
const argumentos = process.argv.slice(2);
const Yargs = require("yargs/yargs")(argumentos);

const args = Yargs
    .default({
        m:"FORK",
        e:"dev"
    })
    .alias({
        m:"modo",
        e:"entorno"
    })
    .argv;

    //Dotenv
const dotenv = require("dotenv");

// const envFile = args.entorno == "dev" ? ".env.development" : ".env.production";

switch ( args.entorno ) {
    case "dev":
        envFile = ".env.development";
        break;
    case "prod":
        envFile = ".env.production";
        break;
    case "test":
        envFile = ".env.test"
        break;
}

dotenv.config({
    path:envFile
});
const options = {
    server: {
        PORT: process.env.PORT || 8080,
        MODO:args.modo,
        ENV: process.env.NODE_ENV,
        persistence: process.env.PERSISTENCE
    },
    mongo: {
        url: process.env.MONGO_URL,
        options:{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    filesystem: {
        productsPath: process.env.PRODUCTS_FILE_PATH,
        cartsPath: process.env.CARTS_FILE_PATH,
        mensajesPath: process.env.MENSAJES_FILE_PATH
    },
    session: {
        secret: process.env.SECRET_SESSION,
        salt: process.env.SALT
    },
    twilio: {
        accountId: process.env.TWILIO_ACCOUNT_ID,
        accountToken: process.env.TWILIO_ACCESS_TOKEN,
        Wapp: process.env.TWILIO_WAPP_NUM,
        adminWapp: process.env.TWILIO_ADMINWAPP_NUM,
        phone: process.env.TWILIO_NUM
    },
    nodemailer: {
        adminEmail: process.env.ADMIN_EMAIL,
        adminPassEmail: process.env.ADMIN_PASS_EMAIL,
    }
}


module.exports = { options };