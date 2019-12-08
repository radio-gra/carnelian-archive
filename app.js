// todo: anync/await

const express = require('express');
const mongoose = require('mongoose');
const album = require('./models/album');
const artist = require('./models/artist');
const bodyparser = require('body-parser');
// const {Album} = require('./models/album');

const app = express();
app.use(bodyparser.json());

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


const artistRouter = require('./routes/artist.router');
app.use('/artist', artistRouter);

mongoose.connect('mongodb://localhost:27017/jasper', {useNewUrlParser: true}, () => console.log('DB OK'));
var db = mongoose.connection;


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected');
});

app.listen(1337);

