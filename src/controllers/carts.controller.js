//Servicios
const { CartService } = require("../services/carts.service");
const { ProductsService } = require("../services/products.service");

//Loggers

const { logger } = require("../loggers/loggers");

//Mensajeria

const { transporter , adminEmail } = require("../mensajeria/gmail");
const { adminWapp  , twilioClient , twilioWapp , twilioPhone } = require("../mensajeria/twilio");


//Funciones

const getAllCartsController = async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        const carritos = await CartService.getCarts();
        if ( carritos.length == 0) {
            logger.info("No hay carritos para mostrar");
            return res.status(400).send( { status:"failed" , data: null , message: "No hay carritos para mostrar"})
        } else {
            logger.info("Se muestran todos los carritos correctamente");
            return res.status(200).send({ status:"success" , data: carritos , message:"Se trajeron todos los carritos correctamente" });
        }
        
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } para traer carritos`)
        res.status(500).send({ status:"failed",  message: error.message });
    }  
};

const postNewCartController = async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        const nuevoCarrito = await CartService.saveNewCart();
        req.session.carrito = nuevoCarrito;
        logger.info(`Carrito nuevo agregado a la base de datos: ${ nuevoCarrito }`);
        return res.status(200).send( { status:"success" , data: nuevoCarrito , message:"Se creo carrito nuevo correctamente" } )
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } para postear carrito`)
        res.status(500).send({ status:"failed" , message : error.message })
    }
};

const deleteCartByIdController = async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.params) {
            const { id } = req.params;
            const carrito = await CartService.getCartById( id );
            if (carrito) {
                const deletedCart = await CartService.deleteCart( id );
                logger.info(`Se elimino correctamente el carrito "${carrito.id}" de la base de datos`);
                res.status(200).send({ status:"success" , data: deletedCart , message:`Se elimino correctamente el carrito con id: ${ id }` });
            } else {
                logger.warn(`No se encontro un carrito con id: ${ id } para eliminar`);
                res.status(404).send({ status:"failed" , data: null , message:`No existe carrito con id: ${id} por lo cual no se pudo eliminar`})
            }
        }
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } para borrar carrito por id`)
        res.status(500).send( { status:"failed" , message: error.message } )
    }
};

const getProductsInCartController = async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.params) {
            const { id } = req.params;
            const carrito = await CartService.getCartById( id );
            if ( carrito == null ) {
                logger.warn(`No se encontro el carrito con id: ${ id } por lo que no pudieron traerse los productos`);
                return res.status(404).send({ status:"failed" , data: null , message:"No se pueden traer los productos ya que el carrito solicitado no existe"});
            } else {
                logger.info(carrito.productos);
                return res.status(200).send( { status:"success" , data: carrito.productos , message:"Se trajeron todos los productos del carrito correctamente" } );
            }
        }
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } para traer productos de carrito`)
        res.status(500).send( { status:"failed" , message: error.message } )
    }
};

const postProductInCartController = async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.params) {
            const { id } = req.params;
            const producto = await ProductsService.getProductById( id );
            if (producto == null) {
                logger.warn(`No se encontro producto con id: ${ id } en la base de datos`);
                return res.status(404).send({ status:"failed" , data: producto , message:"No se encontro un producto con dicho id por lo que no puede añadirse al carrito"});
            } else {
                const carritoId = req.session.carrito._id;
                if ( carritoId ) {
                    req.session.carrito.productos.push(producto);
                    logger.info( producto );  
                    const newProduct = await CartService.addProduct( producto )
                    const newProductObj = JSON.stringify( newProduct)
                    return res.send({ status:"success" , data: producto , message:"Se agrego correctamente el producto al carrito"  })
                } else {
                    logger.warn("No se creo un carrito para la session, por lo tanto no se pudo agregar un producto cuando se solicito");
                    return res.send({ status:"succes" , data: null , message:"No hay un carrito creado en la session, por lo tanto no se puede agregar el producto"});
                }
            }
        }
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } para cargar producto en carrito`)
        res.status(500).send( { status:"failed" , error: error.message } )
    }    
};

const confirmPurchaseController = async ( req , res ) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.params) {
            const productosEnCartDeSession = req.session.carrito.productos;
            console.log( productosEnCartDeSession );
            const productosEnCarrito = JSON.stringify(req.session.carrito.productos);
            //Envio de Mail

            let listadoProductosWapp = productosEnCartDeSession.map( ( producto ) => {
                const { id , nombre , descripcion , precio , stock } = producto;
                return (
                    `PRODUCTO ${ id }
-Nombre: ${ nombre }
-Descripción:${ descripcion }
-Precio: $${ precio }
-Stock: ${ stock }
                    `
                )
            });

            let listadoProductosMail = productosEnCartDeSession.map( ( producto ) => {
                const { id , nombre , descripcion , precio , stock } = producto;
                return(
                    `
                        <tr>
                            <td>${ id }</td>
                            <td>${ nombre }</td>
                            <td>${ descripcion }</td>
                            <td>$${ precio }</td>
                            <td>${ stock }</td>
                        </tr>
                    `
                )
            });

            const nuevoPedido = `
                <div>
                    <h1>¡Nuevo Pedido!</h1>
                    <h2>Se realizo un nuevo pedido</h2>
                    <h3>Los datos del pedido son los siguientes:</h3>
                    <table>
                        <tr>
                            <th>ID Producto</th>
                            <th>Nombre</th>
                            <th>Descripcion</th>
                            <th>Precio</th>
                            <th>Stock</th>
                        </tr>
                        ${ listadoProductosMail }
                    </table>
                </div>`
            /*Estructura del correo*/
            const mailOptions = {
                from:"Activá E-Commerce",
                to: adminEmail,
                subject: `Nuevo Pedido de: ${ req.session.username } + ${ req.session.userName } `,
                html: nuevoPedido
            }
            await transporter.sendMail( mailOptions );
            //Envio de Whats App
            const infoWapp = await twilioClient.messages.create({
                from: twilioWapp,
                to: adminWapp,
                body:   
                `Nuevo pedido de: ${ req.session.username } + ${ req.session.userName }.

Se incluyen los siguientes productos: 
${ listadoProductosWapp}`
            });
            //Envio de mensaje al cliente
            const infoMensaje = await twilioClient.messages.create({
                from: twilioPhone,
                to: `$+549${req.session.telefono}`,
                body:"El pedido fue recibido correctamente y se encuentra en proceso."
            })
            res.status(200).send( { status:"succes" , data: req.session.carrito.productos , message:"Se realizo correctamente el pedido de compra" } )
        }
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } para enviar mensajes de confirmacion de compra`)
        res.status(500).send( { status:"failed" , message: error.message } )
    }
};

const deleteProductFromCartController = async (req, res) => {
    const { url , method } = req;
    try {
        logger.info(`Ruta ${ method } ${ url } visitada`);
        if (req.params) {
            const { id , idProd } = req.params;
            const cart = await CartService.getCartById( id );
            if ( cart == null ) {
                logger.warn(`No se encontro el carrito de id: ${ id } para eliminar el producto de id: ${ idProd }`);
                return res.status(404).send({ status:"failed" , data: null , message:"No existe un carrito con dicho id en la base de datos"})
            } else {
                const carritoEnSession = req.session.carrito;
                if (carritoEnSession == undefined) {
                    logger.warn("No se creo un carrito en la session");
                    return res.status(400).send({ status:"failed" , data: null , message:"No hay carrito en la session por lo que no se pueden eliminar productos"});
                }else {
                    const productosEnCarritoSession = req.session.carrito.productos;
                    console.log( productosEnCarritoSession );
                    const producto = productosEnCarritoSession.find( ( producto ) => producto.id == idProd );
                    if ( !producto ) {
                        logger.warn(`No existe un producto de id: ${ idProd } en el carrito de la session`);
                        return res.status(404).send({ status:"failed" , data:null , message:"No hay un producto con dicho id en el carrito de la session"});
                    } else {
                        req.session.carrito.productos = productosEnCarritoSession.filter( ( el ) => el.id != producto.id );
                        const removedProd = await CartService.removeProduct( id , idProd );
                        logger.info( removedProd );
                        return res.status(200).send( {status:"success" ,  data: removedProd , message:`Se elimino correctamente el producto de id: ${ id } del carrito` } )
                    }
                }
            }
        }
    } catch (error) {
        logger.error(`Error en el servidor para acceder a la ruta ${ method } ${ url } para borrar producto de carrito`)
        res.status(500).send( { status:"failed" , error: error.message });
    }
}


module.exports = { getAllCartsController , postNewCartController , deleteCartByIdController , getProductsInCartController , postProductInCartController , confirmPurchaseController , deleteProductFromCartController };

