const createTokenUser = (user) => {
	return { id: user.id, name: user.firstName, role: user.role };
};

module.exports = createTokenUser;
