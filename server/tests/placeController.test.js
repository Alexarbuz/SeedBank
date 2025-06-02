// tests/placeController.test.js

const {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/PlaceController');
const { PlaceOfCollection, Seed } = require('../models/models');

jest.mock('../models/models', () => ({
  PlaceOfCollection: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
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

describe('PlaceOfCollection Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPlaces', () => {
    it('должен вернуть список мест сбора', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const fakePlaces = [
        { id: 1, name: 'Forest', Seeds: [] },
        { id: 2, name: 'Meadow', Seeds: [] },
      ];
      PlaceOfCollection.findAll.mockResolvedValue(fakePlaces);

      await getAllPlaces(req, res);

      expect(PlaceOfCollection.findAll).toHaveBeenCalledWith({
        include: [{ model: Seed }],
        order: [['id', 'ASC']],
      });
      expect(res.json).toHaveBeenCalledWith(fakePlaces);
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest();
      const res = mockResponse();

      PlaceOfCollection.findAll.mockRejectedValue(new Error('DB error'));

      await getAllPlaces(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getPlaceById', () => {
    it('должен вернуть место по id', async () => {
      const req = mockRequest({}, { id: '5' });
      const res = mockResponse();

      const fakePlace = { id: 5, name: 'Forest', Seeds: [] };
      PlaceOfCollection.findByPk.mockResolvedValue(fakePlace);

      await getPlaceById(req, res);

      expect(PlaceOfCollection.findByPk).toHaveBeenCalledWith('5', {
        include: [{ model: Seed }],
      });
      expect(res.json).toHaveBeenCalledWith(fakePlace);
    });

    it('должен вернуть 404, если место не найдено', async () => {
      const req = mockRequest({}, { id: '6' });
      const res = mockResponse();

      PlaceOfCollection.findByPk.mockResolvedValue(null);

      await getPlaceById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Place not found' });
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest({}, { id: '7' });
      const res = mockResponse();

      PlaceOfCollection.findByPk.mockRejectedValue(new Error('DB failure'));

      await getPlaceById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failure' });
    });
  });

  describe('createPlace', () => {
    it('должен создать новое место', async () => {
      const req = mockRequest({ name: 'Lake' });
      const res = mockResponse();

      const fakeCreated = { id: 10, name: 'Lake' };
      PlaceOfCollection.create.mockResolvedValue(fakeCreated);

      await createPlace(req, res);

      expect(PlaceOfCollection.create).toHaveBeenCalledWith({ name: 'Lake' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeCreated);
    });

    it('должен вернуть 400 при ошибке валидации', async () => {
      const req = mockRequest({ name: '' });
      const res = mockResponse();

      PlaceOfCollection.create.mockRejectedValue(new Error('Validation error'));

      await createPlace(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation error' });
    });
  });

  describe('updatePlace', () => {
    it('должен обновить место', async () => {
      const req = mockRequest({ name: 'UpdatedForest' }, { id: '8' });
      const res = mockResponse();

      const fakeInstance = {
        id: 8,
        name: 'Forest',
        update: jest.fn().mockResolvedValue({ id: 8, name: 'UpdatedForest' }),
      };
      PlaceOfCollection.findByPk.mockResolvedValue(fakeInstance);

      await updatePlace(req, res);

      expect(PlaceOfCollection.findByPk).toHaveBeenCalledWith('8');
      expect(fakeInstance.update).toHaveBeenCalledWith({ name: 'UpdatedForest' });
      expect(res.json).toHaveBeenCalledWith({ id: 8, name: 'UpdatedForest' });
    });

    it('должен вернуть 404, если место не найдено', async () => {
      const req = mockRequest({ name: 'X' }, { id: '9' });
      const res = mockResponse();

      PlaceOfCollection.findByPk.mockResolvedValue(null);

      await updatePlace(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Place not found' });
    });

    it('должен вернуть 400 при ошибке обновления', async () => {
      const req = mockRequest({ name: 'Y' }, { id: '10' });
      const res = mockResponse();

      PlaceOfCollection.findByPk.mockRejectedValue(new Error('Update error'));

      await updatePlace(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });

    it('должен вернуть 400, если update бросает исключение', async () => {
      const req = mockRequest({ name: 'Z' }, { id: '11' });
      const res = mockResponse();

      const fakeInstance = {
        id: 11,
        name: 'Place',
        update: jest.fn().mockRejectedValue(new Error('Inner update error')),
      };
      PlaceOfCollection.findByPk.mockResolvedValue(fakeInstance);

      await updatePlace(req, res);

      expect(fakeInstance.update).toHaveBeenCalledWith({ name: 'Z' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inner update error' });
    });
  });

  describe('deletePlace', () => {
    it('должен удалить место', async () => {
      const req = mockRequest({}, { id: '12' });
      const res = mockResponse();

      const fakeInstance = {
        id: 12,
        destroy: jest.fn().mockResolvedValue(),
      };
      PlaceOfCollection.findByPk.mockResolvedValue(fakeInstance);

      await deletePlace(req, res);

      expect(PlaceOfCollection.findByPk).toHaveBeenCalledWith('12');
      expect(fakeInstance.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Place deleted successfully' });
    });

    it('должен вернуть 404, если место не найдено', async () => {
      const req = mockRequest({}, { id: '13' });
      const res = mockResponse();

      PlaceOfCollection.findByPk.mockResolvedValue(null);

      await deletePlace(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Place not found' });
    });

    it('должен вернуть 500 при ошибке удаления', async () => {
      const req = mockRequest({}, { id: '14' });
      const res = mockResponse();

      PlaceOfCollection.findByPk.mockRejectedValue(new Error('Delete error'));

      await deletePlace(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
    });
  });
});
