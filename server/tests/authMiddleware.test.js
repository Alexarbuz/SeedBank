// tests/authMiddleware.test.js

const authMiddleware = require('../middlewares/authMiddleware'); // путь к файлу с JWT-middleware
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('JWT Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: { authorization: '' }, method: 'GET' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('должен пропустить OPTIONS запрос без проверок', async () => {
    req.method = 'OPTIONS';
    const middleware = authMiddleware(['USER']);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('должен вернуть 401, если заголовок Authorization отсутствует', async () => {
    req.headers.authorization = '';
    const middleware = authMiddleware(['USER']);

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Не авторизован' });
  });

  it('должен вернуть 401, если токен некорректен', async () => {
    req.headers.authorization = 'Bearer invalid.token.here';
    jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
    const middleware = authMiddleware(['USER']);

    await middleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('invalid.token.here', process.env.JWT_ACCESS_SECRET);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Не авторизован' });
  });

  it('должен вернуть 403, если роль пользователя не входит в allowedRoles', async () => {
    const fakePayload = { id: 1, role: 'GUEST' };
    req.headers.authorization = 'Bearer valid.token';
    jwt.verify.mockReturnValue(fakePayload);

    const middleware = authMiddleware(['ADMIN', 'USER']);

    await middleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid.token', process.env.JWT_ACCESS_SECRET);
    expect(req.account).toEqual(fakePayload);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Доступ запрещен' });
  });

  it('должен пропустить, если токен валидный и роль входит в allowedRoles', async () => {
    const fakePayload = { id: 2, role: 'USER' };
    req.headers.authorization = 'Bearer valid.token';
    jwt.verify.mockReturnValue(fakePayload);

    const middleware = authMiddleware(['ADMIN', 'USER']);

    await middleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid.token', process.env.JWT_ACCESS_SECRET);
    expect(req.account).toEqual(fakePayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
