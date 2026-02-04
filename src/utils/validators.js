// Valider email
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // Valider mot de passe (min 6 caractères)
  export const isValidPassword = (password) => {
    return password && password.length >= 6;
  };
  
  // Valider coordonnées GPS
  export const isValidLatitude = (lat) => {
    const num = parseFloat(lat);
    return !isNaN(num) && num >= -90 && num <= 90;
  };
  
  export const isValidLongitude = (lon) => {
    const num = parseFloat(lon);
    return !isNaN(num) && num >= -180 && num <= 180;
  };
  
  // Valider téléphone camerounais
  export const isValidCameroonPhone = (phone) => {
    const regex = /^\+237[26]\d{8}$/;
    return regex.test(phone.replace(/\s/g, ''));
  };
  
  // Valider date (format YYYY-MM-DD)
  export const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };
  
  // Valider plage de dates
  export const isValidDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return true; // Optionnel
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start;
  };
  
  // Valider rating (0-5)
  export const isValidRating = (rating) => {
    const num = parseFloat(rating);
    return !isNaN(num) && num >= 0 && num <= 5;
  };
  