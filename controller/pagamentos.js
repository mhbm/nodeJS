const { check, validationResult } = require('express-validator');

module.exports = function(app) {
    app.get('/pagamentos', function(req, res) {
        console.log("Recebido a requisição de teste.");
        res.send('OK.');
    });

    app.post('/pagamentos/pagamento', [
        // username must be an email
        check('nome').not().isEmpty().withMessage('O campo nome é obrigatório'),
        check('forma').not().isEmpty().withMessage('O campo forma é obrigatório')
        .isLowercase("credito,debito").withMessage("O valor deve ser credito ou debito"),
        // password must be at least 5 chars long
        //  check('password').isLength({ min: 5 })
        /*
        check('valor')
        .isLength({ min: 3 }).withMessage('must be at least 3 chars long')
        .matches(/\d/).withMessage('must contain a number')
            */
        check('valor').not().isEmpty().withMessage('O campo valor é obrigatório')
        .isCurrency().withMessage("It is not a valid currency amount"),

    ], function(req, res) {
        var teste = check('nome').isEmpty();
        console.log(teste + "sss")
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        var pagamento = req.body;
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
                console.log('pagamento criado');
                res.location('/pagamentos/pagamento/' +
                    resultado.insertId);

                res.status(201).json(pagamento);
            }
        });

    });
}