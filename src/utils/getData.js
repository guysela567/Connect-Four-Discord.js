const fs = require('fs').promises;

module.exports = async query => {
  const dir = `./src/db/${query}.json`;
  try {
    const data = await fs.readFile(dir);
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
  }
}