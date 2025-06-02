// tests/roleMiddleware.test.js

const roleMiddleware = require('../middlewares/checkRoleMiddleware'); // путь к файлу с middleware ролей

describe('Role-based Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { account: { role: 'USER' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('должен пропустить, если роль есть в списке allowedRoles', () => {
    const allowed = ['ADMIN', 'USER'];
    const middleware = roleMiddleware(allowed);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('должен вернуть 403, если роль отсутствует в allowedRoles', () => {
    const allowed = ['ADMIN'];
    const middleware = roleMiddleware(allowed);

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Недостаточно прав',
    });
  });

  it('должен вернуть 403, если в req.account.role нет нужных данных', () => {
    // имитируем отсутствие поля role
    req.account = {};
    const allowed = ['ADMIN'];
    const middleware = roleMiddleware(allowed);

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Недостаточно прав',
    });
  });
});
