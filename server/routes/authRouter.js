const express = require('express');
const router = express.Router(); // Используем встроенный роутер
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');

router.post('/register',
  [
    body('login').isLength({ min: 3 }),
    body('password').isLength({ min: 6 }),
    body('first_name').notEmpty(),
    body('last_name').notEmpty()
  ],
  AuthController.register
);

router.post('/login', 
  [
    body('login').notEmpty(),
    body('password').notEmpty()
  ],
  AuthController.login
);

module.exports = router;