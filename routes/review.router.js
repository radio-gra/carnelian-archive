const express = require('express');
const router = express.Router();
const passport = require('passport');
const review = require('../models/review');
const album = require('../models/album');

// GET /foralbum/:id
router.get('/foralbum/:id', ((req, res) => {
    review.Review.find({album: req.params.id}).exec((err, foundReviews) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (req.query.short && req.query.short === 'true') {
            res.json(foundReviews);
            return;
        }
        const reviewCount = foundReviews.length;
        if (reviewCount === 0) {
            res.json([]);
            return;
        }
        let populatedReviews = [];
        foundReviews.forEach(review => {
            review.populate('user', (err, populatedReview) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                populatedReviews.push(populatedReview);
                if (populatedReviews.length === reviewCount) {
                    res.json(populatedReviews.sort(compareReviewDates));
                }
            });
        });
    });
}));

// GET /other/:id (for auth user) (reviews for album except own)
router.get('/other/:id', passport.authenticate('jwt', {session: false}), ((req, res) => {
    review.Review.find({album: req.params.id}).exec((err, foundReviews) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (req.query.short && req.query.short === 'true') {
            res.json(foundReviews);
            return;
        }
        foundReviews = foundReviews.filter(review => review.user.toString() !== req.user._id.toString());
        const reviewCount = foundReviews.length;
        if (reviewCount === 0) {
            res.json([]);
            return;
        }
        let populatedReviews = [];
        foundReviews.forEach(review => {
            review.populate('user', (err, populatedReview) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                populatedReviews.push(populatedReview);
                if (populatedReviews.length === reviewCount) {
                    res.json(populatedReviews.sort(compareReviewDates));
                }
            });
        });
    });
}));

// DELETE /:id
router.delete('/:id', (req, res) => {
    review.Review.findById(req.params.id).exec((err, foundReview) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundReview === null) {
            res.status(404).json();
            return;
        }
        foundReview.remove((err, removedReview) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(removedReview);
        });
    });
});

// GET /my/:albumid (for auth user)
router.get('/my/:id', passport.authenticate('jwt', {session: false}), ((req, res) => {
    review.Review.findOne({user: req.user._id, album: req.params.id}).exec((err, foundReview) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundReview === null) {
            res.status(404).json();
            return;
        }
        res.status(200).json(foundReview);
    });
}));

// GET trending
router.get('/trending', (req, res) => {
    let amount = req.query.take ? parseInt(req.query.take) : 5;
    let trunc = req.query.trunc ? parseInt(req.query.trunc) : 100000;
    review.Review.find({trending: true}).sort({trendingDate: 'desc'})
        .limit(amount).exec((err, trendingReviews) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        const reviewCount = trendingReviews.length;
        let populatedReviews = [];
        trendingReviews.forEach(trendingReview => {
            trendingReview.populate('user', (err, populatedReview) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                populatedReviews.push(populatedReview);
                if (populatedReviews.length === reviewCount) {
                    res.json(populatedReviews.map(r => {
                        r.body = r.body.substr(0, trunc) + '...';
                        return r;
                    }).sort(compareTrendingDates));
                }
            });
        });
    });
});

// POST review (add/upd review) (for auth user)
router.post('/review', passport.authenticate('jwt', {session: false}), ((req, res) => {
    let newReview = new review.Review({
        user: req.user._id,
        album: req.body.album,
        title: req.body.title,
        body: req.body.body,
        reviewDate: Date(),
    });
    
    if (typeof(req.body.trending) !== "undefined") {
        newReview.trending = req.body.trending;
        if (newReview.trending === true) {
            newReview.trendingDate = Date();
        }
    }
    
    review.Review.findOne({user: newReview.user, album: newReview.album}).exec((err, foundReview) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        if (!foundReview) {
            newReview.save((err, savedReview) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                res.status(200).json(savedReview);
            });
        } else {
            foundReview.title = newReview.title;
            foundReview.body = newReview.body;
            foundReview.reviewDate = newReview.reviewDate;
            foundReview.save((err, savedReview) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                res.status(200).json(savedReview);
            });
        }
    });
}));

// PATCH /:id 
router.patch('/:id', ((req, res) => {
    review.Review.findById(req.params.id).exec((err, foundReview) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundReview === null) {
            res.status(404).json();
            return;
        }
        if (req.body.user) {
            foundReview.user = req.body.user;
        }
        if (req.body.album) {
            foundReview.album = req.body.album;
        }
        if (req.body.title) {
            foundReview.title = req.body.title;
        }
        if (req.body.body) {
            foundReview.body = req.body.body;
        }
        if (req.body.reviewDate) {
            foundReview.reviewDate = req.body.reviewDate;
        }
        if (typeof(req.body.trending) !== "undefined") {
            foundReview.trending = req.body.trending;
            if (foundReview.trending === true) {
                foundReview.trendingDate = Date();
            }
        }
        foundReview.save((err, updatedReview) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(updatedReview);
        });
    });
}));

// DELETE /my/:albumid (for auth user)
router.delete('/my/:id', passport.authenticate('jwt', {session: false}), ((req, res) => {
    review.Review.findOne({user: req.user._id, album: req.params.id}).exec((err, foundReview) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundReview === null) {
            res.status(404).json();
            return;
        }
        foundReview.remove((err, removedReview) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(removedReview);
        });
    });
}));

// later date = bigger
function compareTrendingDates(a, b) {
    if (Date.parse(a.trendingDate) < Date.parse(b.trendingDate)) {
        return 1;
    }
    if (Date.parse(a.trendingDate) === Date.parse(b.trendingDate)) {
        return 0;
    }
    return -1;
}

function compareReviewDates(a, b) {
    if (Date.parse(a.reviewDate) < Date.parse(b.reviewDate)) {
        return 1;
    }
    if (Date.parse(a.reviewDate) === Date.parse(b.reviewDate)) {
        return 0;
    }
    return -1;
}

module.exports = router;
