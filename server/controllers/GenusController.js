const { Genus, Family, Specie } = require('../models/models');

exports.getAllGenera = async (req, res) => {
  try {
    const genera = await Genus.findAll({
      include: [
        { model: Family },
        { model: Specie }
      ],
      order: [['id', 'ASC']]
    });
    res.json(genera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGenusById = async (req, res) => {
  try {
    const genus = await Genus.findByPk(req.params.id, {
      include: [
        { model: Family },
        { model: Specie }
      ]
    });
    if (!genus) return res.status(404).json({ error: 'Genus not found' });
    res.json(genus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGenus = async (req, res) => {
  try {
    const genus = await Genus.create(req.body);
    res.status(201).json(genus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateGenus = async (req, res) => {
  try {
    const genus = await Genus.findByPk(req.params.id);
    if (!genus) return res.status(404).json({ error: 'Genus not found' });
    
    const updatedGenus = await genus.update(req.body);
    res.json(updatedGenus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteGenus = async (req, res) => {
  try {
    const genus = await Genus.findByPk(req.params.id);
    if (!genus) return res.status(404).json({ error: 'Genus not found' });
    
    await genus.destroy();
    res.json({ message: 'Genus deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};