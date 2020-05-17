'use strict'

var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path');

var controller = {
    datosCurso : function(req, res){
        var hola = req.body.hola;
        return res.status(200).send({
            curso: 'Master en Frameworks JS',
            alumno: 'Maximo Hugo Bueno Uribe',
            calificacion: 20,
            hola
        });
    },
    
    test: function (req, res){
        return res.status(200).send({
            mensaje: 'Soy la accion test de mi controlador'
        });
    },

    save: function(req, res){
        //Recoger parametros por post
        var params = req.body;

        //Validar datos (validator)
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);


        }catch(err){
            return res.status(200).send({
                status: 'Error',
                mensaje: 'Faltan datos por enviar'
            });
        }

        if(validate_title && validate_content){
            //Crear el objeto a guardar
            var article = new Article();

            //Asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null

            //Guardar el articulo
            article.save(function(err,articleStored){
                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'Error',
                        mensaje: 'El articulo no se ha guardado'
                    });
                }

                 //Devolver respuesta
                return res.status(200).send({
                    status: 'Success',
                    article: articleStored
                });

            });
        }
    },

    getArticles: function(req, res){
        
        var last = req.params.last;

        var query = Article.find({});

        if(last || last != undefined){
            query.limit(5);
        }

        //Find
        query.sort('-_id').exec(
            function(err, articles){
                if(err){
                    return res.status(500).send({
                        status: 'Error',
                        mensaje: 'Error al devolver articulos'
                    });
                }

                if(!articles){
                    return res.status(404).send({
                        status: 'Error',
                        mensaje: 'No hay articulos para mostrar'
                    });
                }

                return res.status(200).send({
                    status: 'Success',
                    articles
                });
            }
        );
    },
    getArticle: function(req, res){
        //Recoger id de la ul
        var articleId = req.params.id;

        //comprobar que existe
        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'Error',
                mensaje: 'No hay existe el articulo'
            });
        }

        //buscar el articulo
        Article.findById(articleId, function(err, article){
            if(err || !article){
                return res.status(200).send({
                    status: 'Error',
                    mensaje: 'No existe el articulo'
                });
            }

            //devolver respuesta
            return res.status(200).send({
                status: 'Success',
                article
            });
        });
    },
    update: function(req, res){
        //recoger el id del articulo por la url
        var articleId = req.params.id;
        //recoger los datos que llegan por put
        var params = req.body;
        try{
            //validar los datos
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

            if (validate_title && validate_content){
                //Find and update
                Article.findOneAndUpdate({_id: articleId}, 
                    params, {new: true}, 
                    function(err, articleUpdated){
                        if(err){
                            return res.status(500).send({
                                status: 'Error',
                                mensaje: 'Error al actualizar'
                            });
                        }
                        if(!articleUpdated){
                            return res.status(404).send({
                                status: 'Error',
                                mensaje: 'No existe el articulo'
                            });
                        }

                        //devolver respuesta
                        return res.status(200).send({
                            status: 'Success',
                            article: articleUpdated
                        });
                });

            }
        }catch(err){
            return res.status(404).send({
                status: 'Error',
                mensaje: 'Faltan datos por enviar'
            });
        }
    },
    
    delete: function(req, res){
        //recoger el id de la url
        var articleId = req.params.id;


        //find and delete
        Article.findByIdAndDelete({_id: articleId}, function(err, articleRemoved){
            if(err){
                return res.status(500).send({
                    status: 'Error',
                    mensaje: 'Error al borrar'
                });
            }
            if(!articleRemoved){
                return res.status(404).send({
                    status: 'Error',
                    mensaje: 'No existe el articulo'
                });
            }

            //devolver respuesta
            return res.status(200).send({
                status: 'Success',
                article: articleRemoved
            });
        });
    },

    upload: function(req, res){
        //configurar el modulo connect multiparty router/article.js (hecho)

        //reconjer el fichero de la peticion
        var file_name = 'Imagen no subida...';

        //console.log(req.files);

        //conseguir el nombre y extension del archivo

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
        //comprobar la extension solo imagenes, si no es validar la extension borrar fichero

        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        //ADVERTENCIA EN LINUX O MAC
        //var file_split = file_path.split('/');

        //nombre del archivo
        var file_name = file_split[2];
        
        //extension del fiche
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];


        //si todo es valido
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            //borrar el archivo
            fs.unlink(file_path, function(err){
                return res.status(200).send({
                    status: 'error',
                    message: 'la extension de la imagen no es valida'
                });
            });
        }else{
            var articleId = req.params.id;
            //buscar el archivo, asignar el nombre de la imagen y actulizarlo
            Article.findOneAndUpdate({_id: articleId}, 
                {image: file_name}, {new: true}, 
                function(err, articleUpdated){
                    if(err || !articleUpdated){
                        return res.status(200).send({
                            status: 'error',
                            article: 'errror al guardar imagen de articulo'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdated
                    });
                });
        }
    },
    getImage: function(req, res){
        var file =  req.params.image;

        var path_file = './upload/articles/'+ file;

        fs.exists(path_file, function(exists){
            if(exists){
                return  res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'la imagen no existe'
                });
            }
        });
    },
    search: function(req, res){
        //sacar el string a buscar
        var searchString = req.params.search;

        //find or
        Article.find({ "$or" : [
            {"title": {"$regex": searchString, "$options": "i" }},
            {"content": {"$regex": searchString, "$options": "i" }},
        ]}).sort([['date', 'descending']]).exec(
            function(err, articles){
                if(err || !articles){
                    return res.status(404).send({
                        status: 'error',
                        message: 'error en la peticion'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    articles
                });
            }
        );
    }
};

module.exports = controller;