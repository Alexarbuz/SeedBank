const { Specie, Genus, Family, Seed } = require('../models/models');

exports.getAllSpecies = async (req, res) => {
  try {
    const species = await Specie.findAll({
      include: [
        { 
          model: Genus,
          include: [Family]
        },
        { model: Seed }
      ]
    });
    res.json(species);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSpecieById = async (req, res) => {
  try {
    const specie = await Specie.findByPk(req.params.id, {
      include: [
        { 
          model: Genus,
          include: [Family]
        }
      ]
    });
    if (!specie) return res.status(404).json({ error: 'Specie not found' });
    res.json(specie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSpecie = async (req, res) => {
  try {
    const specie = await Specie.create(req.body);
    res.status(201).json(specie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSpecie = async (req, res) => {
  try {
    const specie = await Specie.findByPk(req.params.id);
    if (!specie) return res.status(404).json({ error: 'Specie not found' });
    
    const updatedSpecie = await specie.update(req.body);
    res.json(updatedSpecie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSpecie = async (req, res) => {
  try {
    const specie = await Specie.findByPk(req.params.id);
    if (!specie) return res.status(404).json({ error: 'Specie not found' });
    
    await specie.destroy();
    res.json({ message: 'Specie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};