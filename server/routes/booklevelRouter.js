const express = require('express');
const router = express.Router();
const {
  getAllBookLevels,
  getBookLevelById,
  createBookLevel,
  updateBookLevel,
  deleteBookLevel
} = require('../controllers/BookLevelController');

router.get('/', getAllBookLevels);
router.get('/:id', getBookLevelById);
router.post('/', createBookLevel);
router.put('/:id', updateBookLevel);
router.delete('/:id', deleteBookLevel);

module.exports = router;