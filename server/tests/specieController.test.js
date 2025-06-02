// tests/specieController.test.js

const {
  getAllSpecies,
  getSpecieById,
  createSpecie,
  updateSpecie,
  deleteSpecie,
} = require('../controllers/SpecieController');
const { Specie, Genus, Family, Seed } = require('../models/models');

jest.mock('../models/models', () => ({
  Specie: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Genus: {},
  Family: {},
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

describe('Specie Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSpecies', () => {
    it('должен вернуть список видов', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const fakeSpecies = [
        { id: 1, name: 'Specie A', Genus: { id: 10, Family: {} }, Seeds: [] },
        { id: 2, name: 'Specie B', Genus: { id: 11, Family: {} }, Seeds: [] },
      ];
      Specie.findAll.mockResolvedValue(fakeSpecies);

      await getAllSpecies(req, res);

      expect(Specie.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: Genus,
            include: [Family],
          },
          { model: Seed },
        ],
        order: [['id', 'ASC']],
      });
      expect(res.json).toHaveBeenCalledWith(fakeSpecies);
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Specie.findAll.mockRejectedValue(new Error('DB error'));

      await getAllSpecies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getSpecieById', () => {
    it('должен вернуть вид по id', async () => {
      const req = mockRequest({}, { id: '5' });
      const res = mockResponse();

      const fakeSpecie = {
        id: 5,
        name: 'Specie A',
        Genus: { id: 10, Family: {} },
      };
      Specie.findByPk.mockResolvedValue(fakeSpecie);

      await getSpecieById(req, res);

      expect(Specie.findByPk).toHaveBeenCalledWith('5', {
        include: [
          {
            model: Genus,
            include: [Family],
          },
        ],
      });
      expect(res.json).toHaveBeenCalledWith(fakeSpecie);
    });

    it('должен вернуть 404, если вид не найден', async () => {
      const req = mockRequest({}, { id: '6' });
      const res = mockResponse();

      Specie.findByPk.mockResolvedValue(null);

      await getSpecieById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Specie not found' });
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest({}, { id: '7' });
      const res = mockResponse();

      Specie.findByPk.mockRejectedValue(new Error('DB failure'));

      await getSpecieById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failure' });
    });
  });

  describe('createSpecie', () => {
    it('должен создать новый вид', async () => {
      const req = mockRequest({ name: 'New Specie', genusId: 2 });
      const res = mockResponse();

      const fakeCreated = { id: 10, name: 'New Specie', genusId: 2 };
      Specie.create.mockResolvedValue(fakeCreated);

      await createSpecie(req, res);

      expect(Specie.create).toHaveBeenCalledWith({ name: 'New Specie', genusId: 2 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeCreated);
    });

    it('должен вернуть 400 при ошибке валидации', async () => {
      const req = mockRequest({ name: '' });
      const res = mockResponse();

      Specie.create.mockRejectedValue(new Error('Validation error'));

      await createSpecie(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation error' });
    });
  });

  describe('updateSpecie', () => {
    it('должен обновить существующий вид', async () => {
      const req = mockRequest({ name: 'Updated Specie' }, { id: '8' });
      const res = mockResponse();

      const fakeInstance = {
        id: 8,
        name: 'Old Specie',
        update: jest.fn().mockResolvedValue({ id: 8, name: 'Updated Specie' }),
      };
      Specie.findByPk.mockResolvedValue(fakeInstance);

      await updateSpecie(req, res);

      expect(Specie.findByPk).toHaveBeenCalledWith('8');
      expect(fakeInstance.update).toHaveBeenCalledWith({ name: 'Updated Specie' });
      expect(res.json).toHaveBeenCalledWith({ id: 8, name: 'Updated Specie' });
    });

    it('должен вернуть 404, если вид не найден', async () => {
      const req = mockRequest({ name: 'X' }, { id: '9' });
      const res = mockResponse();

      Specie.findByPk.mockResolvedValue(null);

      await updateSpecie(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Specie not found' });
    });

    it('должен вернуть 400 при ошибке обновления', async () => {
      const req = mockRequest({ name: 'Y' }, { id: '10' });
      const res = mockResponse();

      Specie.findByPk.mockRejectedValue(new Error('Update error'));

      await updateSpecie(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });

    it('должен вернуть 400, если внутреннее обновление выбрасывает ошибку', async () => {
      const req = mockRequest({ name: 'Z' }, { id: '11' });
      const res = mockResponse();

      const fakeInstance = {
        id: 11,
        name: 'Specie',
        update: jest.fn().mockRejectedValue(new Error('Inner update error')),
      };
      Specie.findByPk.mockResolvedValue(fakeInstance);

      await updateSpecie(req, res);

      expect(fakeInstance.update).toHaveBeenCalledWith({ name: 'Z' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inner update error' });
    });
  });

  describe('deleteSpecie', () => {
    it('должен удалить вид', async () => {
      const req = mockRequest({}, { id: '12' });
      const res = mockResponse();

      const fakeInstance = {
        id: 12,
        destroy: jest.fn().mockResolvedValue(),
      };
      Specie.findByPk.mockResolvedValue(fakeInstance);

      await deleteSpecie(req, res);

      expect(Specie.findByPk).toHaveBeenCalledWith('12');
      expect(fakeInstance.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Specie deleted successfully' });
    });

    it('должен вернуть 404, если вид не найден', async () => {
      const req = mockRequest({}, { id: '13' });
      const res = mockResponse();

      Specie.findByPk.mockResolvedValue(null);

      await deleteSpecie(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Specie not found' });
    });

    it('должен вернуть 500 при ошибке удаления', async () => {
      const req = mockRequest({}, { id: '14' });
      const res = mockResponse();

      Specie.findByPk.mockRejectedValue(new Error('Delete error'));

      await deleteSpecie(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
    });
  });
});
