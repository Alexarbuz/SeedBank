const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')();
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');
const {
  getAllSeeds,
  getSeedById,
  createSeed,
  updateSeed,
  deleteSeed,
  uploadImageMiddleware  // из нового варианта
} = require('../controllers/SeedController');

// Доступ без авторизации
router.get('/', getAllSeeds);
router.get('/:id', getSeedById);

// Создание: теперь multer ждёт объект { image, xrayimage }
router.post(
  '/',
  authMiddleware,
  checkRoleMiddleware(['ADMIN']),
  uploadImageMiddleware,
  createSeed
);

// Обновление: аналогично
router.put(
  '/:id',
  authMiddleware,
  checkRoleMiddleware(['ADMIN']),
  uploadImageMiddleware,
  updateSeed
);

router.delete('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), deleteSeed);

module.exports = router;
