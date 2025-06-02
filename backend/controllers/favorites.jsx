const { json } = require("express");
const User = require("../models/User");

exports.addFavorite = async (req, res) => {
    try { 
    const {imageId, url, description, photographer} = req.body;
    const user = await User.findById(req.user.id);

    if (user.favorites.some(fav => fav.imageId === imageId)) {
        return res.status(400).json({ msg : "Image already in favorites"});
    }

    user.favorites.push({ imageId, url, description, photographer});
    await user.save();

    res.json(user.favorites);
} catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
}
};

exports.removeFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.favorites = user.favorites.filter(
            fav => fav.imageId !== req.params.imageId
        );
        await user.save();
        res.json(user.favorites)
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
};