const {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
} = require('../controllers/FamilyController');
const { Family, Genus } = require('../models/models');

jest.mock('../models/models', () => ({
  Family: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Genus: {},
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

describe('Family Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFamilies', () => {
    it('должен вернуть список семей', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const fakeFamilies = [
        { id: 1, name: 'Fabaceae', Genera: [] },
        { id: 2, name: 'Rosaceae', Genera: [] },
      ];
      Family.findAll.mockResolvedValue(fakeFamilies);

      await getAllFamilies(req, res);

      expect(Family.findAll).toHaveBeenCalledWith({
        include: [{ model: Genus }],
        order: [['id', 'ASC']],
      });
      expect(res.json).toHaveBeenCalledWith(fakeFamilies);
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Family.findAll.mockRejectedValue(new Error('DB error'));

      await getAllFamilies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getFamilyById', () => {
    it('должен вернуть семейство по id', async () => {
      const req = mockRequest({}, { id: 10 });
      const res = mockResponse();

      const fakeFamily = { id: 10, name: 'Fabaceae', Genera: [] };
      Family.findByPk.mockResolvedValue(fakeFamily);

      await getFamilyById(req, res);

      expect(Family.findByPk).toHaveBeenCalledWith(10, {
        include: [{ model: Genus }],
      });
      expect(res.json).toHaveBeenCalledWith(fakeFamily);
    });

    it('должен вернуть 404, если семейство не найдено', async () => {
      const req = mockRequest({}, { id: '20' });
      const res = mockResponse();

      Family.findByPk.mockResolvedValue(null);

      await getFamilyById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Family not found' });
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest({}, { id: '30' });
      const res = mockResponse();

      Family.findByPk.mockRejectedValue(new Error('DB failure'));

      await getFamilyById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failure' });
    });
  });

  describe('createFamily', () => {
    it('должен создать новое семейство', async () => {
      const req = mockRequest({ name: 'Asteraceae' });
      const res = mockResponse();

      const fakeCreated = { id: 3, name: 'Asteraceae' };
      Family.create.mockResolvedValue(fakeCreated);

      await createFamily(req, res);

      expect(Family.create).toHaveBeenCalledWith({ name: 'Asteraceae' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeCreated);
    });

    it('должен вернуть 400 при ошибке валидации', async () => {
      const req = mockRequest({ name: '' });
      const res = mockResponse();

      Family.create.mockRejectedValue(new Error('Validation error'));

      await createFamily(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation error' });
    });
  });

  describe('updateFamily', () => {
    it('должен обновить семейство', async () => {
      const req = mockRequest({ name: 'UpdatedName' }, { id: 5 });
      const res = mockResponse();

      const fakeInstance = {
        id: 5,
        name: 'OldName',
        update: jest.fn().mockResolvedValue({ id: 5, name: 'UpdatedName' }),
      };
      Family.findByPk.mockResolvedValue(fakeInstance);

      await updateFamily(req, res);

      expect(Family.findByPk).toHaveBeenCalledWith(5);
      expect(fakeInstance.update).toHaveBeenCalledWith({ name: 'UpdatedName' });
      expect(res.json).toHaveBeenCalledWith({ id: 5, name: 'UpdatedName' });
    });

    it('должен вернуть 404, если семейство не найдено', async () => {
      const req = mockRequest({ name: 'X' }, { id: '6' });
      const res = mockResponse();

      Family.findByPk.mockResolvedValue(null);

      await updateFamily(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Family not found' });
    });

    it('должен вернуть 400 при ошибке обновления', async () => {
      const req = mockRequest({ name: 'Y' }, { id: '7' });
      const res = mockResponse();

      Family.findByPk.mockRejectedValue(new Error('Update error'));

      await updateFamily(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });

    it('должен вернуть 400, если update бросает исключение', async () => {
      const req = mockRequest({ name: 'Z' }, { id: '8' });
      const res = mockResponse();

      const fakeInstance = {
        id: 8,
        name: 'Name',
        update: jest.fn().mockRejectedValue(new Error('Inner update error')),
      };
      Family.findByPk.mockResolvedValue(fakeInstance);

      await updateFamily(req, res);

      expect(fakeInstance.update).toHaveBeenCalledWith({ name: 'Z' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inner update error' });
    });
  });

  describe('deleteFamily', () => {
    it('должен удалить семейство', async () => {
      const req = mockRequest({}, { id: 9 });
      const res = mockResponse();

      const fakeInstance = {
        id: 9,
        destroy: jest.fn().mockResolvedValue(),
      };
      Family.findByPk.mockResolvedValue(fakeInstance);

      await deleteFamily(req, res);

      expect(Family.findByPk).toHaveBeenCalledWith(9);
      expect(fakeInstance.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Family deleted successfully' });
    });

    it('должен вернуть 404, если семейство не найдено', async () => {
      const req = mockRequest({}, { id: 10 });
      const res = mockResponse();

      Family.findByPk.mockResolvedValue(null);

      await deleteFamily(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Family not found' });
    });

    it('должен вернуть 500 при ошибке удаления', async () => {
      const req = mockRequest({}, { id: '11' });
      const res = mockResponse();

      Family.findByPk.mockRejectedValue(new Error('Delete error'));

      await deleteFamily(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
    });
  });
});