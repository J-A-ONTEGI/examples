const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateRegisterInput(data) {
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if (!validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Name must be between 2 and 30 Characters';
    }
    if (validator.isEmpty(data.name)) {
        errors.name = 'Name Field is required';
    }
     if (validator.isEmpty(data.email)) {
         errors.email = 'Email Field is required';
    }
    if (!validator.isEmail(data.email)) {
        errors.email = 'Email is Invalid';
    }
     if (validator.isEmpty(data.password)) {
         errors.password = 'Password Field is required';
    }
    if (!validator.isLength(data.password, { min: 4, max: 20 })) {
        errors.password = 'Password must be between 4 and 20 Characters';
    }
    if (validator.isEmpty(data.password2)) {
        errors.password2 = 'Confirm Password Field is Required';
    }
    if (!validator.equals(data.password, data.password2)) {
        errors.password2 = 'Passwords Must Match';
    }
    return {
        errors,
        isValid:isEmpty(errors)
    }
}