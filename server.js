
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML, CSS and JavaScript
app.use(express.static(path.join(__dirname, "public")));

// Registration data file
const dataFolder = path.join(__dirname, "data");
const dataFile = path.join(dataFolder, "registrations.json");

// Create data folder and JSON file if missing
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]");
}

// College events
const events = [
    {
        id: "ev-1",
        name: "Intro to Artificial Intelligence",
        capacity: 60
    },
    {
        id: "ev-2",
        name: "Web Development Workshop",
        capacity: 30
    },
    {
        id: "ev-3",
        name: "Hackathon 2026",
        capacity: 40
    }
];

// Read registrations
function getRegistrations() {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// Save registrations
function saveRegistrations(data) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(data, null, 2)
    );
}

// Display events
app.get("/api/events", (req, res) => {
    const registrations = getRegistrations();

    const result = events.map(event => {
        const count = registrations.filter(
            r => r.eventId === event.id
        ).length;

        return {
            ...event,
            registered: count,
            seatsLeft: Math.max(event.capacity - count, 0)
        };
    });

    res.json(result);
});

// Get all registrations
app.get("/api/registrations", (req, res) => {
    const registrations = getRegistrations();
    res.json(registrations);
});

// Register student
app.post("/api/register", (req, res) => {

    const {
        name,
        roll,
        email,
        phone,
        department,
        year,
        eventId
    } = req.body;

    // Check required fields
    if (
        !name || !roll || !email ||
        !phone || !department || !year || !eventId
    ) {
        return res.status(400).json({
            message: "Please fill all required fields."
        });
    }

    // Validate student details
    if (String(name).trim().length < 2 ||
        String(name).trim().length > 60) {
        return res.status(400).json({
            message: "Enter a valid student name."
        });
    }

    if (!/^[A-Za-z0-9-]{3,20}$/.test(String(roll).trim())) {
        return res.status(400).json({
            message: "Invalid roll number."
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return res.status(400).json({
            message: "Enter a valid email address."
        });
    }

    if (!/^[0-9]{10}$/.test(String(phone).trim())) {
        return res.status(400).json({
            message: "Enter a valid 10-digit phone number."
        });
    }

    if (!["1", "2", "3", "4"].includes(String(year))) {
        return res.status(400).json({
            message: "Select a valid year."
        });
    }

    // Check event
    const selectedEvent = events.find(
        event => event.id === eventId
    );

    if (!selectedEvent) {
        return res.status(400).json({
            message: "Invalid event selected."
        });
    }

    const registrations = getRegistrations();

    // Prevent duplicate registration
    const duplicate = registrations.find(
        student =>
            student.eventId === eventId &&
            student.roll.toUpperCase() ===
            String(roll).trim().toUpperCase()
    );

    if (duplicate) {
        return res.status(409).json({
            message: "Student already registered for this event."
        });
    }

    // Check event capacity
    const eventCount = registrations.filter(
        student => student.eventId === eventId
    ).length;

    if (eventCount >= selectedEvent.capacity) {
        return res.status(409).json({
            message: "Event registration is full."
        });
    }

    // Create registration
    const newStudent = {
        id: Date.now().toString(),
        name: String(name).trim(),
        roll: String(roll).trim().toUpperCase(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        department,
        year,
        eventId,
        eventName: selectedEvent.name,
        registeredAt: new Date().toISOString()
    };

    // Save student details
    registrations.push(newStudent);
    saveRegistrations(registrations);

    res.status(201).json({
        message: "Student registered successfully!",
        student: newStudent
    });

});

// Start server
app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("College Event Registration System");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("--------------------------------");
});
