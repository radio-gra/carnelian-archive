// todo: anync/await

const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

const app = express();
app.use(bodyparser.json());
app.use(cors({
    origin: ['http://localhost:4200']
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

const artistRouter = require('./routes/artist.router');
const albumRouter = require('./routes/album.router');
const userRouter = require('./routes/user.router');
const ratingRouter = require('./routes/rating.router');
const reviewRouter = require('./routes/review.router');
app.use('/artist', artistRouter);
app.use('/album', albumRouter);
app.use('/user', userRouter);
app.use('/rating', ratingRouter);
app.use('/review', reviewRouter);

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

