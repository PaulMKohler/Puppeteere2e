const mongoose = require('mongoose');

let postSchema = new mongoose.Schema({
    title: String,
    author: String,
    dateCreated: String,
    dateCrawled: Date
});

let Post = mongoose.model('Post', postSchema);

module.exports = Post;
