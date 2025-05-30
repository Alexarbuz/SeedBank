const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AccountController = require('../controllers/AccountController');
const authMiddleware = require('../middlewares/authMiddleware')();
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

// Получение всех аккаунтов (только ADMIN)
router.get(
  '/',
  authMiddleware,        // 1. Проверяем аутентификацию
  checkRoleMiddleware(['ADMIN']), // 2. Проверяем роль
  AccountController.getAllAccounts
);

// Получение аккаунта по ID (только ADMIN)
router.get(
  '/:id',
  authMiddleware,
  AccountController.getAccountById
);
router.post(
  '/',
  authMiddleware,
  checkRoleMiddleware(['ADMIN']),
  [
    
    body('first_name').notEmpty().withMessage('Имя обязательно'),
    body('last_name').notEmpty().withMessage('Фамилия обязательна'),
    body('patronymic'),
    body('login').isLength({ min: 3 }).withMessage('Логин должен быть не менее 3 символов'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
    body('role_id').isInt().withMessage('ID роли должен быть числом')
  ],
  AccountController.createAccount
);
// Обновление аккаунта
router.put(
  '/:id',
  authMiddleware,
  [
    body('login').optional().isLength({ min: 3 }),
    body('password').optional().isLength({ min: 6 }),
    body('first_name').optional().notEmpty(),
    body('last_name').optional().notEmpty()
  ],
  (req, res, next) => {
    if (req.account.role !== 'ADMIN' && req.params.id !== req.account.id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Вы можете редактировать только свой профиль'
      });
    }
    next();
  },
  AccountController.updateAccount
);

// Удаление аккаунта (только ADMIN)
router.delete(
  '/:id',
  authMiddleware,
  checkRoleMiddleware(['ADMIN']),
  AccountController.deleteAccount
);


module.exports = router;