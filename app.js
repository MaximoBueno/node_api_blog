'use strict'

//Cargar  modulos de node para crear el servidor
var express = require('express');
var bodyParser = require('body-parser');


//Ejecutar express (http)
var app = express();


//Cargar ficheros rutas

var article_routes = require('./routes/articles');


//Cargar Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//Cargar CORS (acceso cruzado entre dominio)
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});


//Anadir prefijos a rutas / cargar rutas
app.use('/api', article_routes);

//Ruta o metodo de prueba
/*
app.get("/probando",function(req, res){
    return res.status(200).send({
        curso: 'Master en Frameworks JS',
        alumno: 'Maximo Hugo Bueno Uribe',
        calificacion: 20
    });
});*/




//Exportar el modulo (fichero actual)

module.exports = app;