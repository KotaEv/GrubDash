// TODO: Implement the /orders routes needed to make the tests pass
const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");


// /orders -- list + create
router
    .route("/")
    .get(controller.list)
    .post(controller.create);
// /:orderId -- read, destroy, update
router 
    .route("/:orderId")
    .get(controller.read)
    .delete(controller.destroy)
    .put(controller.update)
    .all(methodNotAllowed);


module.exports = router;
