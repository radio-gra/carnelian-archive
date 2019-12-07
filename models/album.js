const mongoose = require('mongoose');

const AlbumSchema = mongoose.Schema({
    name: String,
});

exports.AlbumSchema = AlbumSchema;
exports.Album = mongoose.model('Album', AlbumSchema);