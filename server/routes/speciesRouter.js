const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')();
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');
const {
  getAllSpecies,
  getSpecieById,
  createSpecie,
  updateSpecie,
  deleteSpecie
} = require('../controllers/SpecieController');

router.get('/', getAllSpecies);
router.get('/:id', getSpecieById);
router.post('/', authMiddleware, checkRoleMiddleware(['ADMIN']), createSpecie);
router.put('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), updateSpecie);
router.delete('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), deleteSpecie);

module.exports = router;