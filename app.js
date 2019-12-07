const express = require('express');
const mongoose = require('mongoose');
const album = require('./models/album');
const artist = require('./models/artist');
// const {Album} = require('./models/album');

const app = express();

const AlbumSchema = mongoose.Schema({
    name: String,
});


app.get('/', (req, res) => {
    res.send('carnelian.');
    // res.send(Album.find());
});

app.get('/mynameis', (req, res) => {
    var Artist = artist.Artist;
    Artist.find(function (err, artists) {
        if (err) return console.error(err);
        res.send('<h2>carnelian:</h2><p>'+artists+'</p>');
    });
});



mongoose.connect('mongodb://localhost:27017/jasper', {useNewUrlParser: true}, () => console.log('DB OK'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var Album = album.Album;
    Album.find(function (err, albums) {
        if (err) return console.error(err);
        console.log(albums);
    });
});

app.listen(1337);

