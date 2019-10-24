module.exports = function(app) {

    app.post('/correios/calcula-prazo', function(req, res) {

        var dadosEntrega = req.body;

        var correiosSOAPClient = new app.servicos.correiosSOAPClient();
        correiosSOAPClient.calculaPrazo(dadosEntrega,
            function(erro, resultado) {
                if (erro) {
                    res.status(500).send(erro);
                    return;
                }

                console.log("Prazo Calculado");
                res.json(resultado);



            });
    });
}