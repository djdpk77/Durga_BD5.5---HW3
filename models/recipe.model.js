const { DataTypes, sequelize } = require('../lib/index');

let recipe = sequelize.define('recipe', {
  title: DataTypes.STRING,
  chef: DataTypes.STRING,
  cuisine: DataTypes.STRING,
  preparationTime: DataTypes.INTEGER,
  instructions: DataTypes.TEXT,
});

module.exports = { recipe };
