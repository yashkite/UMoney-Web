// umoney-backend/controllers/liabilityController.js

// Logic for handling liability-related requests
exports.getLiabilities = (req, res) => {
  res.status(200).json({ message: "Get liabilities" });
};

exports.createLiability = (req, res) => {
  res.status(201).json({ message: "Create liability" });
};

exports.getLiability = (req, res) => {
  res.status(200).json({ message: `Get liability with ID: ${req.params.id}` });
};

exports.updateLiability = (req, res) => {
  res.status(200).json({ message: `Update liability with ID: ${req.params.id}` });
};

exports.deleteLiability = (req, res) => {
  res.status(204).json({ message: `Delete liability with ID: ${req.params.id}` });
};
