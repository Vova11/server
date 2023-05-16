function parseProductId(id) {
	const parsed = parseInt(id);
	if (isNaN(parsed)) {
		// throw new Error('Invalid product ID');
		console.log('ID not found');
	}
	return parsed;
}

module.exports = { parseProductId };
