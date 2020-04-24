const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('../api/secrets');

const Users = require('../models/users-model');

router.post('/register', (req, res) => {
  const user = req.body;
  const rounds = 12;
  const hash = bcrypt.hashSync(user.password, rounds);

  user.password = hash;

  Users.addUser(user)
    .then((response) => {
      res
        .status(201)
        .json({ message: 'Thanks for registering', data: user });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(201).json({ message: 'Welcome!', token });
      } else {
        res.status(401).json({ message: 'Invalid Username and Password' });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err.message });
    });
});

function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
  };

  const secret = secrets.jwtSecret;

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, secret, options);
}

module.exports = router;
