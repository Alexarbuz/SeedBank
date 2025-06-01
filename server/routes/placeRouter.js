const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')();
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');
const {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
} = require('../controllers/PlaceController');

router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);
router.post('/', authMiddleware, checkRoleMiddleware(['ADMIN']), createPlace);
router.put('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), updatePlace);
router.delete('/:id', authMiddleware, checkRoleMiddleware(['ADMIN']), deletePlace);

module.exports = router;