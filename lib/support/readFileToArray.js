const fs = require('fs').promises;
const os = require('os');

module.exports = async function readFileToArray(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
        const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    return normalizedContent.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};