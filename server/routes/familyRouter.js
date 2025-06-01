const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')();
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');
const {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily
} = require('../controllers/FamilyController');

router.get('/', getAllFamilies);
router.get('/:id', getFamilyById);
router.post('/', authMiddleware, checkRoleMiddleware(['ADMIN']), createFamily, );
router.put('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), updateFamily);
router.delete('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), deleteFamily);

module.exports = router;