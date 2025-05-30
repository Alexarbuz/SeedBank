const { Account, Role, Seed } = require('../models/models');
const bcrypt = require('bcrypt');
exports.getMe = async (req, res) => {
  try {
    const account = await Account.findByPk(req.account.id, {
      attributes: { exclude: ['password'] },
      include: [Role]
    });
    
    if (!account) return res.status(404).json({ message: 'Пользователь не найден' });
    
    res.json({
      id: account.id,
      login: account.login,
      role: account.Role.name_of_role,
      first_name: account.first_name,
      last_name: account.last_name
    });

  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения данных' });
  }
};

exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      attributes: { exclude: ['password'] },
      include: [Role],
      order: [['id', 'ASC']]
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения списка пользователей' });
  }
};

exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [Role]
    });

    if (!account) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(account);

  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения данных пользователя' });
  }
};
exports.createAccount = async (req, res) => {
  try {
    const { first_name, last_name, patronymic, login, password, role_id } = req.body;

    if (!first_name || !last_name || !login || !password || !role_id) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }

    const existingAccount = await Account.findOne({ where: { login } });
    if (existingAccount) {
      return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newAccount = await Account.create({
      first_name,
      last_name,
      patronymic,
      login,
      password: hashedPassword,
      role_id
    });

    res.status(201).json({
      id: newAccount.id,
      login: newAccount.login,
      first_name: newAccount.first_name,
      last_name: newAccount.last_name,
      patronymic: newAccount.patronymic,
      role_id: newAccount.role_id
    });
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    res.status(500).json({ message: 'Ошибка создания пользователя' });
  }
};

exports.updateAccount = async (req, res) => { 
  try {

    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: 'Пользователь не найден' });

    const updatedData = { ...req.body };

    if (req.account.role !== 'ADMIN' && 'role_id' in updatedData) {
      delete updatedData.role_id;
    }

    if (updatedData.password) {
      try {
        updatedData.password = await bcrypt.hash(updatedData.password, 12);
      } catch (bcryptError) {
        console.error('Ошибка при хешировании пароля:', bcryptError);
        return res.status(400).json({ message: 'Некорректный пароль' });
      }
    }

    const updatedAccount = await account.update(updatedData);
    res.json({
      id: updatedAccount.id,
      login: updatedAccount.login,
      first_name: updatedAccount.first_name,
      last_name: updatedAccount.last_name,
      patronymic: updatedAccount.patronymic
    });

  } catch (error) {
    console.error('Ошибка обновления аккаунта:', error);
    res.status(500).json({ message: 'Ошибка обновления данных' });
  }
};
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: 'Пользователь не найден' });

    await account.destroy();
    res.json({ message: 'Аккаунт успешно удален' });

  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления аккаунта' });
  }
};