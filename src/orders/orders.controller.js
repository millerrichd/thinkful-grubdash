const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//verifies if the passed in property exists
function propertyExists(property) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if(data[property]) {
      next();
    }
    next({status: 400, message: `Order must include a ${property}`});
  }
}

//verifies that the passed in property has some data in it.
function propertyIsNotEmpty(property) {
  return function (req, res, next) {
    const { data = {}} = req.body;
    if(data[property].length) {
      return next();
    }
    next({status: 400, message: `Dish must include a ${property}`});
  }
}

//verifies that dishes is a nonempty array
function propertyDishesisNonEmptyArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes) && dishes.length) {
    return next();
  }
  next({status: 400, message: `Order must include at least one dish`});
}

//verifies that each dish has a quantity that is an integer and is positive.
function propertyQuantityIsPositiveForAllDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  dishes.forEach( (dish, index) => {
    if(Number.isInteger(dish.quantity) && dish.quantity > 0) {
      //do nothing, its valid
    } else {
      return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
    }
  })
  next();
}

//verifies if the original order already is set to delivered
function propertyOfOrderAlreadyDelivered(req, res, next) {
  const order = res.locals.order;
  if (order.status !== "delivered") {
    return next();
  }
  next({status: 400, message: `A delivered order cannot be changed`});
}

//verifies is the original order is in pending
function propertyOfOrderOnlyPending(req, res, next) {
  const order = res.locals.order;
  if (order.status === "pending") {
    return next();
  }
  next({status: 400, message: `An order cannot be deleted unless it is pending`});
}

//validates that status can be only one of 4 types
function propertyStatusIsCorrectValues (req, res, next) {
  const { data: { status } = {} } = req.body;
  const validValues = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered"
  ]
  if (validValues.includes(status)) {
    return next();
  }
  next({status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered`});
}

//verifies if the order already exists and if it does save the order to res.locals
function orderIdExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(order => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({status: 404, message: `No matching order: ${orderId}`})
}

//verify if the id is provided it matches the route, if not provided carry on.
function idMatchesOrderId (req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if( orderId === id || !id ) {
    return next();
  }
  next({status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`});
}

//finally reply with a list of all orders.
function list(req, res, next) {
  res.json({data: orders});
}

//finally create a new order
function create (req, res, next) {
  const { data: {deliverTo, mobileNumber, dishes, status} = {} } = req.body
  const id = nextId();
  const newOrder = {
    id,
    deliverTo,
    mobileNumber,
    status,
    dishes
  }
  orders.push(newOrder)
  res.status(201).json({data: newOrder});
}

//finally read a single order from res.locals.
function read(req, res, next) {
  res.json({data: res.locals.order});
}

//finally update the order
function update(req, res, next) {
  const order = res.locals.order;
  const { data: {deliverTo, mobileNumber, dishes, status} = {} } = req.body
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  order.status = status;
  res.status(200).json({data: order});
}

//finally destroy the order
function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === Number(orderId));
  const deleted = orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    propertyExists("deliverTo"),
    propertyExists("mobileNumber"),
    propertyExists("dishes"),
    propertyIsNotEmpty("deliverTo"),
    propertyIsNotEmpty("mobileNumber"),
    propertyDishesisNonEmptyArray,
    propertyQuantityIsPositiveForAllDishes,
    create
  ],
  read: [orderIdExists, read],
  update: [
    orderIdExists,
    propertyOfOrderAlreadyDelivered,
    propertyExists("deliverTo"),
    propertyExists("mobileNumber"),
    propertyExists("dishes"),
    propertyExists("status"),
    propertyIsNotEmpty("deliverTo"),
    propertyIsNotEmpty("mobileNumber"),
    propertyIsNotEmpty("status"),
    propertyDishesisNonEmptyArray,
    propertyQuantityIsPositiveForAllDishes,
    propertyStatusIsCorrectValues,
    idMatchesOrderId,
    update
  ],
  delete: [ orderIdExists, propertyOfOrderOnlyPending, destroy ]
}
