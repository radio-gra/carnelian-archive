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
        const albumCount = allAlbums.length;
        if (albumCount === 0) {
            res.json([]);
            return;
        }
        let populatedAlbums = [];
        allAlbums.forEach(album => {
            album.populate('artist', (err, populatedAlbum) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                populatedAlbums.push(populatedAlbum);
                if (populatedAlbums.length === albumCount) {
                    res.json(populatedAlbums);
                }
            });
        });
    });
});

// GET all (just name and id)
router.get('/summary', (req, res) => {
    album.Album.find({}, '_id name').exec((err, allAlbums) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        res.json(allAlbums);
    });
});

// GET trending
router.get('/trending', (req, res) => {
    let amount = req.query.take ? parseInt(req.query.take) : 5;
    album.Album.find({trending: true}).sort({trendingDate: 'desc'})
        .limit(amount).exec((err, trendingAlbums) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        const albumCount = trendingAlbums.length;
        let populatedAlbums = [];
        trendingAlbums.forEach(trendingAlbum => {
            trendingAlbum.populate('artist', (err, populatedAlbum) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                populatedAlbums.push(populatedAlbum);
                if (populatedAlbums.length === albumCount) {
                    res.json(populatedAlbums.sort(compareTrendingDates));
                }
            });
        });
    });
});

// GET chart
router.get('/chart', (req, res) => {
    let amount = req.query.take ? parseInt(req.query.take) : 5;
    album.Album.aggregate([
        {
            $lookup: {
                from: 'artists',
                localField: 'artist',
                foreignField: '_id',
                as: 'artist'
            }
        },
        {
            $unwind: '$artist'
        },
        {
            $sort: {
                avgRating: -1
            }
        }
    ]).limit(amount).exec((err, allAlbums) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        res.json(allAlbums);
    });
});


// GET where (filter)
router.get('/where', (req, res) => {
    if (req.query.name) {
        album.Album.find({name: {$regex: req.query.name, $options: 'i'}}).exec((err, foundAlbums) => {
            if (err) {
                console.error(err);
                res.status(500).json({message: err.message});
                return;
            }
            const albumCount = foundAlbums.length;
            let populatedAlbums = [];
            foundAlbums.forEach(album => {
                album.populate('artist', (err, populatedAlbum) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({message: err.message});
                        return;
                    }
                    populatedAlbums.push(populatedAlbum);
                    if (populatedAlbums.length === albumCount) {
                        res.json(populatedAlbums);
                    }
                });
            });
        });
    }
    else if (req.query.artist) {
        artist.Artist.find({name: {$regex: req.query.artist, $options: 'i'}}, '_id name').exec((err, foundArtists) => {
            if (err) {
                console.error(err);
                res.status(400).json({message: err.message});
                return;
            }
            const foundArtistIds = foundArtists.map(fa => fa._id);
            album.Album.find({artist: {$in: foundArtistIds}}).exec((err, foundAlbums) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: err.message});
                    return;
                }
                const albumCount = foundAlbums.length;
                let populatedAlbums = [];
                foundAlbums.forEach(album => {
                    album.populate('artist', (err, populatedAlbum) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({message: err.message});
                            return;
                        }
                        populatedAlbums.push(populatedAlbum);
                        if (populatedAlbums.length === albumCount) {
                            res.json(populatedAlbums);
                        }
                    });
                });
            });
        });
    }
});

// GET forartist (albums w/ artist=id)
router.get('/forartist/:id', (req, res) => {
    album.Album.find({artist: req.params.id}).exec((err, foundAlbums) => {
        if (err) {
            console.error(err);
            res.status(500).json({message: err.message});
            return;
        }
        //no population here since artist is already presumed to be known
        res.json(foundAlbums);
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

module.exports = router;
