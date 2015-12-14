var request = require('request');
var imgur = require('imgur');
var fs = require('fs');
var wrap = require('wordwrap')(30);
var gm = require('gm').subClass({imageMagick: true});

var Phrases = function() {

};

Phrases.prototype.add = function(type, text) {
  var borderWidth = 2;
  var borderColor = '#ffffff';

  var size = {
    width: 640,
    height: 480
  };

  var data = {
    middle: {
      color: '#FFFFFF',
      fontSize: 40,
      position: {
        y: 0,
        x: 0
      }
    }
  };

  data.middle.text =  wrap(text);

  request.post('https://frases-club-api.herokuapp.com/api/backgrounds/random', {form: {type: type}}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var imageUrl = JSON.parse(body).url;

      var readable = fs.createReadStream(__dirname + '/assets/bg.png');

      var writable = request
      .get(imageUrl)
      .on('error', function(err) {
        console.log(err);
      })
      .pipe(fs.createWriteStream(__dirname + '/assets/bg.png').on('close', function() {
        gm(__dirname + '/assets/bg.png')
        // url
        .fill('#FFFFFF')
        .fontSize(16)
        .drawText(395, 470, 'http://www.frase.club/' + type)
        // phrase
        .border(borderWidth, borderWidth)
        .borderColor(borderColor)
        .modulate(85)
        .stroke('#000000', 1)
        .resize(size.width, size.height + ">")
        .gravity('Center')
        .extent(size.width, size.height)
        // text middle
        .fill(data.middle.color)
        .fontSize(data.middle.fontSize)
        .drawText(0, 0, data.middle.text)
        .write(__dirname + '/new.png', function (err) {
          if (err) {
            console.log(err);
          }
          else {
            imgur.setClientId(process.env.PHRASES_IMGUR_SECRET);

            imgur.uploadFile(__dirname + '/new.png')
            .then(function (json) {
              request.post('https://frases-club-api.herokuapp.com/api/Posts', {form: {
                "text": text,
                "url": json.data.link,
                "type": type
              }}, function (error, response, body) {
                console.log(body);
              });
            })
            .catch(function (err) {
              console.error(err.message);
            });
          }
        });
      }));
    }
  });
};

module.exports = new Phrases();
