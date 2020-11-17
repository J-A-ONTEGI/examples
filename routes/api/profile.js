const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load validation
const ValidateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

//load profile model
const Profile = require('../../models/Profile');
//load user model
const User = require('../../models/User');

// @route GET api/profile/test
// @desc Tests profile route
// @access public

router.get('/test', (req, res) => res.json({ msg: "profile works" }));



// @route GET api/profile
// @desc gets current user profile
// @access private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    errors = {};
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for that user'; 
                return res.status(404).json(errors)
            }
            res.json(profile)
        })
    .catch(err=> res.status(404).json(err))
});


// @route GET api/profile/all
// @desc gets all
// @access public

router.get('/all', (req, res) => {
    let errors = {};
    Profile.find()
        .populate('users', ['name', 'avater'])
        .then(profiles => {
            if (profiles) {
                res.json(profiles);
            }
            errors.profilesnotfound = 'There are no profiles in the database Yet';
            res.status(404).json(errors);
        })
        .catch(err => {
            res.status(404).json(err);
    })
})

// @route GET api/profile/handle/:handle
// @desc gets current user profile by handle
// @access public

router.get('/handle/:handle', (req, res) => {
    errors = {};
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(400).json(errors);
            }
            res.json(profile);
        }
        )
        .catch(err => res.status(404).json(err));
})

// @route GET api/profile/user/:user_id
// @desc gets current user profile by userid
// @access public

router.get('/user/:user_id', (req, res) => {
    errors = {};
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(400).json(errors);
            }
            res.json(profile);
        }
        )
        .catch(err => res.status(404).json({profilenotfound:' There is no profile for this user'}));
})

// @route POST api/profile
// @desc create /edit user profile
// @access private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = ValidateProfileInput(req.body);

    if (!isValid) {
        //return any errors
        return res.status(400).json(errors);
    }
    //Get fields
    const ProfileFields = {};
    ProfileFields.user = req.user.id;
    if (req.body.handle) ProfileFields.handle = req.body.handle;
    if (req.body.company) ProfileFields.company = req.body.company;
    if (req.body.website) ProfileFields.website = req.body.website;
    if (req.body.location) ProfileFields.location = req.body.location;
    if (req.body.bio) ProfileFields.bio = req.body.bio;
    if (req.body.status) ProfileFields.status = req.body.status;
    if (req.body.githubusername) ProfileFields.githubusername = req.body.githubusername;
    //split skills

    if (typeof (req.body.skills) != 'undefined') {
        ProfileFields.skills = req.body.skills.split(',');
    }
    //social
    ProfileFields.social = {};
    if (req.body.youtube) {ProfileFields.social.youtube = req.body.youtube;}
    if (req.body.twitter) {ProfileFields.social.twitter = req.body.twitter;}
    if (req.body.facebook) {ProfileFields.social.facebook = req.body.facebook;}
    if (req.body.linkedin) {ProfileFields.social.linkedin = req.body.linkedin;}
    if (req.body.instagram) {ProfileFields.social.instagram = req.body.instagram;}

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (profile) {
                Profile.findOneAndUpdate({ user: req.user.id }, { $set: ProfileFields }, { new: true })
                    .then(profile => res.json(profile))
                .catch(err=>res.status(404).json(err))
            }
            else {
                //create
                //check if handle exists
                Profile.findOne({ handle: ProfileFields.handle })
                    .then(profile => {
                        if (profile) {
                            errors.handle = 'That Handle already exists';
                            res.status(400).json(errors);
                        }
                        else {
                            //save profile
                            new Profile(ProfileFields).save()
                                .then(profile => res.json(profile))
                                .catch(err => res.status(400).json(err));
                        }
                    })
                    .catch(err => res.json(err));
            }
    })

})


// @route POST api/profile/experience
// @desc add experience
// @access private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
        res.status(404).json(errors);
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };
            //add to experience array
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile)).catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json(err));
})

// @route POST api/profile/education
// @desc add education
// @access private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
        res.status(404).json(errors);
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };
            //add to education array
            profile.education.unshift(newEdu);
            profile.save().then(profile => res.json(profile)).catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json(err));
})


// @route DELETE api/profile/experience/:exp_id
// @desc delete experience
// @access private
router.delete('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    errors = {};
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                error.profilenotfound = 'There is no profile for that user';
                res.status(404).json(errors);
            }
            //get remove index

            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);
            profile.experience.splice(removeIndex, 1);
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
})


// @route DELETE api/profile/education/:exp_id
// @desc delete experience
// @access private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    errors = {};
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.profilenotfound = 'There is no Profile for that user';
                res.status(404).json(errors);
            }
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id);
            profile.education.splice(removeIndex, 1);
            profile.save().then(profile => res.json(profile)).catch(err => res.status(404).json(err));
        })
        .catch(err => res.status(404).json(err));
})

module.exports = router;