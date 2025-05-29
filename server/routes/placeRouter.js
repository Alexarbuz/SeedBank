const express = require('express');
const router = express.Router();
const {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
} = require('../controllers/PlaceController');

router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);
router.post('/', createPlace);
router.put('/:id', updatePlace);
router.delete('/:id', deletePlace);

module.exports = router;