const express = require('express');
const db = require('./db');
const { parseCSVToJson, insertDataIntoDB, calculateAgeDistribution } = require('./csvtoJson');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/upload-csv', async (req, res) => {
  try {
    const jsonArray = parseCSVToJson(process.env.CSV_FILE_PATH);
    await insertDataIntoDB(jsonArray);
    await calculateAgeDistribution();
    res.send('Data uploaded and age distribution calculated. Check console for details.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

db.createTable().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
