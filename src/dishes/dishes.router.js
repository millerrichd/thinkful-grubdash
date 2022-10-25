const router = require("express").Router();

const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// root routes
router.route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed)

// dishId param route  
router.route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

module.exports = router;
