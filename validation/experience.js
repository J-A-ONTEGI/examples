const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateExperienceInput(data) {
    let errors = {};
    
    data.title = !isEmpty(data.title) ? data.title : '';
    data.company = !isEmpty(data.company) ? data.company : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    data.to = !isEmpty(data.to) ? data.to : '';
    
     if (validator.isEmpty(data.title)) {
         errors.title = 'Job Title Field is required';
    }
    if (validator.isEmpty(data.company)) {
        errors.company = 'company Name is required';
    }
     if (validator.isEmpty(data.from)) {
         errors.from = ' From Date field is required';
    }   
    return {
        errors,
        isValid:isEmpty(errors)
    }
}