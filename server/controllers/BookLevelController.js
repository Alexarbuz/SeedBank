const { BookLevel, RedBook } = require('../models/models');

exports.getAllBookLevels = async (req, res) => {
  try {
    const bookLevels = await BookLevel.findAll({
      include: [{ model: RedBook }],
      order: [['id', 'ASC']]
    });
    res.json(bookLevels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookLevelById = async (req, res) => {
  try {
    const bookLevel = await BookLevel.findByPk(req.params.id, {
      include: [{ model: RedBook }]
    });
    if (!bookLevel) return res.status(404).json({ error: 'Book level not found' });
    res.json(bookLevel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBookLevel = async (req, res) => {
  try {
    const bookLevel = await BookLevel.create(req.body);
    res.status(201).json(bookLevel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateBookLevel = async (req, res) => {
  try {
    const bookLevel = await BookLevel.findByPk(req.params.id);
    if (!bookLevel) return res.status(404).json({ error: 'Book level not found' });
    
    const updatedBookLevel = await bookLevel.update(req.body);
    res.json(updatedBookLevel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBookLevel = async (req, res) => {
  try {
    const bookLevel = await BookLevel.findByPk(req.params.id);
    if (!bookLevel) return res.status(404).json({ error: 'Book level not found' });
    
    await bookLevel.destroy();
    res.json({ message: 'Book level deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};