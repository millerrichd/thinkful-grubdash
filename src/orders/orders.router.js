const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// root routes
router.route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

// orderId param route  
router.route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);

module.exports = router;
