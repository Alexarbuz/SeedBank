const express = require('express');
const router = express.Router();
const {
  getAllRoles,
  getRoleById,
  updateRole,
} = require('../controllers/RoleController');

router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);

module.exports = router;