const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "database.json");

// Initial structure for the JSON database
const initialState = {
  disasters: [],
  relief_camps: [],
  resources: [],
  victims: [],
  alerts: [],
  agencies: [],
  disaster_agency: []
};

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(initialState, null, 2));
  console.log("Database initialized: database.json created");
}

const db = {
  // Helper to read data
  read: () => {
    try {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading database:", err);
      return initialState;
    }
  },

  // Helper to write data
  write: (data) => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error writing to database:", err);
    }
  },

  // Helper to get a specific table
  getTable: (tableName) => {
    const data = db.read();
    return data[tableName] || [];
  },

  // Helper to insert into a table
  insert: (tableName, item) => {
    const data = db.read();
    if (!data[tableName]) data[tableName] = [];
    
    // Auto-generate ID if not provided (and if numeric)
    if (!item.id && !item.alert_id && !item.victim_id && !item.camp_id && !item.resource_id && !item.agency_id) {
       const table = data[tableName];
       const maxId = table.length > 0 ? Math.max(...table.map(i => i.id || 0)) : 0;
       item.id = maxId + 1;
    }

    data[tableName].push(item);
    db.write(data);
    return item;
  }
};

console.log("JSON Database System Loaded (Zero-XAMPP Mode)");

module.exports = db;