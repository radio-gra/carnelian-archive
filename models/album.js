const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    name: String,
});

exports.AlbumSchema = AlbumSchema;
exports.Album = mongoose.model('Album', AlbumSchema);