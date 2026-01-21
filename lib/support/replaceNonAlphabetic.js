module.exports = function replaceNonAlphabetic(text) {
  return new Promise((resolve, reject) => {
    try {
      const regex = /[^a-zA-Z]/g;
      const result = text.replace(regex, "");
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};