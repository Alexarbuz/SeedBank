// tests/errorHandler.test.js

const errorHandler = require('../middlewares/errorHandler'); // путь к файлу с errorHandler

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('должен вернуть 500 и тело ошибки', () => {
    const err = new Error('Some failure');
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Some failure',
    });
  });

  it('должен логировать стек ошибки и возвращать 500', () => {
    console.error = jest.fn();
    const err = new Error('Critical');
    err.stack = 'Some stack trace';

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith('Some stack trace');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Critical',
    });
  });
});
