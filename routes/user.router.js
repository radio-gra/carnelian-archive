const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const user = require('../models/user');


router.post('/new', (req, res) => {
    let newUser = new user.User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: err.message});
                return;
            }
            newUser.password = hash;
            newUser.save((err, savedUser) => {
                if (err) {
                    console.error(err);
                    if (err.code === 11000) {
                        res.status(200).json({message: 'User already exists'});
                    } else {
                        res.status(500).json({message: err.message});
                    }
                    return;
                }
                res.status(200).json({message: 'User successfully registered'});
            });
        });
    });
});

router.post('/auth', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    user.User.findOne({username: username}).exec((err, foundUser) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        if (!foundUser) {
            console.error(err);
            res.json({message: 'User not found'});
            return;
        }

        bcrypt.compare(password, foundUser.password, (err, success) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: err.message});
                return;
            }
            if (success) {
                const token = jwt.sign({data: foundUser}, 'secret', {expiresIn: 21600});
                res.json({
                    token: `Bearer ${token}`,
                    user: {
                        _id: foundUser._id,
                        username: foundUser.username
                    }
                });
            }
            else {
                res.json({message: 'Invalid password'});
            }
        });
    });
});

router.post('/checkusername', (req, res) => {
    user.User.findOne({username: req.body.username}).exec((err, user) => {
        if (!user) {
            res.json({unique: true});
        } else {
            res.json({unique: false});
        }
    });
});

router.post('/checkemail', (req, res) => {
    user.User.findOne({email: req.body.email}).exec((err, user) => {
        if (!user) {
            res.json({unique: true});
        } else {
            res.json({unique: false});
        }
    });
});

router.get('/verify', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({user: req.user});
});

module.exports = router;
