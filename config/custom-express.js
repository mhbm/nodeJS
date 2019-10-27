var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var logger = require('../servicos/logger.js');

module.exports = function() {
    var app = express();

    app.use(morgan("common", {
        stream: {
            write: function(mensagem) {
                logger.info(mensagem);
            }
        }
    }));

    app.use(bodyParser.urlencoded({ extend: true }));
    app.use(bodyParser.json());


    consign()
        .include('controller')
        .then('persistence')
        .then('servicos')
        .into(app);

    return app;
}