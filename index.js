'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 8989;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/api_rest_blog', { useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log('la conexion a mondodb se ha realizado');
    //Crear servidor y escuchar peticiones
    app.listen(port, function(){
        console.log('servidor corriendo en localhost con puerto: ' + port);
    });

});

