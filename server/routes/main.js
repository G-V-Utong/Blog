const express = require('express');
const router = express.Router(); 
const Post = require('../models/post');
require('./admin');

const adminLayout = '../views/layouts/admin';

// Routes

// Get all posts
router.get('', async (req, res) => {
    

    try {
        const locals = {
            title: "Blog API",
            description: "Blog API using Node.js"
        }

        // Pagination

        let perPage = 20;
        let page = req.query.page || 1;

        const data = await Post.aggregate([ 
            { $match: {state: 'published'}}, 
        { $sort: { createdAt: -1 } } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.count({ state: 'published' });
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

router.get('/post/:id',  async (req, res) => {
    

    try {
        let slug = req.params.id;
        const token =  req.cookies.token;

        const data = await Post.findById({_id: slug});
        const locals = {
            title: data.title,
        }
        
        if (!token) {
            const layout = ''
        }
        const layout = adminLayout

        if (!data) {
            return res.status(404).send('Post not found');
        }
        data.read_count += 1;
        data.last_read_at = new Date();

        await data.save();

        res.render('post', {locals, data, layout: layout,  currentRoute: `/posts/${slug}`});
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
        const token =  await req.cookies.token;

        if (!token) {
            const layout = ''
        }
        const layout = adminLayout;
        

        let searchTerm = req.body.searchTerm || "";
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
        const data = await Post.find({
            $or: [
                { title: { $regex: searchNoSpecialChar, $options: "i"}},
                { body: { $regex: searchNoSpecialChar, $options: "i"} },
                { author: { $regex: searchNoSpecialChar, $options: "i"} },
                { tags: { $regex: searchNoSpecialChar, $options: "i"} },
                { description: { $regex: searchNoSpecialChar, $options: "i"} }
            ]
            });
        
        res.render('search', {
            data,
            locals,
            layout: layout,
            currentRoute: '/search'
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