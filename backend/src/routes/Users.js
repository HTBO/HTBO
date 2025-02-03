const express = require('express');
const router = express.Router();

let users = []; // Ideiglenes "adatbázis"

router.post('/users', (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
});

module.exports = router;