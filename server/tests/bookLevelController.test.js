// tests/bookLevelController.test.js
const { getAllBookLevels, getBookLevelById, createBookLevel, updateBookLevel, deleteBookLevel } = require('../controllers/BookLevelController');
const { BookLevel, RedBook } = require('../models/models');

jest.mock('../models/models', () => ({
  BookLevel: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  RedBook: {}
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('BookLevel Controller', () => {
  describe('getAllBookLevels', () => {
    it('возвращает список уровней книг', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const fake = [{ id: 1, name: 'level1' }];
      BookLevel.findAll.mockResolvedValue(fake);

      await getAllBookLevels(req, res);

      expect(BookLevel.findAll).toHaveBeenCalledWith({ include: [{ model: RedBook }], order: [['id', 'ASC']] });
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('возвращает 500 при ошибке', async () => {
      const req = mockRequest();
      const res = mockResponse();
      BookLevel.findAll.mockRejectedValue(new Error('DB'));  

      await getAllBookLevels(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB' });
    });
  });

  describe('getBookLevelById', () => {
    it('возвращает уровень по ID', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      const fake = { id: 1, name: 'x' };
      BookLevel.findByPk.mockResolvedValue(fake);

      await getBookLevelById(req, res);

      expect(BookLevel.findByPk).toHaveBeenCalledWith(1, { include: [{ model: RedBook }] });
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('возвращает 404, если не найдено', async () => {
      const req = mockRequest({}, { id: 2 });
      const res = mockResponse();
      BookLevel.findByPk.mockResolvedValue(null);

      await getBookLevelById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Book level not found' });
    });

    it('возвращает 500 при ошибке', async () => {
      const req = mockRequest({}, { id: 3 });
      const res = mockResponse();
      BookLevel.findByPk.mockRejectedValue(new Error('Fail'));  

      await getBookLevelById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fail' });
    });
  });

  describe('createBookLevel', () => {
    it('создает новый уровень', async () => {
      const req = mockRequest({ name: 'New' });
      const res = mockResponse();
      const fake = { id: 5, name: 'New' };
      BookLevel.create.mockResolvedValue(fake);

      await createBookLevel(req, res);

      expect(BookLevel.create).toHaveBeenCalledWith({ name: 'New' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it('возвращает 400 при ошибке валидации', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      BookLevel.create.mockRejectedValue(new Error('Validation'));  

      await createBookLevel(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation' });
    });
  });

  describe('updateBookLevel', () => {
    it('обновляет уровень', async () => {
      const req = mockRequest({ name: 'Upd' }, { id: 6 });
      const res = mockResponse();
      const fakeObj = { id: 6, update: jest.fn().mockResolvedValue({ id: 6, name: 'Upd' }) };
      BookLevel.findByPk.mockResolvedValue(fakeObj);

      await updateBookLevel(req, res);

      expect(BookLevel.findByPk).toHaveBeenCalledWith(6);
      expect(fakeObj.update).toHaveBeenCalledWith({ name: 'Upd' });
      expect(res.json).toHaveBeenCalledWith({ id: 6, name: 'Upd' });
    });

    it('404 если не найден', async () => {
      const req = mockRequest({ name: 'X' }, { id: 7 });
      const res = mockResponse();
      BookLevel.findByPk.mockResolvedValue(null);

      await updateBookLevel(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Book level not found' });
    });

    it('400 при ошибке', async () => {
      const req = mockRequest({ name: 'X' }, { id: 8 });
      const res = mockResponse();
      BookLevel.findByPk.mockRejectedValue(new Error('Fail'));  

      await updateBookLevel(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fail' });
    });
  });

  describe('deleteBookLevel', () => {
    it('удаляет уровень', async () => {
      const req = mockRequest({}, { id: 9 });
      const res = mockResponse();
      const fakeObj = { destroy: jest.fn().mockResolvedValue() };
      BookLevel.findByPk.mockResolvedValue(fakeObj);

      await deleteBookLevel(req, res);

      expect(BookLevel.findByPk).toHaveBeenCalledWith(9);
      expect(fakeObj.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Book level deleted successfully' });
    });

    it('404 при отсутствии', async () => {
      const req = mockRequest({}, { id: 10 });
      const res = mockResponse();
      BookLevel.findByPk.mockResolvedValue(null);

      await deleteBookLevel(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Book level not found' });
    });

    it('500 при ошибке', async () => {
      const req = mockRequest({}, { id: 11 });
      const res = mockResponse();
      BookLevel.findByPk.mockRejectedValue(new Error('Fail'));  

      await deleteBookLevel(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Fail' });
    });
  });
});