const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateEducationInput(data) {
    let errors = {};
    
    data.title = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    
     if (validator.isEmpty(data.school)) {
         errors.school = 'Name of School Field is required';
    }
    if (validator.isEmpty(data.degree)) {
        errors.degree = 'Degree Name is required';
    }
     if (validator.isEmpty(data.fieldofstudy)) {
         errors.fieldofstudy = ' Field of Study is required';
    }  
    if (validator.isEmpty(data.from)) {
        errors.from = 'From Date Field is required';
    }
    return {
        errors,
        isValid:isEmpty(errors)
    }
}