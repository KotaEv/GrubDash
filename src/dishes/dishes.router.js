// TODO: Implement the /dishes routes needed to make the tests pass
const router = require("express").Router();
const controller = require("../dishes/dishes.controller");
const methodNOtAllowed = require("../errors/methodNotAllowed");

//need /dish and /:dishId
router
    .route("/") //list + create
    .get(controller.list)
    .post(controller.create);

router
    .route("/:dishId") //read+update
    .get(controller.read)
    .put(controller.update)
    .all(methodNOtAllowed); //methodNotAllowed - MUST HAVE .all


module.exports = router;
