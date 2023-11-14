const express = require('express');
const router = express.Router(); 
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { countWords } = require('../helpers/countWords');
const {logger} = require('./logger');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


// GET - Check Login

const authMiddleware = (req, res, next) => {
  const token =  req.cookies.token;

  if(!token) {
    // return res.status(401).json({message: 'You are not signed in'});
    res.redirect('/admin')
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json( { message: 'unauthorized' });
  }
}




// GET - Admin home
router.get('/admin', async (req, res) => {
    try {
      const locals = {
        title: "Admin",
      }
  
      res.render('admin/login', { locals, layout: adminLayout, currentRoute: '/admin' });
    } catch (error) {
      console.log(error);
    }
});

// GET - Signup page
router.get('/register', (req, res) => {
    try {
      const locals = {
        title: "Sign Up",
        loggedInUser: true,
      }
  
      res.render('admin/signup', { locals, layout: adminLayout, currentRoute: '/register' });
    } catch (error) {
      console.log(error);
    }
  });

// POST - Check Login

router.post('/admin', async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        logger.userLogger.log('error', 'invalid user');
        return res.status(401).json({ message: 'Invalid username or password'})
      }

      const isPasswordValid = await bcrypt.compare( password, user.password );

      if (!isPasswordValid) {
        logger.userLogger.log('error', 'invalid password');
        return res.status(401).json({ message: 'Invalid password' })
      }

      const token = jwt.sign( { userId: user._id}, jwtSecret );
      res.cookie( 'token', token, {httpOnly: true } );
      res.redirect( '/admin/home' );
      logger.userLogger.log('info', 'login successful');
      // return res.status(200).json({ message: 'Login successful' })
      
    //   res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
      logger.userLogger.log('error', 'login unsuccessful');
    }
});

// Get all posts
router.get('/admin/home', async (req, res) => {
    

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

        res.render('admin/home', { 
        locals,
        data,
        layout: adminLayout,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        prevPage: hasPrevPage ? prevPage : null,
        currentRoute: '/admin/home'
        });
    } catch (error) {
        console.log(error);
    } 
});


// GET - admin dashboard

router.get('/admin/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
    };

    const authorId = req.userId;
    const user = await User.findOne({ _id: authorId });
    const userFullName = `${user.first_name} ${user.last_name}`;

    const data = await Post.find(
      {
        author: userFullName,
      },
    );
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout,
      currentRoute: '/admin/dashboard'
    });
  } catch (error) {
    console.log(error);
  }

});

// GET - Create new post

router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
    }

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      layout: adminLayout,
      currentRoute: '/admin/add-post'
    });
    logger.postLogger.log('info', 'Post successfully created')
  } catch (error) {
    logger.postLogger.log('error', error)
  }

});

// POST - Admin Create New Post - Draft

router.post('/add-post', authMiddleware, async (req, res) => {
  

  try {
    try {
      const readCount = (countWords(req.body.body)/200);
      const authorId = req.body.author || req.userId;
      const user = await User.findOne({ _id: authorId });
      let author;

      user ? author = `${user.first_name} ${user.last_name}` : author = req.body.author;
      
      const action = req.body.action; // Get the value of the "action" field in the 'add-post' form

      if (action === 'draft') {
        const newPost = new Post({
          title: req.body.title,
          description: req.body.description,
          tags: req.body.tags,
          author,
          body: req.body.body,
          reading_time: readCount,
          state: 'draft'
        });
        await Post.create(newPost);
        logger.postLogger.log('info', 'Post successfully saved to drafts')
      } else if (action === 'publish') {
        const newPost = new Post({
          title: req.body.title,
          description: req.body.description,
          tags: req.body.tags,
          author,
          body: req.body.body,
          reading_time: readCount,
          state: 'published',
        });
        await Post.create(newPost);
        logger.postLogger.log('info', 'Post successfully published')
      }
      // await Post.create(newPost);
      res.redirect('/admin/dashboard');
    } catch (error) {
      logger.postLogger.log('error', error)
    }

  } catch (error) {
    logger.postLogger.log('error', error)
  }
});

// // POST - Admin Publish Post

// router.post('/publish-post', authMiddleware, async (req, res) => {
//   try {
//     const readCount = (countWords(req.body.body)/250);
//       const authorId = req.body.author || req.userId;
//       const user = await User.findOne({ _id: authorId });
//       let author;

//       user ? author = `${user.first_name} ${user.last_name}` : author = req.body.author;
      
//     // Set the state of the newPost object to 'published'
    
//     const newPost = new Post({
//       title: req.body.title,
//       description: req.body.description,
//       tags: req.body.tags,
//       author,
//       body: req.body.body,
//       reading_time: readCount,
//       state: 'published' // Set the state to 'published'
//     });

//     await Post.create(newPost);
//     res.redirect('/admin/dashboard');
//   } catch (error) {
//     console.log(error);
//   }
// });

//GET - Admin edit post

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout,
      currentRoute: '/admin/edit-post'
    })

  } catch (error) {
    console.log(error);
  }

});

// PUT - Edit post

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const readCount = countWords(req.body.body)/200;
    const action = req.body.action; // Get the value of the "action" field in the 'add-post' form

    if (action === 'draft') {
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        description: req.body.description,
        tags: req.body.tags,
        author: req.body.author,
        reading_time: readCount,
        updatedAt: Date.now(),
        state: 'draft',
      });
        logger.postLogger.log('info', 'Post successfully saved to drafts')
    } else if (action === 'publish') {
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        description: req.body.description,
        tags: req.body.tags,
        author: req.body.author,
        reading_time: readCount,
        updatedAt: Date.now(),
        state: 'published',

      });
        logger.postLogger.log('info', 'Post successfully published')
    }
    res.redirect(`/admin/dashboard`);

  } catch (error) {
    logger.postLogger.log('error', error)
  }

});

// PUT - Publish a post

// router.put('/publish-post/:id', authMiddleware, async (req, res) => {
//   try {
//     const readCount = countWords(req.body.body)/200;
//     await Post.findByIdAndUpdate(req.params.id, {
//       title: req.body.title,
//       body: req.body.body,
//       description: req.body.description,
//       tags: req.body.tags,
//       author: req.body.author,
//       reading_time: readCount,
//       updatedAt: Date.now(),
//       state: 'published',
//     });

//     res.redirect(`/admin/dashboard`);

//   } catch (error) {
//     console.log(error);
//   }

// });

// POST - admin register

router.post('/register', async (req, res) => {
    try {
      const { username, password, first_name, last_name, email } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      

      try {
        
        const user = await User.create({ username, first_name, last_name, email, password:hashedPassword });
        res.status(201).json({ message: 'User created successfully', user});
        // alert('User created successfully')
        // res.json({ message: 'User created successfully', user });
        console.log('User created successfully');
        res.redirect('/admin');
      } catch (error) {
        if (error.code === 11000 ) {
            res.status(409).json({ message: 'User already exists' })
        }
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error' })
      }


    } catch (error) {
      logger.postLogger.log('error', error)
    }
});

// DELETE - Admin delete

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error);
  }

});

// GET - Admin Logout

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.locals.loggedInUser = false;
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});
  
// POST search

router.post('/search', async (req, res) => {
  try {
      const locals = {
          title: 'Search',
      }

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
          currentRoute: '/search'
      });
  }catch(error) {
      console.log(error);
  }
      
});

// GET - drafts page

router.get('/admin/drafts', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Drafts",
    };

    const authorId = req.userId;
    const user = await User.findOne({ _id: authorId });
    const userFullName = `${user.first_name} ${user.last_name}`
    // Pagination

    let perPage = 20;
    let page = req.query.page || 1;

    const data = await Post.find({
      author: userFullName,
      state: 'draft'
    },
    )
   
    
    res.render('drafts', {
      locals,
      data,
      layout: adminLayout,
      currentRoute: '/admin/drafts',
    });
  } catch (error) {
    console.error(error);
  }
});

// GET - published page
router.get('/admin/published', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Published Posts",
    };

    const authorId = req.userId;
    const user = await User.findOne({ _id: authorId });
    const userFullName = `${user.first_name} ${user.last_name}`

    const data = await Post.find({
      author: userFullName,
      state: 'published'
    },
    //   [
    //   {$match: {state: 'published'}},
    //   { $sort: { createdAt: -1 } }
    // ]
    )
    
    res.render('published', {
      locals,
      data,
      layout: adminLayout,
      currentRoute: '/admin/published',
    });
  } catch (error) {
    console.error(error);
  }
  
});

module.exports = router;