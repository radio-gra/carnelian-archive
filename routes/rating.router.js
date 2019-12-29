const express = require('express');
const router = express.Router();
const passport = require('passport');
const rating = require('../models/rating');

// GET /foruser/:id
router.get('/foruser/:id', ((req, res) => {
    rating.Rating.find({user: req.params.id}).exec((err, foundRatings) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (req.query.short && req.query.short === 'true') {
            res.json(foundRatings);
            return;
        }
        const ratingCount = foundRatings.length;
        if (ratingCount === 0) {
            res.json([]);
            return;
        }
        let populatedRatings = [];
        foundRatings.forEach(rating => {
            rating.populate('album', (err, populatedRating) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                populatedRatings.push(populatedRating);
                if (populatedRatings.length === ratingCount) {
                    res.json(populatedRatings);
                }
            });
        });
    });
}));

// GET /foralbum/:id
router.get('/foralbum/:id', ((req, res) => {
    rating.Rating.find({album: req.params.id}).exec((err, foundRatings) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (req.query.short && req.query.short === 'true') {
            res.json(foundRatings);
            return;
        }
        const ratingCount = foundRatings.length;
        if (ratingCount === 0) {
            res.json([]);
            return;
        }
        let populatedRatings = [];
        foundRatings.forEach(rating => {
            rating.populate('user', (err, populatedRating) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                populatedRatings.push(populatedRating);
                if (populatedRatings.length === ratingCount) {
                    res.json(populatedRatings);
                }
            });
        });
    });
}));

// DELETE /:id
router.delete('/:id', (req, res) => {
    rating.Rating.findById(req.params.id).exec((err, foundRating) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundRating === null) {
            res.status(404).json();
            return;
        }
        foundRating.remove((err, removedRating) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(removedRating);
        });
    });
});

// GET /my/:albumid (for auth user)
router.get('/my/:id', passport.authenticate('jwt', {session: false}), ((req, res) => {
    rating.Rating.findOne({user: req.user._id, album: req.params.id}).exec((err, foundRating) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundRating === null) {
            res.status(404).json();
            return;
        }
        res.status(200).json(foundRating);
    });
}));

// POST rate (add/upd rating) (for auth user)
router.post('/rate', passport.authenticate('jwt', {session: false}), ((req, res) => {
    let newRating = new rating.Rating({
        user: req.user._id,
        album: req.body.album,
        value: req.body.value,
        ratingDate: Date(),
    });

    if (! validateRatingValue(newRating)) {
        res.status(400).json({message: 'Invalid rating value'});
        return;
    }

    rating.Rating.findOne({user: newRating.user, album: newRating.album}).exec((err, foundRating) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        if (!foundRating) {
            newRating.save((err, savedRating) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                res.status(200).json(savedRating);
            });
        } else {
            foundRating.value = newRating.value;
            foundRating.ratingDate = newRating.ratingDate;
            foundRating.save((err, savedRating) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                res.status(200).json(savedRating);
            });
        }
    });
}));

// DELETE /my/:albumid (for auth user)
router.delete('/my/:id', passport.authenticate('jwt', {session: false}), ((req, res) => {
    rating.Rating.findOne({user: req.user._id, album: req.params.id}).exec((err, foundRating) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundRating === null) {
            res.status(404).json();
            return;
        }
        foundRating.remove((err, removedRating) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(removedRating);
        });
    });
}));

function validateRatingValue(rating) {
    const value = rating.value;
    if (value > 10 || value < 1) return false;
    return value.toString().indexOf('.') === -1;
}

module.exports = router;
