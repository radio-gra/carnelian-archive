const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
    name: {type: String, required: true},
    year: {type: Number, required: true},
    genres: {type: [String], required: true},
    albums: [{type: mongoose.Schema.Types.ObjectId, ref: 'Album'}]
});

exports.ArtistSchema = ArtistSchema;
exports.Artist = mongoose.model('Artist', ArtistSchema);