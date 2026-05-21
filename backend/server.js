const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let bookings = [];
let settings = {
    tableCapacity: 40,
    openingTime: "12:00",
    closingTime: "21:00"
};

app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

app.get('/api/settings', (req, res) => {
    res.json(settings);
});

app.post('/api/bookings', (req, res) => {
    const newBooking = { id: bookings.length + 1, ...req.body };
    bookings.push(newBooking);
    res.status(201).json({ message: "Booking successful!", booking: newBooking });
});

app.put('/api/bookings/:id', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
        return res.status(404).json({ message: "Booking not found" });
    }

    bookings[bookingIndex] = { ...bookings[bookingIndex], ...req.body, id: bookingId };
    res.json({ message: "Booking updated", booking: bookings[bookingIndex] });
});

app.put('/api/settings', (req, res) => {
    settings = { ...settings, ...req.body };
    res.json({ message: "Settings updated", settings });
});

app.delete('/api/bookings/:id', (req, res) => {
    bookings = bookings.filter(b => b.id !== parseInt(req.params.id));
    res.json({ message: "Booking deleted" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
