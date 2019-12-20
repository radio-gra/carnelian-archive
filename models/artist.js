const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
    name: {type: String, required: true},
    year: {type: Number, required: true},
    genres: {type: [String], required: true},
    albums: [{type: mongoose.Schema.Types.ObjectId, ref: 'Album'}],
    imageUrl: {type: String, required: false},
    trending: {type: Boolean, required: false, default: false},
    trendingDate: {type: Date, required: false}
});

exports.ArtistSchema = ArtistSchema;
exports.Artist = mongoose.model('Artist', ArtistSchema);
