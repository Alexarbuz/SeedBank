const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')();
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');
const {
  getAllRoles,
  getRoleById,
  updateRole,
} = require('../controllers/RoleController');

router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.put('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), updateRole);

module.exports = router;