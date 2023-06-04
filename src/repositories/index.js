const { MensajesRepository } = require("./mensajes/mensajes.repository");
const { getDaos } = require("../daos/factory");
const { options } = require("../config/options");

const { mensajeDao } = getDaos( options.server.persistence );

const MensajesService = new MensajesRepository( mensajeDao );

module.exports = { MensajesService };