const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Ensure uploads folder exists
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// 📂 File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// 🔗 MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/complaintsDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// 📦 Schema
const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  language: String,
  category: String,
  description: String,
  file: String,
  status: { type: String, default: "Pending" }
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);

// 🔐 OTP Store (demo)
let otpStore = {};

// 📲 Send OTP
app.post("/send-otp", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).send({ message: "Phone required" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  otpStore[phone] = otp;

  console.log("📲 OTP for", phone, ":", otp);

  res.send({ success: true });
});

// ✅ Verify OTP
app.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (otpStore[phone] == otp) {
    return res.send({ success: true });
  }

  res.send({ success: false });
});

// 📩 Submit Complaint
app.post("/complaint", upload.single("file"), async (req, res) => {
  console.log("🔥 /complaint API HIT");

  try {
    console.log("📥 Incoming:", req.body);

    // basic validation
    if (!req.body.name || !req.body.phone) {
      return res.status(400).send({ message: "Name & Phone required" });
    }

    const saved = await Complaint.create({
      name: req.body.name,     
      phone: req.body.phone,   
      language: req.body.language,
      category: req.body.category,
      description: req.body.description,
      file: req.file ? req.file.filename : ""
    });
    console.log("✅ Saved to DB:", saved);

    res.send({ success: true, message: "Complaint Submitted" });

  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).send({ success: false, message: "Database Error" });
  }
});

// 📊 Get Complaints
app.get("/complaints", async (req, res) => {
  try {
    const data = await Complaint.find().sort({ createdAt: -1 });
    res.send(data);
  } catch (err) {
    res.status(500).send({ message: "Fetch error" });
  }
});

// ✅ Update Status
app.put("/update/:id", async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, { status: "Resolved" });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ message: "Update failed" });
  }
});

// 🚀 Start Server
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});