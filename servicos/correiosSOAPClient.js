var soap = require('soap');

soap.createClient('http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl',
    function(erro, cliente) {
        console.log("cliente SOAP criado");

        cliente.CalcPrazo({
            'nCdServico': '40010',
            'sCepOrigem': '03138000',
            'sCepDestino': '18110382'
        }, function(err, resultado) {
            console.log(JSON.stringify(resultado));
        })
    });