//lets require/import the mongodb native drivers.
var mongodb = require('mongodb')
var express = require('express')
var shortid = require('shortid')
var validator = require('validator')
var app = express()
app.enable('trust proxy')

app.use(express.static('public'));
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.

//(Focus on This Variable)
//var url = 'mongodb://localhost:27017/my_database_name';
var url = 'mongodb://hello:hello@ds033259.mlab.com:33259/urlshortener';
//(Focus on This Variable)
var userurl;

// Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    var urls = db.collection('urls')
    app.get('/', function(req, res){
      res.sendFile(__dirname + '/index.html');
    })
    app.get('/new/*', function(req, res){
      var host = req.get('host');
      userurl = req.params[0]
      console.log(userurl)
      if (validator.isURL(userurl)) {
        var cursor = urls.find({url: userurl}, {_id: 0, shortid: 0})
        cursor.toArray(function (err, result){
          if (err){
            console.log(err)
          }
          else if (result.length){
            console.log('found');
            res.json(result[0]);
          }
          else {
            console.log('no such link found');
            var shortID = shortid.generate();
            urls.insert({url: userurl, shortURL: host + '/' + shortID, shortid: shortID}, function(err, result){
              if (err){
                console.log (err)
              }
              else {
                cursor.toArray(function (err, result){
                  if (err){
                    console.log(err)
                  }
                  else if (result.length){
                    console.log('inserted and retrieved');
                    res.json(result[0]);
                  }
                })
              }
            })
          }
        })
      }
      else {
        res.json({Error: 'The URL provided was invalid'})
      }
    })
    app.get('/:id', function(req, res){
      var idreq = req.params.id
      var cursor = urls.find({shortid: idreq})
      cursor.toArray(function(err, result){
        if (err) {
          console.log(err)
        }
        else if (result.length){
          var redir = result[0]['url'];
          res.redirect(redir)
        }
      })

    })
    var port = process.env.PORT || 3000;
    app.listen(port, function(){
      console.log('listening on port ' + port)
    })
  }
});
