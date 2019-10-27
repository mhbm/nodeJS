const { check, validationResult } = require('express-validator');

var logger = require('../servicos/logger.js');

module.exports = function(app) {
    app.get('/pagamentos', function(req, res) {
        console.log("Recebido a requisição de teste.");
        res.send('OK.');
    });

    app.get("/pagamentos/pagamento/:id", function(req, res) {

        var id = req.params.id;
        console.log("consultando pagamento: " + id);

        logger.info('consultando pagamento: ' + id);
        
        var memcachedClient = app.servicos.memcachedClient();

        memcachedClient.get('pagamento-' + id, function(erro, retorno) {
            if (erro || !retorno) {
                console.log("MISS - chave não encontrada");
                //nao encontrado no memcached entao tem que procurar no banco
                var connection = app.persistence.connectionFactory();
                var pagamentoDao = new app.persistence.PagamentoDao(connection);

                pagamentoDao.buscaPorId(id, function(erro, resultado) {
                    if (erro) {
                        console.log(erro);
                        res.status(500).send(erro);
                        return;
                    }
                    console.log('pagamento encontrado: ' + JSON.stringify(resultado));
                    res.json(resultado);
                });
                //FIM- MISS no cache
            } else {
                console.log('HIT - valor: ' + JSON.stringify(retorno));
                res.json(retorno);
                return;
            }
        });

    });

    app.delete('/pagamentos/pagamento/:id', function(req, res) {
        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CANCELADO';

        var connection = app.persistence.connectionFactory();
        var pagamentoDao = new app.persistence.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, function(erro) {
            if (erro) {
                res.status(500).send(erro);
                return;
            }

            console.log('pagamento cancelado')
            res.status(204).send(pagamento);
        });
    });

    app.put('/pagamentos/pagamento/:id', function(req, res) {

        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CONFIRMADO';

        var connection = app.persistence.connectionFactory();
        var pagamentoDao = new app.persistence.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, function(erro) {
            if (erro) {
                res.status(500).send(erro);
                return;
            }
            res.send(pagamento);
        });

    });

    app.post('/pagamentos/pagamento', [
        // username must be an email
        check('pagamento.nome').not().isEmpty().withMessage('O campo nome é obrigatório'),
        check('pagamento.forma').not().isEmpty().withMessage('O campo forma é obrigatório')
        .isLowercase("credito,debito").withMessage("O valor deve ser credito ou debito"),
        // password must be at least 5 chars long
        //  check('password').isLength({ min: 5 })
        /*
        check('valor')
        .isLength({ min: 3 }).withMessage('must be at least 3 chars long')
        .matches(/\d/).withMessage('must contain a number')
            */
        check('pagamento.valor').not().isEmpty().withMessage('O campo valor é obrigatório')
        .isCurrency().withMessage("It is not a valid currency amount"),

    ], function(req, res) {
        var teste = check('nome').isEmpty();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        var pagamento = req.body["pagamento"];
        console.log('processando uma requisicao de um novo pagamento');
        pagamento.status = 'CRIADO';
        pagamento.data = new Date;


        var connection = app.persistence.connectionFactory();
        var pagamentoDao = new app.persistence.PagamentoDao(connection);

        pagamentoDao.salva(pagamento, function(erro, resultado) {
            if (erro) {
                console.log('Erro ao inserir no banco:' + erro);
                res.status(500).send(erro);
            } else {

                pagamento.id = resultado.insertId;

                console.log('pagamento criado');

                var memcachedClient = app.servicos.memcachedClient();

                memcachedClient.set('pagamento-' + pagamento.id, pagamento, 60000, function(erro) {
                    console.log('nova chave adicionada ao cache: pagamento-' + pagamento.id);
                    return;
                });

                if (pagamento.tipo == 'cartao') {
                    var cartao = req.body["cartao"];
                    console.log(cartao);

                    var clienteCartoes = new app.servicos.clienteCartao();
                    clienteCartoes.autoriza(cartao, function(exception, request, response, retorno) {
                        console.log(retorno);
                        if (exception) {
                            console.log(exception);
                            res.status(400).send(exception);
                            return;
                        }

                        console.log(retorno);

                        res.location('/pagamentos/pagamento/' +
                            pagamento.id);

                        var response = {
                            dados_do_pagamento: pagamento,
                            cartao: retorno,
                            links: [{
                                href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                rel: "confirmar",
                                method: "PUT"
                            }, {
                                href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                                rel: "cancelar",
                                method: "DELETE"
                            }]
                        };

                        res.status(201).json(response);
                    });
                } else {

                    res.location('/pagamentos/pagamento/' +
                        pagamento.id);

                    var response = {
                        dados_do_pagamento: pagamento,
                        links: [{
                            href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                            rel: "confirmar",
                            method: "PUT"
                        }, {
                            href: "http://localhost:3000/pagamentos/pagamento/" + pagamento.id,
                            rel: "cancelar",
                            method: "DELETE"
                        }]
                    };

                    res.status(201).json(response);

                }
            }
        });

    });
}