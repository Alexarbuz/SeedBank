const { Seed, Specie, Genus, Family, RedBook, PlaceOfCollection, Account } = require('../models/models');

exports.getAllSeeds = async (req, res) => {
  try {
    const seeds = await Seed.findAll({
      include: [
        { 
          model: Specie,
          include: [
            { 
              model: Genus,
              include: [Family]
            }
          ]
        },
        { model: RedBook, as: 'RedBookRF' },
        { model: RedBook, as: 'RedBookSO' },
        { model: PlaceOfCollection },
        { model: Account }
      ]
    });
    res.json(seeds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSeedById = async (req, res) => {
  try {
    const seed = await Seed.findByPk(req.params.id, {
      include: [
        { 
          model: Specie,
          include: [
            { 
              model: Genus,
              include: [Family]
            }
          ]
        }
      ]
    });
    if (!seed) return res.status(404).json({ error: 'Seed not found' });
    res.json(seed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSeed = async (req, res) => {
  try {
    const seedData = req.body;
    const seed = await Seed.create(seedData);
    res.status(201).json(seed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSeed = async (req, res) => {
  try {
    const seed = await Seed.findByPk(req.params.id);
    if (!seed) return res.status(404).json({ error: 'Seed not found' });
    
    const updatedSeed = await seed.update(req.body);
    res.json(updatedSeed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSeed = async (req, res) => {
  try {
    const seed = await Seed.findByPk(req.params.id);
    if (!seed) return res.status(404).json({ error: 'Seed not found' });
    
    await seed.destroy();
    res.json({ message: 'Seed deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};