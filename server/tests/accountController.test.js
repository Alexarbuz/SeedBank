// tests/accountController.test.js

const { getMe, getAllAccounts, getAccountById, createAccount, updateAccount, deleteAccount } = require('../controllers/AccountController');
const { Account, Role } = require('../models/models');
const bcrypt = require('bcrypt');

jest.mock('../models/models', () => ({
  Account: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Role: {},
}));

// Заглушки для req и res
const mockRequest = (body = {}, params = {}, account = {}) => ({
  body,
  params,
  account,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Account Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('должен вернуть данные учетной записи при существующем пользователе', async () => {
      const req = mockRequest({}, {}, { id: 1 });
      const res = mockResponse();

      const fakeAccount = {
        id: 1,
        login: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        Role: { name_of_role: 'USER' },
      };
      Account.findByPk.mockResolvedValue(fakeAccount);

      await getMe(req, res);

      expect(Account.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password'] },
        include: [Role],
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        login: 'testuser',
        role: 'USER',
        first_name: 'Test',
        last_name: 'User',
      });
    });

    it('должен вернуть 404, если пользователь не найден', async () => {
      const req = mockRequest({}, {}, { id: 2 });
      const res = mockResponse();

      Account.findByPk.mockResolvedValue(null);

      await getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' });
    });

    it('должен вернуть 500 при исключении', async () => {
      const req = mockRequest({}, {}, { id: 3 });
      const res = mockResponse();

      Account.findByPk.mockRejectedValue(new Error('DB error'));

      await getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ошибка получения данных' });
    });
  });

  describe('getAllAccounts', () => {
    it('должен вернуть список аккаунтов', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const fakeAccounts = [{ id: 1, login: 'a' }, { id: 2, login: 'b' }];
      Account.findAll.mockResolvedValue(fakeAccounts);

      await getAllAccounts(req, res);

      expect(Account.findAll).toHaveBeenCalledWith({
        attributes: { exclude: ['password'] },
        include: [Role],
        order: [['id', 'ASC']],
      });
      expect(res.json).toHaveBeenCalledWith(fakeAccounts);
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Account.findAll.mockRejectedValue(new Error('DB error'));

      await getAllAccounts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ошибка получения списка пользователей' });
    });
  });

  describe('getAccountById', () => {
    it('должен вернуть аккаунт по id', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const fakeAccount = { id: 1, login: 'test' };
      Account.findByPk.mockResolvedValue(fakeAccount);

      await getAccountById(req, res);

      expect(Account.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password'] },
        include: [Role],
      });
      expect(res.json).toHaveBeenCalledWith(fakeAccount);
    });

    it('должен вернуть 404, если не найден', async () => {
      const req = mockRequest({}, { id: 2 });
      const res = mockResponse();

      Account.findByPk.mockResolvedValue(null);

      await getAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' });
    });

    it('должен вернуть 500 при ошибке', async () => {
      const req = mockRequest({}, { id: 3 });
      const res = mockResponse();

      Account.findByPk.mockRejectedValue(new Error('DB error'));

      await getAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ошибка получения данных пользователя' });
    });
  });

  describe('createAccount', () => {
    it('должен создать нового пользователя', async () => {
      const req = mockRequest(
        { first_name: 'A', last_name: 'B', patronymic: 'C', login: 'user', password: 'pass', role_id: 1 },
        {},
        {}
      );
      const res = mockResponse();

      Account.findOne.mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('hashed');
      const fakeNew = {
        id: 5,
        login: 'user',
        first_name: 'A',
        last_name: 'B',
        patronymic: 'C',
        role_id: 1,
      };
      Account.create.mockResolvedValue(fakeNew);

      await createAccount(req, res);

      expect(Account.findOne).toHaveBeenCalledWith({ where: { login: 'user' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 12);
      expect(Account.create).toHaveBeenCalledWith({
        first_name: 'A',
        last_name: 'B',
        patronymic: 'C',
        login: 'user',
        password: 'hashed',
        role_id: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 5,
        login: 'user',
        first_name: 'A',
        last_name: 'B',
        patronymic: 'C',
        role_id: 1,
      });
    });

    it('должен вернуть 400 при отсутствии обязательных полей', async () => {
      const req = mockRequest({ login: '', password: '' }, {}, {});
      const res = mockResponse();

      await createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Заполните все обязательные поля' });
    });

    it('должен вернуть 400 при дублировании логина', async () => {
      const req = mockRequest(
        { first_name: 'A', last_name: 'B', patronymic: 'C', login: 'dup', password: 'p', role_id: 1 },
        {},
        {}
      );
      const res = mockResponse();

      Account.findOne.mockResolvedValue({ id: 10 });

      await createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь с таким логином уже существует' });
    });

    it('должен вернуть 500 при ошибке записи', async () => {
      const req = mockRequest(
        { first_name: 'A', last_name: 'B', patronymic: 'C', login: 'user', password: 'p', role_id: 1 },
        {},
        {}
      );
      const res = mockResponse();

      Account.findOne.mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockRejectedValue(new Error('Hash error'));

      await createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ошибка создания пользователя' });
    });
  });

  describe('updateAccount', () => {
    it('должен обновить данные пользователя (администратор меняет роль)', async () => {
      const req = mockRequest({ first_name: 'X', role_id: 2 }, { id: 7 }, { role: 'ADMIN' });
      const res = mockResponse();

      const fakeAccount = {
        id: 7,
        login: 'u',
        first_name: 'Old',
        last_name: 'L',
        patronymic: 'P',
        update: jest.fn().mockResolvedValue({
          id: 7,
          login: 'u',
          first_name: 'X',
          last_name: 'L',
          patronymic: 'P',
        }),
      };
      Account.findByPk.mockResolvedValue(fakeAccount);

      await updateAccount(req, res);

      expect(Account.findByPk).toHaveBeenCalledWith(7);
      expect(fakeAccount.update).toHaveBeenCalledWith({ first_name: 'X', role_id: 2 });
      expect(res.json).toHaveBeenCalledWith({
        id: 7,
        login: 'u',
        first_name: 'X',
        last_name: 'L',
        patronymic: 'P',
      });
    });

    it('не должен позволить менять роль, если не ADMIN', async () => {
      const req = mockRequest({ role_id: 3 }, { id: 8 }, { role: 'USER' });
      const res = mockResponse();

      const fakeAccount = {
        id: 8,
        login: 'u',
        first_name: 'F',
        last_name: 'L',
        patronymic: 'P',
        update: jest.fn().mockResolvedValue({
          id: 8,
          login: 'u',
          first_name: 'F',
          last_name: 'L',
          patronymic: 'P',
        }),
      };
      Account.findByPk.mockResolvedValue(fakeAccount);

      await updateAccount(req, res);

      expect(fakeAccount.update).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        id: 8,
        login: 'u',
        first_name: 'F',
        last_name: 'L',
        patronymic: 'P',
      });
    });

    it('должен вернуть 404, если пользователь не найден', async () => {
      const req = mockRequest({ first_name: 'X' }, { id: 9 }, { role: 'ADMIN' });
      const res = mockResponse();

      Account.findByPk.mockResolvedValue(null);

      await updateAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' });
    });

    it('должен обрабатывать хеширование пароля', async () => {
      const req = mockRequest({ password: 'newpass' }, { id: 10 }, { role: 'ADMIN' });
      const res = mockResponse();

      const fakeAccount = {
        id: 10,
        login: 'u',
        first_name: 'F',
        last_name: 'L',
        patronymic: 'P',
        update: jest.fn().mockResolvedValue({
          id: 10,
          login: 'u',
          first_name: 'F',
          last_name: 'L',
          patronymic: 'P',
        }),
      };
      Account.findByPk.mockResolvedValue(fakeAccount);
      bcrypt.hash = jest.fn().mockResolvedValue('newhashed');

      await updateAccount(req, res);

      expect(fakeAccount.update).toHaveBeenCalledWith({ password: 'newhashed' });
      expect(res.json).toHaveBeenCalledWith({
        id: 10,
        login: 'u',
        first_name: 'F',
        last_name: 'L',
        patronymic: 'P',
      });
    });

    it('должен вернуть 500 при ошибке обновления', async () => {
      const req = mockRequest({ first_name: 'S' }, { id: 11 }, { role: 'ADMIN' });
      const res = mockResponse();

      Account.findByPk.mockRejectedValue(new Error('DB error'));

      await updateAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ошибка обновления данных' });
    });
  });

  describe('deleteAccount', () => {
    it('должен удалить пользователя', async () => {
      const req = mockRequest({}, { id: 12 });
      const res = mockResponse();

      const fakeAccount = { destroy: jest.fn().mockResolvedValue() };
      Account.findByPk.mockResolvedValue(fakeAccount);

      await deleteAccount(req, res);

      expect(Account.findByPk).toHaveBeenCalledWith(12);
      expect(fakeAccount.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Аккаунт успешно удален' });
    });

    it('должен вернуть 404, если не найден', async () => {
      const req = mockRequest({}, { id: 13 });
      const res = mockResponse();

      Account.findByPk.mockResolvedValue(null);

      await deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' });
    });

    it('должен вернуть 500 при ошибке удаления', async () => {
      const req = mockRequest({}, { id: 14 });
      const res = mockResponse();

      Account.findByPk.mockRejectedValue(new Error('DB error'));

      await deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Ошибка удаления аккаунта' });
    });
  });
});