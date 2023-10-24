const express = require('express');
const router = express.Router(); 
const Post = require('../models/post');


// Routes

// Get all posts
router.get('', async (req, res) => {
    

    try {
        const locals = {
            title: "Blog API",
            description: "Blog API using Node.js"
        }

        // Pagination

        let perPage = 10;
        let page = req.query.page || 1;

        const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const prevPage = parseInt(page) - 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        const hasPrevPage = prevPage <= Math.ceil(count / perPage);

        res.render('index', { 
        locals,
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        prevPage: hasPrevPage ? prevPage : null,
        currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    } 
});

// GET single post

router.get('/post/:id', async (req, res) => {
    

    try {
        let slug = req.params.id;

        const data = await Post.findById({_id: slug});
        const locals = {
            title: data.title,
        }
        res.render('post', {locals, data, currentRoute: `/posts/${slug}`});
    }catch(error) {
        console.log(error);
    }
        
});

// POST - search term

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: 'Search',
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
        const data = await Post.find({
            $or: [
                { title: new RegExp(searchNoSpecialChar, 'i')},
                { body: new RegExp(searchNoSpecialChar, 'i') }
            ]
            });
        
        res.render('search', {
            data,
            locals
        });
    }catch(error) {
        console.log(error);
    }
        
});

router.get('/about', (req, res) => {

    res.render('about', {
        currentRoute: '/about'
    });
});

router.get('/contact', (req, res) => {

    res.render('contact', {
        currentRoute: '/contact'
    });
})
module.exports = router;