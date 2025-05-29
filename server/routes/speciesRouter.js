const express = require('express');
const router = express.Router();
const {
  getAllSpecies,
  getSpecieById,
  createSpecie,
  updateSpecie,
  deleteSpecie
} = require('../controllers/SpecieController');

router.get('/', getAllSpecies);
router.get('/:id', getSpecieById);
router.post('/', createSpecie);
router.put('/:id', updateSpecie);
router.delete('/:id', deleteSpecie);

module.exports = router;