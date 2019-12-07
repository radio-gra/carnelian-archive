const mongoose = require('mongoose');
const album = require('./album');

const ArtistSchema = mongoose.Schema({
    name: String,
    year: Number,
    genres: [String],
    albums: [album.AlbumSchema],
});

exports.ArtistSchema = ArtistSchema;
exports.Artist = mongoose.model('Artist', ArtistSchema);