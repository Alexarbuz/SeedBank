const { PlaceOfCollection, Seed } = require('../models/models');

exports.getAllPlaces = async (req, res) => {
  try {
    const places = await PlaceOfCollection.findAll({
      include: [{ model: Seed }],
      order: [['id', 'ASC']]
    });
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlaceById = async (req, res) => {
  try {
    const place = await PlaceOfCollection.findByPk(req.params.id, {
      include: [{ model: Seed }]
    });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    res.json(place);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPlace = async (req, res) => {
  try {
    const place = await PlaceOfCollection.create(req.body);
    res.status(201).json(place);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const place = await PlaceOfCollection.findByPk(req.params.id);
    if (!place) return res.status(404).json({ error: 'Place not found' });
    
    const updatedPlace = await place.update(req.body);
    res.json(updatedPlace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const place = await PlaceOfCollection.findByPk(req.params.id);
    if (!place) return res.status(404).json({ error: 'Place not found' });
    
    await place.destroy();
    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};