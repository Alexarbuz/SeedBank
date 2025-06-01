const { Seed, Specie, Genus, Family, RedBook, PlaceOfCollection, Account } = require('../models/models');
const path = require('path');
const multer = require('multer');

// Настройка multer: сохраняем файлы в “/public/uploads”
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Экспортируем мидлвар для роутера:
exports.uploadImageMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'xrayimage', maxCount: 1 }
]);

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
          ],
          order: [['id', 'ASC']]
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
        },
        { model: RedBook, as: 'RedBookRF' },
        { model: RedBook, as: 'RedBookSO' },
        { model: PlaceOfCollection },
        { model: Account }
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
    // req.files будет объектом вида { image: [<File>], xrayimage: [<File>] }
    let imageUrl = null;
    let xrayImageUrl = null;

    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        const file = req.files.image[0];
        imageUrl = `http://localhost:5000/static/uploads/${file.filename}`;
      }
      if (req.files.xrayimage && req.files.xrayimage.length > 0) {
        const file2 = req.files.xrayimage[0];
        xrayImageUrl = `http://localhost:5000/static/uploads/${file2.filename}`;
      }
    }

    // Остальные поля берём из req.body
    const seedData = {
      ...req.body,
      image: imageUrl,       // URL первого изображения (или null)
      xrayimage: xrayImageUrl // URL второго (или null)
    };

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

    // По умолчанию берём старые URL
    let imageUrl = seed.image;
    let xrayImageUrl = seed.xrayimage;

    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        const file = req.files.image[0];
        imageUrl = `http://localhost:5000/static/uploads/${file.filename}`;
      }
      if (req.files.xrayimage && req.files.xrayimage.length > 0) {
        const file2 = req.files.xrayimage[0];
        xrayImageUrl = `http://localhost:5000/static/uploads/${file2.filename}`;
      }
    }

    const updatedData = {
      ...req.body,
      image: imageUrl,
      xrayimage: xrayImageUrl
    };

    const updatedSeed = await seed.update(updatedData);
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