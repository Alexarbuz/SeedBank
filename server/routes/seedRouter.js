const express = require('express');
const router = express.Router();
const {
  getAllSeeds,
  getSeedById,
  createSeed,
  updateSeed,
  deleteSeed
} = require('../controllers/SeedController');

router.get('/', getAllSeeds);
router.get('/:id', getSeedById);
router.post('/', createSeed);
router.put('/:id', updateSeed);
router.delete('/:id', deleteSeed);

module.exports = router;