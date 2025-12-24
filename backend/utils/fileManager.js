const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Data klasörünü oluştur
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getFilePath(filename) {
  return path.join(dataDir, filename);
}

function readFile(filename) {
  try {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error);
    return [];
  }
}

function writeFile(filename, data) {
  try {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filename}:`, error);
    return false;
  }
}

function getNextId(items) {
  if (items.length === 0) return 1;
  const maxId = Math.max(...items.map(item => item.id || 0));
  return maxId + 1;
}

module.exports = {
  readFile,
  writeFile,
  getNextId
};

