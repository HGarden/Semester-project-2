function validateEmail(email) {
  const emailRegex = /^[^\s@]+@stud\.noroff\.no$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function validateName(name) {
  return name.trim().length >= 2;
}

function validateRegistrationForm(formData) {
  const errors = [];
  
  if (!validateName(formData.name)) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!validateEmail(formData.email)) {
    errors.push('Email must be a valid @stud.noroff.no address');
  }
  
  if (!validatePassword(formData.password)) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Validate optional bio field
  if (formData.bio && formData.bio.length > 160) {
    errors.push('Bio must be 160 characters or less');
  }
  
  // Validate optional avatar fields
  if (formData.avatar) {
    if (!formData.avatar.url || !isValidUrl(formData.avatar.url)) {
      errors.push('Avatar URL must be a valid URL');
    }
    if (formData.avatar.alt && formData.avatar.alt.length > 120) {
      errors.push('Avatar alt text must be 120 characters or less');
    }
  }
  
  // Validate optional banner fields
  if (formData.banner) {
    if (!formData.banner.url || !isValidUrl(formData.banner.url)) {
      errors.push('Banner URL must be a valid URL');
    }
    if (formData.banner.alt && formData.banner.alt.length > 120) {
      errors.push('Banner alt text must be 120 characters or less');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function validateLoginForm(formData) {
  const errors = [];
  
  if (!validateEmail(formData.email)) {
    errors.push('Email must be a valid @stud.noroff.no address');
  }
  
  if (!formData.password) {
    errors.push('Password is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export {
  validateEmail,
  validatePassword,
  validateName,
  validateRegistrationForm,
  validateLoginForm,
  isValidUrl
};
