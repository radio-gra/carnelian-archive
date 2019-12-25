const express = require('express');
const router = express.Router();
const artist = require('../models/artist');

// GET all
router.get('/', (req, res) => {
    artist.Artist.find({}).exec((err, allArtists) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        res.json(allArtists);
    });
});

// GET all (just name and id)
router.get('/summary', (req, res) => {
    artist.Artist.find({}, '_id name').exec((err, allArtists) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        res.json(allArtists);
    });
});

// GET trending
router.get('/trending', (req, res) => {
    let amount = req.query.take ? parseInt(req.query.take) : 5;
    artist.Artist.find({trending: true}).sort({trendingDate: 'desc'})
        .limit(amount).exec((err, trendingArtists) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        res.json(trendingArtists);
    });
});

// GET :id
router.get('/:id', (req, res) => {
    artist.Artist.findById(req.params.id).exec((err, foundArtist) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        if (foundArtist === null) {
            res.status(404).json();
            return;
        }
        res.json(foundArtist);
    });
});

// POST
router.post('/', (req, res) => {
    const newArtist = new artist.Artist({
        name: req.body.name,
        year: req.body.year,
        genres: req.body.genres,
    });
    if (req.body.imageUrl) {
        newArtist.imageUrl = req.body.imageUrl;
    }
    if (typeof(req.body.trending) !== "undefined") {
        newArtist.trending = req.body.trending;
        if (newArtist.trending === true) {
            newArtist.trendingDate = Date();
        }
    }
    newArtist.save((err, savedArtist) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
        }
        res.status(200).json(savedArtist);
    });
});

//PATCH :id
router.patch('/:id', (req, res) => {
    artist.Artist.findById(req.params.id).exec((err, foundArtist) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundArtist === null) {
            res.status(404).json();
            return;
        }
        if (req.body.name) {
            foundArtist.name = req.body.name;
        }
        if (req.body.year) {
            foundArtist.year = req.body.year;
        }
        if (req.body.genres) {
            foundArtist.genres = req.body.genres;
        }
        if (req.body.imageUrl) {
            foundArtist.imageUrl = req.body.imageUrl;
        }
        if (typeof(req.body.trending) !== "undefined") {
            foundArtist.trending = req.body.trending;
            if (foundArtist.trending === true) {
                foundArtist.trendingDate = Date();
            }
        }
        foundArtist.save((err, savedArtist) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(savedArtist);
        });
    });
});

// DELETE :id
router.delete('/:id', (req, res) => {
    artist.Artist.findById(req.params.id).exec((err, foundArtist) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundArtist === null) {
            res.status(404).json();
            return;
        }
        foundArtist.remove((err, removedArtist) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(removedArtist);
        });
    });
});

module.exports = router;
