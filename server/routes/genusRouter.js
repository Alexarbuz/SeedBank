const express = require('express');
const router = express.Router();
const {
  getAllGenera,
  getGenusById,
  createGenus,
  updateGenus,
  deleteGenus
} = require('../controllers/GenusController');

router.get('/', getAllGenera);
router.get('/:id', getGenusById);
router.post('/', createGenus);
router.put('/:id', updateGenus);
router.delete('/:id', deleteGenus);

module.exports = router;