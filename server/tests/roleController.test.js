// tests/roleController.test.js

const {
  getAllRoles,
  getRoleById,
  updateRole,
} = require('../controllers/RoleController');
const { Role, Account } = require('../models/models');

jest.mock('../models/models', () => ({
  Role: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Account: {},
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

describe('Role Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRoles', () => {
    it('должен вернуть список ролей', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const fakeRoles = [
        { id: 1, name_of_role: 'ADMIN', Accounts: [] },
        { id: 2, name_of_role: 'USER', Accounts: [] },
      ];
      Role.findAll.mockResolvedValue(fakeRoles);

      await getAllRoles(req, res);

      expect(Role.findAll).toHaveBeenCalledWith({
        include: [{ model: Account }],
      });
      expect(res.json).toHaveBeenCalledWith(fakeRoles);
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Role.findAll.mockRejectedValue(new Error('DB error'));

      await getAllRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getRoleById', () => {
    it('должен вернуть роль по id', async () => {
      const req = mockRequest({}, { id: '5' });
      const res = mockResponse();

      const fakeRole = { id: 5, name_of_role: 'MODERATOR', Accounts: [] };
      Role.findByPk.mockResolvedValue(fakeRole);

      await getRoleById(req, res);

      expect(Role.findByPk).toHaveBeenCalledWith('5', {
        include: [{ model: Account }],
      });
      expect(res.json).toHaveBeenCalledWith(fakeRole);
    });

    it('должен вернуть 404, если роль не найдена', async () => {
      const req = mockRequest({}, { id: '6' });
      const res = mockResponse();

      Role.findByPk.mockResolvedValue(null);

      await getRoleById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Role not found' });
    });

    it('должен вернуть 500 при ошибке БД', async () => {
      const req = mockRequest({}, { id: '7' });
      const res = mockResponse();

      Role.findByPk.mockRejectedValue(new Error('DB failure'));

      await getRoleById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failure' });
    });
  });

  describe('updateRole', () => {
    it('должен обновить существующую роль', async () => {
      const req = mockRequest({ name_of_role: 'UPDATED' }, { id: '8' });
      const res = mockResponse();

      const fakeInstance = {
        id: 8,
        name_of_role: 'OLD',
        update: jest.fn().mockResolvedValue({ id: 8, name_of_role: 'UPDATED' }),
      };
      Role.findByPk.mockResolvedValue(fakeInstance);

      await updateRole(req, res);

      expect(Role.findByPk).toHaveBeenCalledWith('8');
      expect(fakeInstance.update).toHaveBeenCalledWith({ name_of_role: 'UPDATED' });
      expect(res.json).toHaveBeenCalledWith({ id: 8, name_of_role: 'UPDATED' });
    });

    it('должен вернуть 404, если роль не найдена', async () => {
      const req = mockRequest({ name_of_role: 'X' }, { id: '9' });
      const res = mockResponse();

      Role.findByPk.mockResolvedValue(null);

      await updateRole(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Role not found' });
    });

    it('должен вернуть 400 при ошибке обновления', async () => {
      const req = mockRequest({ name_of_role: 'Y' }, { id: '10' });
      const res = mockResponse();

      Role.findByPk.mockRejectedValue(new Error('Update error'));

      await updateRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
    });

    it('должен вернуть 400, если update бросает исключение', async () => {
      const req = mockRequest({ name_of_role: 'Z' }, { id: '11' });
      const res = mockResponse();

      const fakeInstance = {
        id: 11,
        name_of_role: 'ORIGINAL',
        update: jest.fn().mockRejectedValue(new Error('Inner update error')),
      };
      Role.findByPk.mockResolvedValue(fakeInstance);

      await updateRole(req, res);

      expect(fakeInstance.update).toHaveBeenCalledWith({ name_of_role: 'Z' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inner update error' });
    });
  });
});
