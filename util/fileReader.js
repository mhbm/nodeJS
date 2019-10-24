const fs = require('fs');

fs.readFile("../file/imagem.jpg", function(error, buffer) {

    if (error) {
        console.log(error);
        return;
    }
    console.log("arquivo lido");

    fs.writeFile('imagem2.jpg', buffer, function(err) {
        console.log("arquivo escrito");
    })
});