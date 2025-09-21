
// src/lib/utils.js
export const validateAddress = (address) => {
    const errors = {};
    
    if (!address.first_name) errors.first_name = "First name is required";
    if (!address.last_name) errors.last_name = "Last name is required";
    if (!address.address_1) errors.address_1 = "Address is required";
    if (!address.city) errors.city = "City is required";
    if (!address.state) errors.state = "State is required";
    if (!address.postcode) errors.postcode = "Postcode is required";
    if (!address.country) errors.country = "Country is required";
    if (!address.phone) errors.phone = "Phone is required";
    
    // For billing address only
    if (address.email && !validateEmail(address.email)) {
        errors.email = "Valid email is required";
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};