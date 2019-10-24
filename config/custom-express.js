var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');


module.exports = function() {
    var app = express();


    app.use(bodyParser.urlencoded({ extend: true }));
    app.use(bodyParser.json());




    consign()
        .include('controller')
        .then('persistence')
        .then('servicos')
        .into(app);

    return app;
}