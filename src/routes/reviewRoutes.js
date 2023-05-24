const expres = require('express');
// const { Model } = require('sequelize');
const router = expres.Router();
const {authenticateUser} = require('../middleware/authhentication')

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

router
  .route('/')
  .post(authenticateUser, createReview)
  .get(getAllReviews)

  router
    .route('/:id')
    .get(getSingleReview)
    .patch(authenticateUser, updateReview)
    .delete(authenticateUser, deleteReview);

module.exports = router
