const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//create schema

const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    handle: {
        type: String,
        required: true,
        max: 40

    },
    company: {
        type: String
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        required: true
        
        
    },
    skills: {
        type: [String]

    },
    bio: {
        type: String
    },
    githubusername: {
        type: String
    },
    experience: [
        {
            title: {
                type: String,
                require: true

            },
            company: {
                type: String,
                required: true
            },
            location: {
                type: String
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date,
                required: true
            },
            description: {
                type: String
            }

        }
        
    ],
    education: [
        {
            school: {
                type: String,
                require: true

            },
            degree: {
                type: String,
                required: true
            },
            fieldofstudy: {
                type: String,
                required: true
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date,
                required: true
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String
            }

        }
        
    ],
    

    date: {
        type: Date,
        default: Date.now
    },
    social: {
        youtube: {
            type: String
        },
        instagram: {
            type: String
        },
        twitter: {
            type: String
        },
        facebook: {
            type: String
        },
        linkedin: {
            type: String
        }
    },

});

module.exports = Profile = mongoose.model('profiles', ProfileSchema);