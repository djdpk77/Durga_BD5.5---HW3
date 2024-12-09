const { DataTypes, sequelize } = require('./../lib/index');
const { user } = require('./user.model');
const { recipe } = require('./recipe.model');

let favorite = sequelize.define('favorite', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'user',
      key: 'id',
    },
  },
  recipeId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'recipe',
      key: 'id',
    },
  },
});

user.belongsToMany(recipe, { through: favorite });
recipe.belongsToMany(user, { through: favorite });

module.exports = { favorite };
