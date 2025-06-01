const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')();
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');
const {
  getAllGenera,
  getGenusById,
  createGenus,
  updateGenus,
  deleteGenus
} = require('../controllers/GenusController');

router.get('/', getAllGenera);
router.get('/:id', getGenusById);
router.post('/', authMiddleware, checkRoleMiddleware(['ADMIN']),  createGenus);
router.put('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), updateGenus);
router.delete('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), deleteGenus);

module.exports = router;