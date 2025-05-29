const { Role, Account } = require('../models/models');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Account }]
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{ model: Account }]
    });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    
    const updatedRole = await role.update(req.body);
    res.json(updatedRole);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
