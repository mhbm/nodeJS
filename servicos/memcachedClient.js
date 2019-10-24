const memcached = require("memcached");

module.exports = function() {
    return createMemcachedClient;
}

function createMemcachedClient() {
    var client = new memcached("localhost:11211", {
        retries: 10, //numero de tentativa por request
        retry: 10000, //tempo de espera de uma falha de um serviço para tentar conectar com o mesmo
        remove: false //autoriza a remover o cluster um nó que nao esteja conectando (nao está disponivel)
    });
    return client;
}