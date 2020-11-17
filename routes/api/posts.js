const { request } = require('express');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');



const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

//validation
const validatePostInput = require('../../validation/post');

// @route GET api/posts/test
// @desc Tests posts route
// @access public

router.get('/test', (req, res) => res.json({ msg: "posts works" }));
module.exports = router;

// @route POST api/posts
// @desc create posts
// @access private

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    const { errors, isValid } = validatePostInput(req.body)
    
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id

    });
    newPost.save()
        .then(post => {
            if (!post) {
                errors.posterror = 'Could not post';
            }
            res.json(post)
    })
        .catch(err =>  {return res.status(404).json(err)});
})

// @route GET api/posts
// @desc get all posts
// @access private
router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => {
            if (posts) {
                return res.json(posts)
            }
            errors.postsnotfound = 'There are no posts in the database';
            res.status(404).json(errors);
        })
        .catch(error => res.json(error));
})



// @route DELETE api/posts/:post_id
// @desc delete posts
// @access private

router.delete('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    errors = {};
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.profilenotfound = 'Profile for current user does not exist';
                return res.status(404).json(errors);
            }
            Post.findById(req.params.post_id)
            .then(post => {
                if (!post) {
                    errors.postnotfound = 'The post does not exist'
                    return res.status(404).json(errors)
                }
                if (post.user.toString() !== req.user.id) {
                    return res.status(401).json({ unauthorized: 'You dont have the authority to delete this post' });
                }
                post.deleteOne()
                    .then(results => {
                        return res.status(200).json(results);
                    })
                    .catch(err => {return res.json(err)});
                
        })
        .catch(err => res.status(400).json(err));
            
        })
        .catch(err => {
            return res.status(400).json(err);
    })

    
})

// @route POST/api/posts/like/:post_id
// @desc likes post
// @access private

router.post('/like/:post_id', passport.authenticate('jwt', { session: false }), (req, res) =>{
    errors = {};
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.profilenotfound = 'There is no Profile for that user in the database';
                return res.status(404).json(errors);
            }
            Post.findById(req.params.post_id)
                .then(post => {
                    if (!post) {
                        errors.postnotfound = 'Post not Found';
                        return res.status(404).json(errors);
                    }
                    //check that a user can not like his own post
                    //if (post.user.toString() == req.user.id) {
                        //errors.notallowed = 'The request is not allowed';
                        //return res.status(400).json(errors);
                    //}
                    //check to see if user has already liked 
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadyliked: 'The user already likes this post' });
                    }
                    post.likes.unshift({ user: req.user.id });

                    post.save().then(post => {
                        return res.json(post);
                    })
                        .catch(err => {
                            return res.json(err);
                        });

                })
                .catch(err => {
                    return res.json(err);
                });
        })
        .catch(err => {
            return res.json(err);
        });
})


// @route POST/api/posts/unlike/:post_id
// @desc unlike post
// access private

router.post('/unlike/:post_id', passport.authenticate('jwt', { session: false }), (req, res) =>{
    errors = {};
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.profilenotfound = 'There is no profile for that user in the database';
                return res
                    .status(404)
                    .json(errors);
            }
            Post.findById(req.params.post_id)
                .then(post => {
                    if (!post) {
                        errors.postnotfound = 'Post not Found';
                    }
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        errors.notliked = 'You have not liked this post yet';
                        return res
                            .status(400)
                            .json(errors);
                    }
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);
                    
                    post.likes.splice(removeIndex, 1);
                    post.save()
                        .then(post => {
                            return res
                                .json(post);
                        })
                        .catch(err => {
                            return res
                                .json(err);
                        });
                    

                    
                })
                .catch(err => {
                    return res
                        .json(err);
                });

        })
        .catch(err => {
            return res
                .json(err);
        });
})

// @route POST/api/posts/comment
// @desc comment on a post
// access private

router.post('/comment/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.profilenotfound = 'There is no profile for the user';
                return res
                    .status(404)
                    .json(errors);
                
            }
            Post.findById(req.params.post_id)
                .then(post => {
                    if (!post) {
                        errors.postnotfound = 'Post Not Found';
                        return res
                            .status(404)
                            .json(errors);
                    }

                    const { errors, isValid } = validatePostInput(req.body)
    
                        if (!isValid) {
                        return res.status(400).json(errors);
                    }
                    const newComment = {
                        user: req.user.id,
                        text: req.body.text,
                        name: req.body.name,
                        avatar: req.body.avatar,
                    };
                    //add to array
                    post.comments.unshift(newComment);
                    post.save()
                        .then(post => {
                            if (!post) {
                                errors.postnotfound = 'Post Not Found'
                                return res
                                    .status(404)
                                    .json(errors);
                                
                            }
                            return res
                                .json(post);
                        })
                        .catch(err => {
                            return res.json(err);
                        });
                })
                .catch(err => {
                    return res.json(err);
                });
            
        })
        .catch(err => {
            return res.json(err);
        });
})

// @route DELETE/api/post/comment/:post_id/:comment_id
// desc delete comment
// access private

router.delete('/comment/:post_id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                return res
                    .status(404)
                    .json({ profilenotfound: 'Profile Not Found' });
            }
            Post.findById(req.params.post_id)
                .then(post => {
                    if (!post) {
                        return res
                            .status(404)
                            .json({ postnotfound: 'Post Not Found' });
                    }
                    //check that the comment exists
                    if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                        return res
                            .status(404)
                            .json({ commentnotfound: 'Comment Not Found' });
                    }
                    const removeIndex = post.comments
                        .map(item => item._id.toString())
                        .indexOf(req.params.comment_id);
                    post.comments.splice(removeIndex, 1)
                    post.save()
                        .then(post => {
                            if (!post) {
                                return res
                                    .status(404)
                                    .json({ postnotound: 'Post Not Found' });
                            }
                            return res
                                .json(post)
                        })
                        .catch(err => {
                            return res.json(error);
                        });

                })
                .catch(err => {
                    return res.json(err);
                });
        })
        .catch(err => {
            return res.json(err);
        });

})