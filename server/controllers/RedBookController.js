const { RedBook, BookLevel, Seed } = require('../models/models');

exports.getAllRedBooks = async (req, res) => {
  try {
    const redBooks = await RedBook.findAll({
      include: [
        { model: BookLevel },
        { model: Seed, as: 'RedBookRF' },
        { model: Seed, as: 'RedBookSO' }
      ]
    });
    res.json(redBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRedBookById = async (req, res) => {
  try {
    const redBook = await RedBook.findByPk(req.params.id, {
      include: [
        { model: BookLevel },
        { model: Seed, as: 'RedBookRF' },
        { model: Seed, as: 'RedBookSO' }
      ]
    });
    if (!redBook) return res.status(404).json({ error: 'Red book not found' });
    res.json(redBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRedBook = async (req, res) => {
  try {
    const redBook = await RedBook.create(req.body);
    res.status(201).json(redBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRedBook = async (req, res) => {
  try {
    const redBook = await RedBook.findByPk(req.params.id);
    if (!redBook) return res.status(404).json({ error: 'Red book not found' });
    
    const updatedRedBook = await redBook.update(req.body);
    res.json(updatedRedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteRedBook = async (req, res) => {
  try {
    const redBook = await RedBook.findByPk(req.params.id);
    if (!redBook) return res.status(404).json({ error: 'Red book not found' });
    
    await redBook.destroy();
    res.json({ message: 'Red book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};