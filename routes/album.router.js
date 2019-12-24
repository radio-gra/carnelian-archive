const express = require('express');
const router = express.Router();
const album = require('../models/album');
const artist = require('../models/artist');

// GET all
router.get('/', (req, res) => {
    album.Album.find({}).exec((err, allAlbums) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        res.json(allAlbums);
    });
});

// GET :id
router.get('/:id', (req, res) => {
    album.Album.findById(req.params.id).exec((err, foundAlbum) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        if (foundAlbum === null) {
            res.status(404).json();
            return;
        }
        foundAlbum.populate('artist', err => {
            if (err) {
                console.error(err);
                res.status(500).json({message: err.message});
                return;
            }
            res.json(foundAlbum);
        });
    });
});

// POST
router.post('/', (req, res) => {
    const newAlbum = new album.Album({
        name: req.body.name,
        year: req.body.year,
        genres: req.body.genres,
        artist: req.body.artist,
    });
    if (req.body.imageUrl) {
        newAlbum.imageUrl = req.body.imageUrl;
    }
    if (typeof(req.body.trending) !== "undefined") {
        newAlbum.trending = req.body.trending;
        if (newAlbum.trending === true) {
            newAlbum.trendingDate = Date();
        }
    }
    newAlbum.save((err, savedAlbum) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
        }
        res.status(200).json(savedAlbum);
    });
});

//PATCH :id
router.patch('/:id', (req, res) => {
    album.Album.findById(req.params.id).exec((err, foundAlbum) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundAlbum === null) {
            res.status(404).json();
            return;
        }
        if (req.body.name) {
            foundAlbum.name = req.body.name;
        }
        if (req.body.year) {
            foundAlbum.year = req.body.year;
        }
        if (req.body.genres) {
            foundAlbum.genres = req.body.genres;
        }
        if (req.body.artist) {
            foundAlbum.artist = req.body.artist;
        }
        if (req.body.imageUrl) {
            foundAlbum.imageUrl = req.body.imageUrl;
        }
        if (typeof(req.body.trending) !== "undefined") {
            foundAlbum.trending = req.body.trending;
            if (foundAlbum.trending === true) {
                foundAlbum.trendingDate = Date();
            }
        }
        foundAlbum.save((err, updatedAlbum) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(updatedAlbum);
        });
    });
});

// DELETE :id
router.delete('/:id', (req, res) => {
    album.Album.findById(req.params.id).exec((err, foundAlbum) => {
        if (err) {
            console.error(err);
            res.status(400).json({message: err.message});
            return;
        }
        if (foundAlbum === null) {
            res.status(404).json();
            return;
        }
        foundAlbum.remove((err, removedAlbum) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
            }
            res.status(200).json(removedAlbum);
        });
    });
});

module.exports = router;
