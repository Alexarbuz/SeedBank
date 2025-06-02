// tests/genusController.test.js

const {
  getAllGenera,
  getGenusById,
  createGenus,
  updateGenus,
  deleteGenus,
} = require('../controllers/GenusController');
const { Genus, Family, Specie } = require('../models/models');

jest.mock('../models/models', () => ({
  Genus: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Family: {},
  Specie: {},
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

describe('Genus Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllGenera', () => {
    it('должен вернуть список родов', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const fakeGenera = [
        { id: 1, name: 'Quercus', Family: {}, Species: [] },
        { id: 2, name: 'Rosa', Family: {}, Species: [] },
      ];
      Genus.findAll.mockResolvedValue(fakeGenera);

      await getAllGenera(req, res);

      expect(Genus.findAll).toHaveBeenCalledWith({
        include: [{ model: Family }, { model: Specie }],
        order: [['id', 'ASC']],
      });
      expect(res.json).toHaveBeenCalledWith(fakeGenera);
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Genus.findAll.mockRejectedValue(new Error('DB error'));

      await getAllGenera(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getGenusById', () => {
    it('должен вернуть род по id', async () => {
      const req = mockRequest({}, { id: '5' });
      const res = mockResponse();

      const fakeGenus = { id: 5, name: 'Quercus', Family: {}, Species: [] };
      Genus.findByPk.mockResolvedValue(fakeGenus);

      await getGenusById(req, res);

      expect(Genus.findByPk).toHaveBeenCalledWith('5', {
        include: [{ model: Family }, { model: Specie }],
      });
      expect(res.json).toHaveBeenCalledWith(fakeGenus);
    });

    it('должен вернуть 404, если род не найден', async () => {
      const req = mockRequest({}, { id: '6' });
      const res = mockResponse();

      Genus.findByPk.mockResolvedValue(null);

      await getGenusById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Genus not found' });
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest({}, { id: '7' });
      const res = mockResponse();

      Genus.findByPk.mockRejectedValue(new Error('DB failure'));

      await getGenusById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failure' });
    });
  });

  describe('createGenus', () => {
    it('должен создать новый род', async () => {
      const req = mockRequest({ name: 'Pinus', familyId: 1 });
      const res = mockResponse();

      const fakeCreated = { id: 10, name: 'Pinus', familyId: 1 };
      Genus.create.mockResolvedValue(fakeCreated);

      await createGenus(req, res);

      expect(Genus.create).toHaveBeenCalledWith({ name: 'Pinus', familyId: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeCreated);
    });

    it('должен вернуть 400 при ошибке валидации', async () => {
      const req = mockRequest({ name: '' });
      const res = mockResponse();

      Genus.create.mockRejectedValue(new Error('Validation error'));

      await createGenus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation error' });
    });
  });

  describe('updateGenus', () => {
    it('должен обновить род', async () => {
      const req = mockRequest({ name: 'UpdatedGenus' }, { id: '8' });
      const res = mockResponse();

      const fakeInstance = {
        id: 8,
        name: 'OldGenus',
        update: jest.fn().mockResolvedValue({ id: 8, name: 'UpdatedGenus' }),
      };
      Genus.findByPk.mockResolvedValue(fakeInstance);

      await updateGenus(req, res);

      expect(Genus.findByPk).toHaveBeenCalledWith('8');
      expect(fakeInstance.update).toHaveBeenCalledWith({ name: 'UpdatedGenus' });
      expect(res.json).toHaveBeenCalledWith({ id: 8, name: 'UpdatedGenus' });
    });

    it('должен вернуть 404, если род не найден', async () => {
      const req = mockRequest({ name: 'X' }, { id: '9' });
      const res = mockResponse();

      Genus.findByPk.mockResolvedValue(null);

      await updateGenus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Genus not found' });
    });

    it('должен вернуть 400 при ошибке обновления', async () => {
      const req = mockRequest({ name: 'Y' }, { id: '10' });
      const res = mockResponse();

      Genus.findByPk.mockRejectedValue(new Error('Update error'));

      await updateGenus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });

    it('должен вернуть 400, если update бросает исключение', async () => {
      const req = mockRequest({ name: 'Z' }, { id: '11' });
      const res = mockResponse();

      const fakeInstance = {
        id: 11,
        name: 'Genus',
        update: jest.fn().mockRejectedValue(new Error('Inner update error')),
      };
      Genus.findByPk.mockResolvedValue(fakeInstance);

      await updateGenus(req, res);

      expect(fakeInstance.update).toHaveBeenCalledWith({ name: 'Z' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inner update error' });
    });
  });

  describe('deleteGenus', () => {
    it('должен удалить род', async () => {
      const req = mockRequest({}, { id: '12' });
      const res = mockResponse();

      const fakeInstance = {
        id: 12,
        destroy: jest.fn().mockResolvedValue(),
      };
      Genus.findByPk.mockResolvedValue(fakeInstance);

      await deleteGenus(req, res);

      expect(Genus.findByPk).toHaveBeenCalledWith('12');
      expect(fakeInstance.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Genus deleted successfully' });
    });

    it('должен вернуть 404, если род не найден', async () => {
      const req = mockRequest({}, { id: '13' });
      const res = mockResponse();

      Genus.findByPk.mockResolvedValue(null);

      await deleteGenus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Genus not found' });
    });

    it('должен вернуть 500 при ошибке удаления', async () => {
      const req = mockRequest({}, { id: '14' });
      const res = mockResponse();

      Genus.findByPk.mockRejectedValue(new Error('Delete error'));

      await deleteGenus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
    });
  });
});
