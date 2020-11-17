const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
//load user model

const User = require('../../models/User');
const { session } = require('passport');

// @route GET api/users/test
// @desc Tests users route
// @access public

router.get('/test', (req, res) => res.json({ msg: "users works" }));
module.exports = router;

// @route GET api/users/register
// @desc Register user
// @access public

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    
    if (!isValid) {
        return res.status(400).json(errors);
}
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                return res.status(400).json({ email: 'Email already exists' });
            }
            else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',//size
                    r: 'pg',//rating
                    d: 'mm' //default
                })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: avatar,
                    password: req.body.password
                })
                bycrypt.genSalt(10, (err, salt) => {
                    bycrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        });
});

// @route GET api/users/login
// @desc login user/ return JWT Token
// @access public
router.post('/login', (req, res) => {



    const { errors, isValid } = validateLoginInput(req.body);
    
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email; 
    const password = req.body.password;

    //find the user by email
    User.findOne({ email })
        .then(user => {
            //check for user
            if (!user) {
                errors.email = 'User not found'
                return res.status(404).json(errors)
            }
            //check password
            bycrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {

                        // user matched
                        //create JWT payload
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        };

                        //sign the token
                        jwt.sign(
                            payload,
                            keys.secretKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: 'true',
                                    token: 'Bearer '+token
                            })
                        });
                   
                    }
                    else {
                        errors.password = 'Password Incorrect'
                        return res.status(404).json(errors);
                    }
                });
        });

});

// @route GET api/users/current
// @desc return current user
// @access private