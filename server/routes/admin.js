const express = require('express');
const router = express.Router(); 
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


// GET - Check Login

const authMiddleware = (req, res, next) => {
  const token =  req.cookies.token;

  if(!token) {
    return res.status(401).json({message: 'Not token'});
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
      }
  
      res.render('admin/signup', { locals, layout: adminLayout });
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
        return res.status(401).json({ message: 'Invalid username or password'})
      }

      const isPasswordValid = await bcrypt.compare( password, user.password );

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' })
      }

      const token = jwt.sign( { userId: user._id}, jwtSecret );
      res.cookie( 'token', token, {httpOnly: true } );

      res.redirect( '/admin/dashboard' );

    //   res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
      console.log(error);
    }
});

// GET - admin dashboard

router.get('/admin/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
    }
    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
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
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

// POST - Admin Create New Post

router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});

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

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/dashboard`);

  } catch (error) {
    console.log(error);
  }

});

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
      console.log(error);
    }
});

// DELETE - Admin delete

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }

});

// GET - Admin Logout

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});
  
module.exports = router;