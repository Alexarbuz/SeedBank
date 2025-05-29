const express = require('express');
const router = express.Router();
const {
  getAllRedBooks,
  getRedBookById,
  createRedBook,
  updateRedBook,
  deleteRedBook
} = require('../controllers/RedBookController');

router.get('/', getAllRedBooks);
router.get('/:id', getRedBookById);
router.post('/', createRedBook);
router.put('/:id', updateRedBook);
router.delete('/:id', deleteRedBook);

module.exports = router;