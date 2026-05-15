const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("LifeLine Backend Running (JSON DB Mode)");
});

/* ---------------- GET ALL DISASTERS ---------------- */
app.get("/api/disasters", (req, res) => {
  const data = db.getTable("disasters");
  res.json(data.sort((a, b) => (b.id || 0) - (a.id || 0)));
});

/* ---------------- ADD DISASTER ---------------- */
app.post("/api/disasters", (req, res) => {
  const { name, type, date, location, affected, status, severity, description } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: "Name and Type required" });
  }

  const newItem = db.insert("disasters", {
    id: Date.now(), // Use timestamp as simple unique ID
    name, type, date, location, affected, status, severity, description
  });

  res.json({ success: true, id: newItem.id });
});


/* ---------------- GET ALL RELIEF CAMPS ---------------- */
app.get("/api/relief-camps", (req, res) => {
  const camps = db.getTable("relief_camps");
  const disasters = db.getTable("disasters");

  // Join simulation
  const result = camps.map(rc => {
    const d = disasters.find(dis => dis.id == rc.disaster_id);
    return { ...rc, disaster_name: d ? d.name : "Unknown" };
  });

  res.json(result.sort((a, b) => (b.camp_id || 0) - (a.camp_id || 0)));
});

/* ---------------- ADD RELIEF CAMP ---------------- */
app.post("/api/relief-camps", (req, res) => {
  const {
    camp_id,
    name,
    location,
    capacity,
    occupancy,
    status,
    coordinator,
    disaster_id
  } = req.body;

  if (!camp_id || !name) {
    return res.status(400).json({ error: "Camp ID and Name required" });
  }

  db.insert("relief_camps", {
    camp_id, name, location, capacity, occupancy, status, coordinator, disaster_id
  });

  res.json({ success: true, message: "Relief camp added" });
});


/* ---------------- GET ALL RESOURCES ---------------- */
app.get("/api/resources", (req, res) => {
  const resources = db.getTable("resources");
  const camps = db.getTable("relief_camps");

  const result = resources.map(r => {
    const rc = camps.find(camp => camp.camp_id == r.camp_id);
    return { ...r, camp_name: rc ? rc.name : "Central Depot" };
  });

  res.json(result.sort((a, b) => (b.resource_id || 0) - (a.resource_id || 0)));
});

/* ---------------- ADD RESOURCE ---------------- */
app.post("/api/resources", (req, res) => {
  const { resource_id, name, type, quantity, status, camp_id } = req.body;

  if (!resource_id || !name) {
    return res.status(400).json({ error: "Resource ID and Name required" });
  }

  db.insert("resources", { resource_id, name, type, quantity, status, camp_id });
  res.json({ success: true });
});

/* ---------------- GET ALL VICTIMS ---------------- */
app.get("/api/victims", (req, res) => {
  const victims = db.getTable("victims");
  const disasters = db.getTable("disasters");
  const camps = db.getTable("relief_camps");

  const result = victims.map(v => {
    const d = disasters.find(dis => dis.id == v.disaster_id);
    const rc = camps.find(camp => camp.camp_id == v.camp_id);
    return {
      ...v,
      disaster_name: d ? d.name : "N/A",
      camp_name: rc ? rc.name : "N/A"
    };
  });

  res.json(result.sort((a, b) => (b.victim_id || 0) - (a.victim_id || 0)));
});


/* ---------------- ADD VICTIM ---------------- */
app.post("/api/victims", (req, res) => {
  const { victim_id, name, age, gender, phone, status, injury_status, disaster_id, camp_id } = req.body;

  if (!victim_id || !name) {
    return res.status(400).json({ error: "Victim ID and Name required" });
  }

  db.insert("victims", { victim_id, name, age, gender, phone, status, injury_status, disaster_id, camp_id });
  res.json({ success: true });
});

/* ---------------- GET ALL ALERTS ---------------- */
app.get("/api/alerts", (req, res) => {
  const alerts = db.getTable("alerts");
  const disasters = db.getTable("disasters");

  const result = alerts.map(a => {
    const d = disasters.find(dis => dis.id == a.disaster_id);
    return { ...a, disaster_name: d ? d.name : "General" };
  });

  res.json(result.sort((a, b) => (b.alert_id || 0) - (a.alert_id || 0)));
});


/* ---------------- ADD ALERT ---------------- */
app.post("/api/alerts", (req, res) => {
  const { title, message, disaster_id, severity, location, issued_by } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and Message required" });
  }

  db.insert("alerts", {
    alert_id: Date.now(),
    title, message, disaster_id, severity, location, issued_by,
    ts: new Date().toISOString()
  });

  res.json({ success: true });
});

// ================= AGENCIES =================

app.get("/api/agencies", (req, res) => {
  const data = db.getTable("agencies");
  res.json(data);
});

app.post("/api/agencies", (req, res) => {
  const { agency_id, name, type, contact, location } = req.body;
  db.insert("agencies", { agency_id, name, type, contact, location });
  res.send("Agency added successfully");
});


// ================= DISASTER_AGENCY =================

app.get("/api/disaster-agencies", (req, res) => {
  const data = db.getTable("disaster_agency");
  res.json(data);
});

app.post("/api/disaster-agencies", (req, res) => {
  const { disaster_id, agency_id } = req.body;
  db.insert("disaster_agency", { disaster_id, agency_id });
  res.send("Mapping added successfully");
});

/* ---------------- START SERVER ---------------- */
app.listen(5000, () => {
  console.log("Server running on port 5000 (JSON Database Mode)");
});
