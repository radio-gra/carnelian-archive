const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    album: {type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true},
    title: {type: String, required: true},
    body: {type: String, required: false},
    reviewDate: {type: Date, required: true},
    trending: {type: Boolean, required: false, default: false},
    trendingDate: {type: Date, required: false}
});

exports.ReviewSchema = ReviewSchema;
exports.Review = mongoose.model('Review', ReviewSchema);
