const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let bookings = [];

app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
    const newBooking = { id: bookings.length + 1, ...req.body };
    bookings.push(newBooking);
    res.status(201).json({ message: "Booking successful!", booking: newBooking });
});

app.delete('/api/bookings/:id', (req, res) => {
    bookings = bookings.filter(b => b.id !== parseInt(req.params.id));
    res.json({ message: "Booking deleted" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));