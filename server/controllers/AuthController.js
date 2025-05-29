const { Account, Role } = require('../models/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateAccessToken = (account) => {
  return jwt.sign(
    {
      id: account.id,
      role: account.Role.name_of_role // Используем название роли из связанной модели
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};
const generateRefreshToken = (account) => {
  return jwt.sign(
    { id: account.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { login, password, first_name, last_name, patronymic } = req.body;
    
    // Проверка существующего логина
    const existingAccount = await Account.findOne({ where: { login } });
    if (existingAccount) {
      return res.status(409).json({ message: 'Логин уже занят' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Получение роли USER
    const userRole = await Role.findOne({ where: { name_of_role: 'USER' } });
    if (!userRole) {
      return res.status(500).json({ message: 'Роль USER не найдена в системе' });
    }

    // Создание аккаунта
    const newAccount = await Account.create({
      login,
      password: hashedPassword,
      first_name,
      last_name,
      patronymic,
      role_id: userRole.id
    });

    // Получение полной информации аккаунта с ролью
    const accountWithRole = await Account.findByPk(newAccount.id, {
      include: [{
        model: Role,
        attributes: ['name_of_role'],
        required: true
      }]
    });

    // Генерация токенов
    const accessToken = generateAccessToken(accountWithRole);
    const refreshToken = generateRefreshToken(accountWithRole);

    // Формирование ответа
    res.status(201).json({
      accessToken,
      refreshToken,
      account: {
        id: accountWithRole.id,
        login: accountWithRole.login,
        role: accountWithRole.Role.name_of_role,
        first_name: accountWithRole.first_name,
        last_name: accountWithRole.last_name
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка регистрации: ' + error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    const account = await Account.findOne({ 
      where: { login },
      include: [Role]
    });

    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const accessToken = generateAccessToken(account);
    const refreshToken = generateRefreshToken(account);

    res.json({
      accessToken,
      refreshToken,
      account: {
        id: account.id,
        login: account.login,
        role: account.Role.name_of_role,
        first_name: account.first_name,
        last_name: account.last_name
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Ошибка входа: ' + error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Токен отсутствует' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const account = await Account.findByPk(decoded.id, {
      include: [Role]
    });

    if (!account) return res.status(404).json({ message: 'Пользователь не найден' });

    const newAccessToken = generateAccessToken(account);
    const newRefreshToken = generateRefreshToken(account);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    res.status(401).json({ message: 'Недействительный токен' });
  }
};