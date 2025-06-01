require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 
const { sequelize } = require('./models/models.js'); // Правильный путь к models.js

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Проверка подключения к базе данных
sequelize.authenticate()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Синхронизация моделей с базой данных
sequelize.sync({ force: false, alter: false })
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Error syncing database:', err));

app.use('/api/seeds', require('./routes/seedRouter'));
app.use('/api/families', require('./routes/familyRouter'));
app.use('/api/genus', require('./routes/genusRouter'));
app.use('/api/species', require('./routes/speciesRouter'));
app.use('/api/book-levels', require('./routes/booklevelRouter'));
app.use('/api/red-books', require('./routes/redbookRouter'));
app.use('/api/places', require('./routes/placeRouter'));
app.use('/api/roles', require('./routes/roleRouter'));
app.use('/api/accounts', require('./routes/accountRouter'));
app.use('/api/auth', require('./routes/authRouter'));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});