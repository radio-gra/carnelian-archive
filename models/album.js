const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    name: {type: String, required: true},
    year: {type: Number, required: true},
    genres: {type: [String], required: true},
    artist: {type: mongoose.Schema.Types.ObjectId, ref: 'Artist'},
    // todo ratings
    // todo reviews
});

exports.AlbumSchema = AlbumSchema;
exports.Album = mongoose.model('Album', AlbumSchema);