const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./authMiddleware');

const router = express.Router();
let users = [];
let nextId = 1;

async function seedUsers() {
    users.push({
        id: nextId++,
        name: 'Restaurant Admin',
        email: 'admin@burgerbonanza.com',
        passwordHash: await bcrypt.hash('Admin123!', 10),
        role: 'Admin'
    });
    users.push({
        id: nextId++,
        name: 'Floor Staff',
        email: 'staff@burgerbonanza.com',
        passwordHash: await bcrypt.hash('Staff123!', 10),
        role: 'Staff'
    });
}

// Exposed so tests can wait for the seeded Admin/Staff accounts to exist
// before logging in with them (bcrypt hashing is async).
const usersReady = seedUsers();

function toPublicUser(user) {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
}

function signToken(user) {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );
}

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: nextId++, name, email, passwordHash, role: 'Customer' };
    users.push(user);

    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
});

router.get('/me', verifyToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user: toPublicUser(user) });
});

module.exports = router;
module.exports.ready = usersReady;
