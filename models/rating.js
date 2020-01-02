const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    album: {type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true},
    value: {type: Number, required: true},
    ratingDate: {type: Date, required: true},
});

exports.RatingSchema = RatingSchema;
exports.Rating = mongoose.model('Rating', RatingSchema);
