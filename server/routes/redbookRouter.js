const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')();
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');
const {
  getAllRedBooks,
  getRedBookById,
  createRedBook,
  updateRedBook,
  deleteRedBook
} = require('../controllers/RedBookController');

router.get('/', getAllRedBooks);
router.get('/:id', getRedBookById);
router.post('/', authMiddleware, checkRoleMiddleware(['ADMIN']), createRedBook);
router.put('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), updateRedBook);
router.delete('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), deleteRedBook);

module.exports = router;