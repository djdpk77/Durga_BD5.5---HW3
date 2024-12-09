const express = require('express');
const { resolve } = require('path');

const app = express();
let { sequelize } = require('./lib/index');
let { recipe } = require('./models/recipe.model');
const { user } = require('./models/user.model');
const { favorite } = require('./models/favorite.model');
let { Op } = require('@sequelize/core');

app.use(express.json());

let recipeData = [
  {
    title: 'Spaghetti Carbonara',
    chef: 'Chef Luigi',
    cuisine: 'Italian',
    preparationTime: 30,
    instructions:
      'Cook spaghetti. In a bowl, mix eggs, cheese, and pepper. Combine with pasta and pancetta.',
  },
  {
    title: 'Chicken Tikka Masala',
    chef: 'Chef Anil',
    cuisine: 'Indian',
    preparationTime: 45,
    instructions:
      'Marinate chicken in spices and yogurt. Grill and serve with a creamy tomato sauce.',
  },
  {
    title: 'Sushi Roll',
    chef: 'Chef Sato',
    cuisine: 'Japanese',
    preparationTime: 60,
    instructions:
      'Cook sushi rice. Place rice on nori, add fillings, roll, and slice into pieces.',
  },
  {
    title: 'Beef Wellington',
    chef: 'Chef Gordon',
    cuisine: 'British',
    preparationTime: 120,
    instructions:
      'Wrap beef fillet in puff pastry with mushroom duxelles and bake until golden.',
  },
  {
    title: 'Tacos Al Pastor',
    chef: 'Chef Maria',
    cuisine: 'Mexican',
    preparationTime: 50,
    instructions:
      'Marinate pork in adobo, grill, and serve on tortillas with pineapple and cilantro.',
  },
];

app.get('/seed_db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    await recipe.bulkCreate(recipeData);

    await user.create({
      username: 'foodlover',
      email: 'foodlover@example.com',
      password: 'securepassword',
    });

    res.status(200).json({ message: 'Database seeding successfull' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/recipes', async (req, res) => {
  try {
    let recipes = await recipe.findAll();

    res.status(200).json({ recipes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    let users = await user.findAll();

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/favorites', async (req, res) => {
  try {
    let favorites = await favorite.findAll();

    res.status(200).json({ favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Function to handle the add to favorite process
async function favoriteRecipe(data) {
  let newFavorite = await favorite.create({
    userId: data.userId,
    recipeId: data.recipeId,
  });

  return { message: 'Recipe added to favorite successfully', newFavorite };
}

//Endpoint 1: Favorite a Recipe
app.get('/users/:id/favorite', async (req, res) => {
  try {
    let userId = parseInt(req.params.id);
    let recipeId = parseInt(req.query.recipeId);
    let response = await favoriteRecipe({ userId, recipeId });

    return res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Function to handle the remove from favorite process
async function unfavoriteRecipe(data) {
  let count = await favorite.destroy({
    where: {
      userId: data.userId,
      recipeId: data.recipeId,
    },
  });

  if (count === 0) return {};

  return { message: 'Recipe removed from favorite successfully' };
}

//Endpoint 2: Unfavorite a Recipe
app.get('/users/:id/unfavorite', async (req, res) => {
  try {
    let userId = parseInt(req.params.id);
    let recipeId = parseInt(req.query.recipeId);
    let response = await unfavoriteRecipe({ userId, recipeId });

    if (!response.message) {
      return res
        .status(404)
        .json({ message: 'Recipe not present in your favorites' });
    }

    return res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Function to handle fetching favorite recipes
async function getAllFavoritedRecipes(userId) {
  let recipeIds = await favorite.findAll({
    where: {
      userId: userId,
    },
    attributes: ['recipeId'],
  });

  let recipeRecords = [];

  for (let i = 0; i < recipeIds.length; i++) {
    recipeRecords.push(recipeIds[i].recipeId);
  }

  let favoritedRecipes = await recipe.findAll({
    where: { id: { [Op.in]: recipeRecords } },
  });

  return { favoritedRecipes };
}

//Endpoint 3: Get All Favorited Recipes
app.get('/users/:id/favorites', async (req, res) => {
  try {
    let userId = parseInt(req.params.id);
    let response = await getAllFavoritedRecipes(userId);

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
