require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./auth');
const { verifyToken, requireRole } = require('./authMiddleware');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

let bookings = [];
let settings = {
    tableCapacity: 40,
    openingTime: "12:00",
    closingTime: "21:00"
};

app.get('/api/bookings', verifyToken, (req, res) => {
    res.json(bookings);
});

app.get('/api/settings', (req, res) => {
    res.json(settings);
});

function seatsBooked(date, time, excludeId = null) {
    return bookings
        .filter(b => b.date === date && b.time === time && b.id !== excludeId)
        .reduce((sum, b) => sum + (parseInt(b.party_size) || 0), 0);
}

app.post('/api/bookings', verifyToken, (req, res) => {
    const { date, time, party_size } = req.body;
    const partySize = parseInt(party_size);

    if (!date || !time || !Number.isInteger(partySize) || partySize <= 0) {
        return res.status(400).json({ message: "Date, time and a valid party size are required." });
    }

    const booked = seatsBooked(date, time);
    if (booked + partySize > settings.tableCapacity) {
        const remaining = Math.max(settings.tableCapacity - booked, 0);
        return res.status(409).json({
            message: remaining > 0
                ? `Only ${remaining} seat(s) left for ${time} on ${date}.`
                : `${time} on ${date} is fully booked.`
        });
    }

    const newBooking = { id: bookings.length + 1, ...req.body, customerId: req.user.id };
    bookings.push(newBooking);
    res.status(201).json({ message: "Booking successful!", booking: newBooking });
});

app.put('/api/bookings/:id', verifyToken, requireRole('Staff', 'Admin'), (req, res) => {
    const bookingId = parseInt(req.params.id);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
        return res.status(404).json({ message: "Booking not found" });
    }

    const updated = { ...bookings[bookingIndex], ...req.body, id: bookingId };
    const partySize = parseInt(updated.party_size);

    if (!updated.date || !updated.time || !Number.isInteger(partySize) || partySize <= 0) {
        return res.status(400).json({ message: "Date, time and a valid party size are required." });
    }

    const booked = seatsBooked(updated.date, updated.time, bookingId);
    if (booked + partySize > settings.tableCapacity) {
        const remaining = Math.max(settings.tableCapacity - booked, 0);
        return res.status(409).json({
            message: remaining > 0
                ? `Only ${remaining} seat(s) left for ${updated.time} on ${updated.date}.`
                : `${updated.time} on ${updated.date} is fully booked.`
        });
    }

    bookings[bookingIndex] = updated;
    res.json({ message: "Booking updated", booking: bookings[bookingIndex] });
});

app.put('/api/settings', verifyToken, requireRole('Admin'), (req, res) => {
    settings = { ...settings, ...req.body };
    res.json({ message: "Settings updated", settings });
});

app.delete('/api/bookings/:id', verifyToken, requireRole('Staff', 'Admin'), (req, res) => {
    bookings = bookings.filter(b => b.id !== parseInt(req.params.id));
    res.json({ message: "Booking deleted" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
