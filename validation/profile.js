const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateProfileInput(data) {
    let errors = {};
    
    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';

    
    if (!validator.isLength(data.handle, { min: 8, max: 40 })) {
        errors.handle = 'The handle must be between 8 and 40 characters long';
    }
    if (validator.isEmpty(data.handle)) {
        errors.handle = 'The Handle is required';
    }
    if (validator.isEmpty(data.status)) {
        errors.status = 'The Status is Required';
    }
    if (validator.isEmpty(data.skills)) {
        errors.skills = 'At least one skill is required';
    }
    if (!isEmpty(data.website)) {
        if (!validator.isURL(data.website)) {
            errors.webite = `${data.website} is not a valid url`;
        }
    }
    if (!isEmpty(data.youtube)) {
        if (!validator.isURL(data.youtube)) {
            errors.youtube = `${data.youtube} is not a valid url`;
        }
    }
    if (!isEmpty(data.linkedin)) {
        if (!validator.isURL(data.linkedin)) {
            errors.linkedin = `${data.linkedin} is not a valid url`;
        }
    }if (!isEmpty(data.instagram)) {
        if (!validator.isURL(data.instagram)) {
            errors.instagram = `${data.instagram} is not a valid url`;
        }
    }if (!isEmpty(data.facebook)) {
        if (!validator.isURL(data.facebook)) {
            errors.facebook = `${data.facebook} is not a valid url`;
        }
    }if (!isEmpty(data.twitter)) {
        if (!validator.isURL(data.twitter)) {
            errors.twitter = `${data.twitter} is not a valid url`;
        }
    }


    return {
        errors,
        isValid:isEmpty(errors)
    }
}