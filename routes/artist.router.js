const express = require('express');
const router = express.Router();
const artist = require('../models/artist');

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
        foundArtist.populate('albums', err => {
            if (err) {
                console.error(err);
                res.status(500).json({message: err.message});
                return;
            }
            res.json(foundArtist);
        });
    });
});

// POST
router.post('/', (req, res) => {
    const newArtist = new artist.Artist({
        name: req.body.name,
        year: req.body.year,
        genres: req.body.genres,
        albums: [],
    });
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
        if (req.body.albums) {
            foundArtist.albums = req.body.albums;
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