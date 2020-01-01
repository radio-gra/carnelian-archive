const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    name: {type: String, required: true},
    year: {type: Number, required: true},
    genres: {type: [String], required: true},
    artist: {type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true},
    avgRating: {type: Number, required: false},
    // todo reviews
    imageUrl: {type: String, required: false},
    trending: {type: Boolean, required: false, default: false},
    trendingDate: {type: Date, required: false}
});

exports.AlbumSchema = AlbumSchema;
exports.Album = mongoose.model('Album', AlbumSchema);
