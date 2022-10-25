const { privateDecrypt } = require("crypto");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//verify if the passed in property exists
function propertyExists(property) {
  return function (req, res, next) {
    const { data = {} } = req.body
    if(data[property]) {
      return next();
    }
    next({status: 400, message: `Dish must include a ${property}`});
  }
}

//verify if the passed in property is not empty
function propertyIsNotEmpty(property) {
  return function (req, res, next) {
    const { data = {}} = req.body;
    if(data[property].length) {
      return next();
    }
    next({status: 400, message: `Dish must include a ${property}`});
  }
}

//verify that the price is an integer and is positive
function propertyPriceIsPositive(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (Number.isInteger(price) && price > 0) {
    return next();
  }
  next({status: 400, message: `Dish must have a price that is an integer greater than 0`});
}

//verify that the dish id already exists in the data
function dishIdExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(dish => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({status: 404, message: `Dish does not exist: ${dishId}`})
}

//verify that the id if passed in the body matches the route, otherwise it is okay to go on.
function idMatchesDishId (req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if( dishId === id || !id ) {
    return next();
  }
  next({status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`});
}

//finally reply with all dishes
function list(req, res, next) {
  res.json({data: dishes});
}

//finally create a new dish
function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const id = nextId();
  const newDish = {
    id,
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  res.status(201).json({data: newDish});
}

//finally return the data
function read(req, res, next) {
  res.json({data: res.locals.dish});
}

//finally update the dish
function update(req, res, next) {
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  const dish = res.locals.dish
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.status(200).json({data: dish});
}

module.exports = {
  list,
  create: [ 
    propertyExists("name"),
    propertyExists("description"),
    propertyExists("price"),
    propertyExists("image_url"),
    propertyIsNotEmpty("name"),
    propertyIsNotEmpty("description"),
    propertyIsNotEmpty("image_url"),
    propertyPriceIsPositive,
    create
  ],
  read: [ dishIdExists, read],
  update: [ 
    dishIdExists,
    propertyExists("name"),
    propertyExists("description"),
    propertyExists("price"),
    propertyExists("image_url"),
    propertyIsNotEmpty("name"),
    propertyIsNotEmpty("description"),
    propertyIsNotEmpty("image_url"),
    propertyPriceIsPositive,
    idMatchesDishId,
    update
  ]
}