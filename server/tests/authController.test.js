// tests/authController.test.js
const { register, login, refreshToken } = require('../controllers/AuthController');
const { Account, Role } = require('../models/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

jest.mock('../models/models', () => ({
  Account: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
  },
  Role: {
    findOne: jest.fn()
  }
}));

jest.mock('express-validator', () => ({ validationResult: jest.fn() }));

jest.mock('jsonwebtoken', () => ({ sign: jest.fn() }));

const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('должен вернуть ошибки валидации если validationResult не пустой', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'Error' }] });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Error' }] });
    });

    it('должен вернуть 409 при дублировании логина', async () => {
      const req = mockRequest({ login: 'dup', password: 'p', first_name: 'A', last_name: 'B', patronymic: 'C' });
      const res = mockResponse();

      validationResult.mockReturnValue({ isEmpty: () => true });
      Account.findOne.mockResolvedValue({ id: 1 });

      await register(req, res);

      expect(Account.findOne).toHaveBeenCalledWith({ where: { login: 'dup' } });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Логин уже занят' });
    });

    it('должен вернуть 500, если роль USER не найдена', async () => {
      const req = mockRequest({ login: 'u', password: 'p', first_name: 'A', last_name: 'B', patronymic: 'C' });
      const res = mockResponse();

      validationResult.mockReturnValue({ isEmpty: () => true });
      Account.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue(null);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Роль USER не найдена в системе' });
    });

    it('должен успешно зарегистрировать нового пользователя', async () => {
      const req = mockRequest({ login: 'new', password: 'p', first_name: 'A', last_name: 'B', patronymic: 'C' });
      const res = mockResponse();

      validationResult.mockReturnValue({ isEmpty: () => true });
      Account.findOne.mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('hashed');
      Role.findOne.mockResolvedValue({ id: 2, name_of_role: 'USER' });
      const created = { id: 5, login: 'new', first_name: 'A', last_name: 'B', patronymic: 'C', role_id: 2 };
      Account.create.mockResolvedValue(created);
      const accountWithRole = { id: 5, login: 'new', first_name: 'A', last_name: 'B', patronymic: 'C', Role: { name_of_role: 'USER' } };
      Account.findByPk.mockResolvedValue(accountWithRole);
      jwt.sign.mockReturnValue('token123');

      await register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('p', 12);
      expect(Account.create).toHaveBeenCalledWith({ login: 'new', password: 'hashed', first_name: 'A', last_name: 'B', patronymic: 'C', role_id: 2 });
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: 'token123',
        refreshToken: 'token123',
        account: { id: 5, login: 'new', role: 'USER', first_name: 'A', last_name: 'B' }
      });
    });

    it('должен вернуть 500 при ошибке во время регистрации', async () => {
      const req = mockRequest({ login: 'new', password: 'p', first_name: 'A', last_name: 'B', patronymic: 'C' });
      const res = mockResponse();

      validationResult.mockReturnValue({ isEmpty: () => true });
      Account.findOne.mockRejectedValue(new Error('DB error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Ошибка регистрации') }));
    });
  });

  describe('login', () => {
    it('должен вернуть 401 при неверных учетных данных', async () => {
      const req = mockRequest({ login: 'u', password: 'p' });
      const res = mockResponse();

      Account.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Неверные учетные данные' });
    });

    it('должен вернуть токены и информацию аккаунта при корректных данных', async () => {
      const req = mockRequest({ login: 'u', password: 'p' });
      const res = mockResponse();

      const account = { id: 1, login: 'u', password: 'hashed', first_name: 'F', last_name: 'L', Role: { name_of_role: 'USER' } };
      Account.findOne.mockResolvedValue(account);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign.mockReturnValueOnce('access123').mockReturnValueOnce('refresh123');

      await login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('p', 'hashed');
      expect(res.json).toHaveBeenCalledWith({
        accessToken: 'access123',
        refreshToken: 'refresh123',
        account: { id: 1, login: 'u', role: 'USER', first_name: 'F', last_name: 'L' }
      });
    });

    it('должен вернуть 500 при ошибке входа', async () => {
      const req = mockRequest({ login: 'u', password: 'p' });
      const res = mockResponse();

      Account.findOne.mockRejectedValue(new Error('DB error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Ошибка входа') });
    });
  });

  describe('refreshToken', () => {
    it('должен вернуть 401 при отсутствии токена', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Токен отсутствует' });
    });

    it('должен вернуть 404 при несуществующем пользователе', async () => {
      const req = mockRequest({ refreshToken: 't' });
      const res = mockResponse();

      jwt.verify = jest.fn().mockReturnValue({ id: 10 });
      Account.findByPk.mockResolvedValue(null);

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' });
    });

    it('должен вернуть новые токены при корректном токене', async () => {
      const req = mockRequest({ refreshToken: 't' });
      const res = mockResponse();

      jwt.verify = jest.fn().mockReturnValue({ id: 10 });
      const account = { id: 10, Role: { name_of_role: 'ADMIN' } };
      Account.findByPk.mockResolvedValue(account);
      jwt.sign.mockReturnValueOnce('newAccess').mockReturnValueOnce('newRefresh');

      await refreshToken(req, res);

      expect(res.json).toHaveBeenCalledWith({ accessToken: 'newAccess', refreshToken: 'newRefresh' });
    });

    it('должен вернуть 401 при неверном токене', async () => {
      const req = mockRequest({ refreshToken: 'bad' });
      const res = mockResponse();

      jwt.verify = jest.fn(() => { throw new Error('Invalid'); });

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Недействительный токен' });
    });
  });
});