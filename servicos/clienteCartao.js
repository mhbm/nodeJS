var restify = require('restify-clients');

function clienteCartao() {
    this._cliente = restify.createJsonClient({
        url: 'http://localhost:3001'
    });
}

clienteCartao.prototype.autoriza = function(cartao, callback) {
    this._cliente.post("/cartoes/autoriza", cartao, callback);
}



module.exports = function() {
    return clienteCartao;
};