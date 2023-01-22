const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list (req, res) {
  res.json({ data: orders });
}
//if props are not validated ---> 400 error
function validateProperties (req, res, next) {
  const { data } = req.body;
  const requiredProps = ['deliverTo', 'mobileNumber', 'dishes'];
  
  requiredProps.forEach(prop => {
    if (!data[prop]) { //if a prop does not exist - error
      next({
          status: 400, 
          message: `Order must include a ${prop}`
      });
    }
    if (prop === 'dishes') { //if prop is dishes then must check if length is > 0 + is an array
      // check if data['dishes'] is an array OR has length > 0 || ---> 400 error
      if (data[prop].length === 0 || !Array.isArray(data[prop])) {
          next({
              status: 400, 
              message: 'Order must include at least one dish'
          });
      }
      // check if each dish contains quantity - if no dish quantity matches, or the quantity is not an integer or
      //if the quantity < 0 ---> 400 error
      data[prop].forEach((dish, index) => {
        if (!dish['quantity'] || !Number.isInteger(dish['quantity']) || dish['quantity'] <= 0) {
          next({
              status: 400, 
              message: `Dish ${index} must have a quantity that is an integer greater than 0`
          });
        }
      })
    }
  })
  return next();
}
//status = 201 for accepted create
function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;

    const order = {
        id: nextId(), //use function per instructions
        deliverTo, 
        mobileNumber, 
        status, 
        dishes
    };
    orders.push(order);
    res.status(201).json({ data: order });
}

function foundOrder (orderId) { 
    return orders.find(({id}) => id===orderId);
}

//check if orderId exists in the data - if not ---> 400 error
function orderIdExists(req, res, next) { 
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id == orderId);

    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404, 
        message: `Order does not exist: ${orderId}.`,
    })
}
//this read will use res.locals 
function read(req, res) {
     res.json({data:res.locals.order});
}
//if id does not eqaul route id - 400 error
function validateId(req, res, next) {
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const { orderId } = req.params;
//     console.log(orderId) - commented out to silence
    if (!req.body.data.id || req.body.data.id === "") {
      return next();
    }
    if (req.body.data.id != res.locals.order.id) {
      next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
      })
    }
    else {
      return next();
    }
  
}
// if not status, or status is an empty string or status is invalid - 400 error
function validateStatus(req, res, next) {
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    if (!status || status === "" || status === "invalid") {
      return next({
        status: 400,
        message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
      });
    }
    else if (status === "delivered") { //if status is delivered no updating or deleting
      next({
        status: 400,
        message: "A delivered order cannot be changed",
      })
    }
    else {
      return next();
    }
}

//ID CANNOT BE OVERWRITTEN
function update(req, res, next) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    
    order.id = res.locals.order.id;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({ data: order });
}
//pull status from res.locals because we are sharing data
function isPending(req, res, next) {
    const { status } = res.locals.order;
    if (status !== "pending") { //orders cannot be deleted until pending status - 400
        return next({
            status: 400, 
            message: "An order cannot be deleted unless it is pending.",
        })
    }
    next();
}
//DESTROY fn name - not delete because delete is a stored function
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === Number(orderId));
  // `splice()` returns an array of the deleted elements, even if it is one element
  const deletedOrders = orders.splice(index, 1);
  res.sendStatus(204);
}
//ORDER
module.exports = {
    list,
    create: [
      validateProperties,
      create,
    ],
    read: [
      orderIdExists, 
      read,
    ],
    update: [orderIdExists, validateProperties, validateId, validateStatus, update],
    destroy: [
      orderIdExists, 
      isPending,
      destroy,
    ]
}

