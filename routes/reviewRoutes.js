const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllReviews,
  createReview,
  updateReview,
  getSingleReview,
  deleteReview,
} = require("../controllers/reviewController");
router.route("/").get(getAllReviews);
router.route("/").post(authenticateUser, createReview);
router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, authorizePermissions("admin"), updateReview)
  .delete(authenticateUser, authorizePermissions("admin"), deleteReview);

module.exports = router;
