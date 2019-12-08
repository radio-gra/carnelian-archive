// todo: anync/await

const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

const app = express();
const artistRouter = require('./routes/artist.router');
const albumRouter = require('./routes/album.router');
app.use('/artist', artistRouter);
app.use('/album', albumRouter);
app.use(bodyparser.json());


app.get('/', (req, res) => {
    res.send('carnelian.');
});

mongoose.connect('mongodb://localhost:27017/jasper', {useNewUrlParser: true}, () => console.log('DB OK'));
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected');
});

app.listen(1337);

