const Order = require("../models/order");
const Product = require("../models/Product");

const StatusCodes = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");
const fakeStripAPI = async ({ amount, currency }) => {
  const client_secret = "Somerandomvalue";
  return { client_secret, amount };
};
//CREATE ORDER
const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No items in the cart");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide both shipping fee and tax"
    );
  }
  let orderItems = [];
  let subTotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `Product does'nt exist with id:${item.product}`
      );
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    //add item to product
    orderItems = [...orderItems, singleOrderItem];
    //calculate subtotal
    subTotal += item.amount * price;
  }
  //calculate total
  const total = subTotal + shippingFee + tax;
  const paymentIntent = await fakeStripAPI({
    amount: total,
    currency: "usd",
  });
  const order = await Order.create({
    orderItems,
    subTotal,
    total,
    shippingFee,
    tax,
    clientSecret: paymentIntent.client_secret,
    user: req.user.id,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};
//ALL ORDERS
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

//SINGLE ORDER
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const singleOrder = await Order.findOne({ _id: orderId });
  if (!singleOrder) {
    throw new CustomError.NotFoundError(
      `no order exist with this id:${orderId}`
    );
  }
  checkPermissions(req.user, singleOrder.user);
  res.status(StatusCodes.OK).json({ singleOrder });
};

const getCurrentUserOrders = async (req, res) => {
  const currentUserOrders = await Order.find({ user: req.user.id });
  if (!currentUserOrders) {
    throw new CustomError.BadRequestError(
      `No orders for this customer id:${req.user.id}`
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ currentUserOrders, count: currentUserOrders.length });
};
//UPDATE ORDER
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { shippingFee, status, tax } = req.body;
  const order = await Order.findOne(
    { _id: id });
    console.log(req.user.id, order.user);
    checkPermissions(req.user, order.user)
    order.shippingFee= shippingFee,
    order.status = status,
     order.tax= tax,    
    { new: true, runValidators: true }
  
  if (!order) {
    throw new CustomError.NotFoundError("No such order");
  } 
  res.status(StatusCodes.OK).json({ order });
};

//DELETE ORDER
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id });
  console.log(order)
  if (!order) {
    throw new CustomError.NotFoundError(`no such order with id:${id}`);
  }
  checkPermissions(req.user,order.user)
  await order.remove();
  res.status(StatusCodes.OK).json({ msg: "deleted successfully" });
};
module.exports = {
  getAllOrders,
  getSingleOrder,
  createOrder,
  getCurrentUserOrders,
  updateOrder,
  deleteOrder,
};
