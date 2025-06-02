// tests/seedController.test.js

const {
  getAllSeeds,
  getSeedById,
  createSeed,
  updateSeed,
  deleteSeed,
} = require('../controllers/SeedController');
const {
  Seed,
  Specie,
  Genus,
  Family,
  RedBook,
  PlaceOfCollection,
  Account,
} = require('../models/models');

jest.mock('../models/models', () => ({
  Seed: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Specie: {},
  Genus: {},
  Family: {},
  RedBook: {},
  PlaceOfCollection: {},
  Account: {},
}));

// Вспомогательные функции для моков req и res
const mockRequest = (body = {}, params = {}, files = {}) => ({
  body,
  params,
  files,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Seed Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSeeds', () => {
    it('должен вернуть массив семян при успешном запросе', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const fakeSeeds = [
        { id: 1, name: 'Seed A' },
        { id: 2, name: 'Seed B' },
      ];
      Seed.findAll.mockResolvedValue(fakeSeeds);

      await getAllSeeds(req, res);

      expect(Seed.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: Specie,
            include: [
              {
                model: Genus,
                include: [Family],
              },
            ],
            order: [['id', 'ASC']],
          },
          { model: RedBook, as: 'RedBookRF' },
          { model: RedBook, as: 'RedBookSO' },
          { model: PlaceOfCollection },
          { model: Account },
        ],
      });
      expect(res.json).toHaveBeenCalledWith(fakeSeeds);
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Seed.findAll.mockRejectedValue(new Error('DB error'));

      await getAllSeeds(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getSeedById', () => {
    it('должен вернуть семя по id', async () => {
      const req = mockRequest({}, { id: '5' });
      const res = mockResponse();

      const fakeSeed = { id: 5, name: 'Seed A' };
      Seed.findByPk.mockResolvedValue(fakeSeed);

      await getSeedById(req, res);

      expect(Seed.findByPk).toHaveBeenCalledWith('5', {
        include: [
          {
            model: Specie,
            include: [
              {
                model: Genus,
                include: [Family],
              },
            ],
          },
          { model: RedBook, as: 'RedBookRF' },
          { model: RedBook, as: 'RedBookSO' },
          { model: PlaceOfCollection },
          { model: Account },
        ],
      });
      expect(res.json).toHaveBeenCalledWith(fakeSeed);
    });

    it('должен вернуть 404, если семя не найдено', async () => {
      const req = mockRequest({}, { id: '6' });
      const res = mockResponse();

      Seed.findByPk.mockResolvedValue(null);

      await getSeedById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Seed not found' });
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest({}, { id: '7' });
      const res = mockResponse();

      Seed.findByPk.mockRejectedValue(new Error('DB failure'));

      await getSeedById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failure' });
    });
  });

  describe('createSeed', () => {
    it('должен создать семя без файлов и вернуть его', async () => {
      const req = mockRequest(
        { name: 'New Seed', specieId: 1, placeId: 2, accountId: 3 },
        {},
        {} // files пустой
      );
      const res = mockResponse();

      const fakeCreated = {
        id: 10,
        name: 'New Seed',
        specieId: 1,
        placeId: 2,
        accountId: 3,
        image: null,
        xrayimage: null,
      };
      Seed.create.mockResolvedValue(fakeCreated);

      await createSeed(req, res);

      expect(Seed.create).toHaveBeenCalledWith({
        name: 'New Seed',
        specieId: 1,
        placeId: 2,
        accountId: 3,
        image: null,
        xrayimage: null,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeCreated);
    });

    it('должен создать семя с файлами и вернуть его', async () => {
      const mockFile1 = { filename: 'img1.png', originalname: 'img1.png' };
      const mockFile2 = { filename: 'xray1.png', originalname: 'xray1.png' };
      const req = mockRequest(
        { name: 'New Seed' },
        {},
        { image: [mockFile1], xrayimage: [mockFile2] }
      );
      const res = mockResponse();

      const fakeCreated = {
        id: 11,
        name: 'New Seed',
        image: 'http://localhost:5000/static/uploads/img1.png',
        xrayimage: 'http://localhost:5000/static/uploads/xray1.png',
      };
      Seed.create.mockResolvedValue(fakeCreated);

      await createSeed(req, res);

      expect(Seed.create).toHaveBeenCalledWith({
        name: 'New Seed',
        image: 'http://localhost:5000/static/uploads/img1.png',
        xrayimage: 'http://localhost:5000/static/uploads/xray1.png',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeCreated);
    });

    it('должен вернуть 400 при ошибке валидации', async () => {
      const req = mockRequest({ name: '' }, {}, {});
      const res = mockResponse();

      Seed.create.mockRejectedValue(new Error('Validation error'));

      await createSeed(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation error' });
    });
  });

  describe('updateSeed', () => {
    it('должен обновить семя без новых файлов', async () => {
      const req = mockRequest({ name: 'Updated' }, { id: '8' }, {});
      const res = mockResponse();

      const existingSeed = {
        id: 8,
        name: 'Old',
        image: 'http://localhost:5000/static/uploads/old.png',
        xrayimage: 'http://localhost:5000/static/uploads/oldxray.png',
        update: jest.fn().mockResolvedValue({
          id: 8,
          name: 'Updated',
          image: 'http://localhost:5000/static/uploads/old.png',
          xrayimage: 'http://localhost:5000/static/uploads/oldxray.png',
        }),
      };
      Seed.findByPk.mockResolvedValue(existingSeed);

      await updateSeed(req, res);

      expect(Seed.findByPk).toHaveBeenCalledWith('8');
      expect(existingSeed.update).toHaveBeenCalledWith({
        name: 'Updated',
        image: 'http://localhost:5000/static/uploads/old.png',
        xrayimage: 'http://localhost:5000/static/uploads/oldxray.png',
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 8,
        name: 'Updated',
        image: 'http://localhost:5000/static/uploads/old.png',
        xrayimage: 'http://localhost:5000/static/uploads/oldxray.png',
      });
    });

    it('должен обновить семя с новыми файлами', async () => {
      const mockFile1 = { filename: 'newimg.png', originalname: 'newimg.png' };
      const mockFile2 = { filename: 'newxray.png', originalname: 'newxray.png' };
      const req = mockRequest({ name: 'WithFiles' }, { id: '9' }, {
        image: [mockFile1],
        xrayimage: [mockFile2],
      });
      const res = mockResponse();

      const existingSeed = {
        id: 9,
        name: 'Old',
        image: 'http://localhost:5000/static/uploads/old.png',
        xrayimage: 'http://localhost:5000/static/uploads/oldxray.png',
        update: jest.fn().mockResolvedValue({
          id: 9,
          name: 'WithFiles',
          image: 'http://localhost:5000/static/uploads/newimg.png',
          xrayimage: 'http://localhost:5000/static/uploads/newxray.png',
        }),
      };
      Seed.findByPk.mockResolvedValue(existingSeed);

      await updateSeed(req, res);

      expect(Seed.findByPk).toHaveBeenCalledWith('9');
      expect(existingSeed.update).toHaveBeenCalledWith({
        name: 'WithFiles',
        image: 'http://localhost:5000/static/uploads/newimg.png',
        xrayimage: 'http://localhost:5000/static/uploads/newxray.png',
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 9,
        name: 'WithFiles',
        image: 'http://localhost:5000/static/uploads/newimg.png',
        xrayimage: 'http://localhost:5000/static/uploads/newxray.png',
      });
    });

    it('должен вернуть 404, если семя не найдено', async () => {
      const req = mockRequest({ name: 'X' }, { id: '12' }, {});
      const res = mockResponse();

      Seed.findByPk.mockResolvedValue(null);

      await updateSeed(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Seed not found' });
    });

    it('должен вернуть 400 при ошибке обновления', async () => {
      const req = mockRequest({ name: 'Y' }, { id: '13' }, {});
      const res = mockResponse();

      Seed.findByPk.mockRejectedValue(new Error('Update error'));

      await updateSeed(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });

    it('должен вернуть 400, если внутренняя ошибка update', async () => {
      const req = mockRequest({ name: 'Z' }, { id: '14' }, {});
      const res = mockResponse();

      const existingSeed = {
        id: 14,
        name: 'Old',
        image: 'http://localhost:5000/static/uploads/old.png',
        xrayimage: 'http://localhost:5000/static/uploads/oldxray.png',
        update: jest.fn().mockRejectedValue(new Error('Inner update error')),
      };
      Seed.findByPk.mockResolvedValue(existingSeed);

      await updateSeed(req, res);

      expect(existingSeed.update).toHaveBeenCalledWith({
        name: 'Z',
        image: 'http://localhost:5000/static/uploads/old.png',
        xrayimage: 'http://localhost:5000/static/uploads/oldxray.png',
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inner update error' });
    });
  });

  describe('deleteSeed', () => {
    it('должен удалить семя', async () => {
      const req = mockRequest({}, { id: '15' });
      const res = mockResponse();

      const existingSeed = {
        id: 15,
        destroy: jest.fn().mockResolvedValue(),
      };
      Seed.findByPk.mockResolvedValue(existingSeed);

      await deleteSeed(req, res);

      expect(Seed.findByPk).toHaveBeenCalledWith('15');
      expect(existingSeed.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Seed deleted successfully' });
    });

    it('должен вернуть 404, если семя не найдено', async () => {
      const req = mockRequest({}, { id: '16' });
      const res = mockResponse();

      Seed.findByPk.mockResolvedValue(null);

      await deleteSeed(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Seed not found' });
    });

    it('должен вернуть 500 при ошибке удаления', async () => {
      const req = mockRequest({}, { id: '17' });
      const res = mockResponse();

      Seed.findByPk.mockRejectedValue(new Error('Delete error'));

      await deleteSeed(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
    });
  });
});
