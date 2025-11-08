// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };
  
  // Validate password
  export const isStrongPassword = (password) => {
   
    return strongPasswordRegex.test(password);
  };
  
  export   const isValidNepaliPhone = (phone) => {
    return /^(98|97|96)[0-9]{8}$/.test(phone);
  };
  
  