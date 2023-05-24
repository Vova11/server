const express = require('express');
const {
	index,
	show,
	showCurrentUser,
	deleteUser,
	update,
	updatePassword,
} = require('../controllers/usersController');
const {
	authenticateUser,
	authorizePermissions,
} = require('../middleware/authhentication');
const router = express.Router();

router.route('/').get([authenticateUser, authorizePermissions('admin')], index);

router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, update);
router.route('/updatePassword').patch(authenticateUser, updatePassword);

router
	.route('/:id')
	.get(authenticateUser, show)
	.patch(authenticateUser, update)
	.delete(authenticateUser, deleteUser);

// router.route('/').get([authenticateUser, authorizePermissions('admin')], index);

// router.route('/showMe').get([authenticateUser], showCurrentUser);

// router.route('/updatePassword').patch([authenticateUser], updatePassword);

// router
// 	.route('/:id')
// 	.get(authenticateUser, show)
// 	.patch(authenticateUser, update)
// 	.delete(authenticateUser, deleteUser);

module.exports = router;
