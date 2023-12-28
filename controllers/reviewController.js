const Review = require("../models/Review");
const Product = require("../models/Product");

const CustomError = require("../errors");
const StatusCodes = require("http-status-codes");
const { checkPermissions } = require("../utils");

//ALL REVIEWS
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  }).populate({path:"user",select:"name"});
  if (reviews.length < 1) {
    throw new CustomError.NotFoundError("No reviews");
  }
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

//SINGLE REVIEW
const getSingleReview = async (req, res) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError("no such review");
  }
  res.status(StatusCodes.OK).json({ review });
};

//CREATE REVIEW
const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValid = await Product.findOne({ _id: productId });

  if (!isValid) {
    throw new CustomError.NotFoundError(`no product with such id:${productId}`);
  }
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.id,
  });
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "review already submitted for this product"
    );
  }
  req.body.user = req.user.id;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

//UPDATE REVIEW
const updateReview = async (req, res) => {
  const reviewId = req.params.id;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError("no such review for this product");
  }
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  review.save();
  res.status(StatusCodes.OK).json({ review });
};

//DELETE REVIEW
const deleteReview = async (req, res) => {
  const reviewId = req.params.id;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError("no such review");
  }
  checkPermissions(req.user, review.user);
  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "Success! deleted " });
};

const getSingleProductReviews = async(req,res)=>{
  const {id:productId} = req.params;
const reviews = await Review.find({product:productId});
res.status(StatusCodes.OK).json({reviews, count:reviews.length})
}

module.exports = {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
  getSingleReview,
  getSingleProductReviews,
};
