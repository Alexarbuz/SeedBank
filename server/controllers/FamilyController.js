const { Family, Genus } = require('../models/models');

exports.getAllFamilies = async (req, res) => {
  try {
    const families = await Family.findAll({
      include: [{ model: Genus }]
    });
    res.json(families);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFamilyById = async (req, res) => {
  try {
    const family = await Family.findByPk(req.params.id, {
      include: [{ model: Genus }]
    });
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json(family);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFamily = async (req, res) => {
  try {
    const family = await Family.create(req.body);
    res.status(201).json(family);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateFamily = async (req, res) => {
  try {
    const family = await Family.findByPk(req.params.id);
    if (!family) return res.status(404).json({ error: 'Family not found' });
    
    const updatedFamily = await family.update(req.body);
    res.json(updatedFamily);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFamily = async (req, res) => {
  try {
    const family = await Family.findByPk(req.params.id);
    if (!family) return res.status(404).json({ error: 'Family not found' });
    
    await family.destroy();
    res.json({ message: 'Family deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};