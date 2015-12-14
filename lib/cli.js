var colors = require('colors');
var request = require('request');
var prompt = require('prompt');
var phrases = require('./phrases');

var cli = {

  version: function(){
    request('https://raw.githubusercontent.com/paulomcnally/phrases-cli/master/package.json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        cli.ok( JSON.parse(body).version );
      }
    });
  },

  add: function(){

    var schema = {
      properties: {
        type: {
          required: true,
          message: colors.yellow('Tipo:')
        },
        text: {
          required: true,
          message: colors.yellow('Texto:')
        }
      }
    };

    prompt.message = '';

    prompt.delimiter = '';

    prompt.start();

    prompt.get(schema, function (err, data) {

      if( err ){

        cli.error( err );

      }
      else {
        phrases.add(data.type, data.text);
      }
    });
  },

  /*
  * Error Message
  */
  error: function( param ){
    var message = '';
    if( typeof param === 'number'){
      switch (param){
        case 0:
        message = 'Es requerido que escriba un comando.';
        break;
        case 1:
        message = 'El comando que ha escrito no existe.';
        break;
        case 3:
        message = 'No tiene conexión a Internet';
        break;
        case 4:
        message = 'Petición http:';
        break;
      }
    }
    else{
      message = param;
    }
    console.log( colors.red( message ) ) ;
  },

  /*
  * Ok Message
  */
  ok: function( message ){
    console.log( colors.green( message ) ) ;
  }
};

module.exports = cli;
