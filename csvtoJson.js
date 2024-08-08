const fs = require('fs');
const path = require('path');
const db = require('./db');
require('dotenv').config();

function parseCSVLine(line) {
  return line.split(',').map(item => item.trim());
}

function parseCSVToJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const json = {};

    headers.forEach((header, index) => {
      const keys = header.split('.');
      let current = json;

      keys.forEach((key, keyIndex) => {
        if (keyIndex === keys.length - 1) {
          current[key] = values[index];
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
    });

    return json;
  });
}

async function insertDataIntoDB(jsonArray) {
  for (const jsonObject of jsonArray) {
    const firstName = jsonObject.name?.firstName;
    const lastName = jsonObject.name?.lastName;

    if (!firstName || !lastName) {
      console.error('Missing firstName or lastName in the data:', jsonObject);
      continue;
    }

    const name = `${firstName} ${lastName}`;
    const { age, address, ...additionalInfo } = jsonObject;
    
    delete additionalInfo.name;

    const addressJson = {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
    };

    await db.insertUser({
      name,
      age: parseInt(age, 10),
      address: addressJson,
      additional_info: additionalInfo,
    });
  }
}


async function calculateAgeDistribution() {
  const users = await db.getAllUsers();
  const ageGroups = { '<20': 0, '20-40': 0, '40-60': 0, '>60': 0 };
  const totalUsers = users.length;

  users.forEach(user => {
    const age = user.age;
    if (age < 20) ageGroups['<20']++;
    else if (age <= 40) ageGroups['20-40']++;
    else if (age <= 60) ageGroups['40-60']++;
    else ageGroups['>60']++;
  });

  for (const group in ageGroups) {
    ageGroups[group] = ((ageGroups[group] / totalUsers) * 100).toFixed(2);
  }

  console.log('Age-Group % Distribution:');
  console.log(ageGroups);
}

module.exports = {
  parseCSVToJson,
  insertDataIntoDB,
  calculateAgeDistribution,
};
