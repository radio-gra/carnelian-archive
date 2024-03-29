const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
});

exports.UserSchema = UserSchema;
exports.User = mongoose.model('User', UserSchema);
