// tests/redBookController.test.js

const {
  getAllRedBooks,
  getRedBookById,
  createRedBook,
  updateRedBook,
  deleteRedBook,
} = require('../controllers/RedBookController');
const { RedBook, BookLevel, Seed } = require('../models/models');

jest.mock('../models/models', () => ({
  RedBook: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  BookLevel: {},
  Seed: {},
}));

// Заглушки для req и res
const mockRequest = (body = {}, params = {}) => ({
  body,
  params,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('RedBook Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRedBooks', () => {
    it('должен вернуть список всех красных книг', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const fakeRedBooks = [
        { id: 1, title: 'Species A', BookLevel: {}, RedBookRF: [], RedBookSO: [] },
        { id: 2, title: 'Species B', BookLevel: {}, RedBookRF: [], RedBookSO: [] },
      ];
      RedBook.findAll.mockResolvedValue(fakeRedBooks);

      await getAllRedBooks(req, res);

      expect(RedBook.findAll).toHaveBeenCalledWith({
        include: [
          { model: BookLevel },
          { model: Seed, as: 'RedBookRF' },
          { model: Seed, as: 'RedBookSO' },
        ],
        order: [['id', 'ASC']],
      });
      expect(res.json).toHaveBeenCalledWith(fakeRedBooks);
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest();
      const res = mockResponse();

      RedBook.findAll.mockRejectedValue(new Error('DB error'));

      await getAllRedBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getRedBookById', () => {
    it('должен вернуть красную книгу по id', async () => {
      const req = mockRequest({}, { id: '5' });
      const res = mockResponse();

      const fakeRedBook = {
        id: 5,
        title: 'Species A',
        BookLevel: {},
        RedBookRF: [],
        RedBookSO: [],
      };
      RedBook.findByPk.mockResolvedValue(fakeRedBook);

      await getRedBookById(req, res);

      expect(RedBook.findByPk).toHaveBeenCalledWith('5', {
        include: [
          { model: BookLevel },
          { model: Seed, as: 'RedBookRF' },
          { model: Seed, as: 'RedBookSO' },
        ],
      });
      expect(res.json).toHaveBeenCalledWith(fakeRedBook);
    });

    it('должен вернуть 404, если красная книга не найдена', async () => {
      const req = mockRequest({}, { id: '6' });
      const res = mockResponse();

      RedBook.findByPk.mockResolvedValue(null);

      await getRedBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Red book not found' });
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest({}, { id: '7' });
      const res = mockResponse();

      RedBook.findByPk.mockRejectedValue(new Error('DB failure'));

      await getRedBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failure' });
    });
  });

  describe('createRedBook', () => {
    it('должен создать новую красную книгу', async () => {
      const req = mockRequest({ title: 'New Species', levelId: 2 });
      const res = mockResponse();

      const fakeCreated = { id: 10, title: 'New Species', levelId: 2 };
      RedBook.create.mockResolvedValue(fakeCreated);

      await createRedBook(req, res);

      expect(RedBook.create).toHaveBeenCalledWith({ title: 'New Species', levelId: 2 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeCreated);
    });

    it('должен вернуть 400 при ошибке валидации', async () => {
      const req = mockRequest({ title: '' });
      const res = mockResponse();

      RedBook.create.mockRejectedValue(new Error('Validation error'));

      await createRedBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation error' });
    });
  });

  describe('updateRedBook', () => {
    it('должен обновить существующую красную книгу', async () => {
      const req = mockRequest({ title: 'Updated Title' }, { id: '8' });
      const res = mockResponse();

      const fakeInstance = {
        id: 8,
        title: 'Old Title',
        update: jest.fn().mockResolvedValue({ id: 8, title: 'Updated Title' }),
      };
      RedBook.findByPk.mockResolvedValue(fakeInstance);

      await updateRedBook(req, res);

      expect(RedBook.findByPk).toHaveBeenCalledWith('8');
      expect(fakeInstance.update).toHaveBeenCalledWith({ title: 'Updated Title' });
      expect(res.json).toHaveBeenCalledWith({ id: 8, title: 'Updated Title' });
    });

    it('должен вернуть 404, если красная книга не найдена', async () => {
      const req = mockRequest({ title: 'X' }, { id: '9' });
      const res = mockResponse();

      RedBook.findByPk.mockResolvedValue(null);

      await updateRedBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Red book not found' });
    });

    it('должен вернуть 400 при ошибке обновления', async () => {
      const req = mockRequest({ title: 'Y' }, { id: '10' });
      const res = mockResponse();

      RedBook.findByPk.mockRejectedValue(new Error('Update error'));

      await updateRedBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });

    it('должен вернуть 400, если внутренняя ошибка update', async () => {
      const req = mockRequest({ title: 'Z' }, { id: '11' });
      const res = mockResponse();

      const fakeInstance = {
        id: 11,
        title: 'Title',
        update: jest.fn().mockRejectedValue(new Error('Inner update error')),
      };
      RedBook.findByPk.mockResolvedValue(fakeInstance);

      await updateRedBook(req, res);

      expect(fakeInstance.update).toHaveBeenCalledWith({ title: 'Z' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inner update error' });
    });
  });

  describe('deleteRedBook', () => {
    it('должен удалить существующую красную книгу', async () => {
      const req = mockRequest({}, { id: '12' });
      const res = mockResponse();

      const fakeInstance = {
        id: 12,
        destroy: jest.fn().mockResolvedValue(),
      };
      RedBook.findByPk.mockResolvedValue(fakeInstance);

      await deleteRedBook(req, res);

      expect(RedBook.findByPk).toHaveBeenCalledWith('12');
      expect(fakeInstance.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Red book deleted successfully' });
    });

    it('должен вернуть 404, если красная книга не найдена', async () => {
      const req = mockRequest({}, { id: '13' });
      const res = mockResponse();

      RedBook.findByPk.mockResolvedValue(null);

      await deleteRedBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Red book not found' });
    });

    it('должен вернуть 500 при ошибке удаления', async () => {
      const req = mockRequest({}, { id: '14' });
      const res = mockResponse();

      RedBook.findByPk.mockRejectedValue(new Error('Delete error'));

      await deleteRedBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
    });
  });
});
