const createTokenUser = (user) => {
	return { id: user.id, email: user.email, role: user.role };
};

module.exports = createTokenUser;
