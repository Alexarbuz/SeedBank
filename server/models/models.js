const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../db.js");

const Family = sequelize.define('Family', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name_of_family: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'family',
  timestamps: false
});

const Genus = sequelize.define('Genus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name_of_genus: {
    type: DataTypes.STRING,
    allowNull: false
  },
  family_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Family,
      key: 'id'
    }
  }
}, {
  tableName: 'genus',
  timestamps: false
});

const Specie = sequelize.define('Specie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name_of_specie: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genus_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Genus,
      key: 'id'
    }
  }
}, {
  tableName: 'specie',
  timestamps: false
});

const BookLevel = sequelize.define('BookLevel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level_of_book: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'book_level',
  timestamps: false
});

const RedBook = sequelize.define('RedBook', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  book_level_id: {
    type: DataTypes.INTEGER,
    references: {
      model: BookLevel,
      key: 'id'
    }
  }
}, {
  tableName: 'red_book',
  timestamps: false
});

const PlaceOfCollection = sequelize.define('PlaceOfCollection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  place_of_collection: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'place_of_collection',
  timestamps: false
});

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name_of_role: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'role',
  timestamps: false
});

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  login: DataTypes.STRING,
  password: DataTypes.STRING,
  patronymic: DataTypes.STRING,
  active: DataTypes.BOOLEAN,
  role_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id'
    }
  }
}, {
  tableName: 'account',
  timestamps: false
});

const Seed = sequelize.define('Seed', {
  seed_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seed_name: DataTypes.STRING,
  completed_seeds: DataTypes.FLOAT,
  seed_germination: DataTypes.FLOAT,
  seed_moisture: DataTypes.FLOAT,
  date_of_collection: DataTypes.DATEONLY,
  gpsaltitude: DataTypes.STRING,
  gpslatitude: DataTypes.STRING,
  gpslongitude: DataTypes.STRING,
  weight_of1000seeds: DataTypes.FLOAT,
  number_of_seeds: DataTypes.INTEGER,
  comment: DataTypes.TEXT,
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  account_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Account,
      key: 'id'
    }
  },
  place_of_collection_id: {
    type: DataTypes.INTEGER,
    references: {
      model: PlaceOfCollection,
      key: 'id'
    }
  },
  red_book_rf_id: {
    type: DataTypes.INTEGER,
    references: {
      model: RedBook,
      key: 'id'
    }
  },
  red_book_so_id: {
    type: DataTypes.INTEGER,
    references: {
      model: RedBook,
      key: 'id'
    }
  },
  specie_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Specie,
      key: 'id'
    }
  }
}, {
  tableName: 'seed',
  timestamps: false
});



// Установка связей между моделями
Family.hasMany(Genus, { foreignKey: 'family_id' });
Genus.belongsTo(Family, { foreignKey: 'family_id' });

Genus.hasMany(Specie, { foreignKey: 'genus_id' });
Specie.belongsTo(Genus, { foreignKey: 'genus_id' });

BookLevel.hasMany(RedBook, { foreignKey: 'book_level_id' });
RedBook.belongsTo(BookLevel, { foreignKey: 'book_level_id' });

Role.hasMany(Account, { foreignKey: 'role_id' });
Account.belongsTo(Role, { foreignKey: 'role_id' });

Account.hasMany(Seed, { foreignKey: 'account_id' });
Seed.belongsTo(Account, { foreignKey: 'account_id' });

PlaceOfCollection.hasMany(Seed, { foreignKey: 'place_of_collection_id' });
Seed.belongsTo(PlaceOfCollection, { foreignKey: 'place_of_collection_id' });

RedBook.hasMany(Seed, { foreignKey: 'red_book_rf_id', as: 'RedBookRF' });
RedBook.hasMany(Seed, { foreignKey: 'red_book_so_id', as: 'RedBookSO' });
Seed.belongsTo(RedBook, { foreignKey: 'red_book_rf_id', as: 'RedBookRF' });
Seed.belongsTo(RedBook, { foreignKey: 'red_book_so_id', as: 'RedBookSO' });

Specie.hasMany(Seed, { foreignKey: 'specie_id' });
Seed.belongsTo(Specie, { foreignKey: 'specie_id' });


module.exports = {
  sequelize,
  Family,
  Genus,
  Specie,
  BookLevel,
  RedBook,
  PlaceOfCollection,
  Role,
  Account,
  Seed,
};