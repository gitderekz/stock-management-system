const { Role, Permission, RolePermission } = require('../models');
const { createLog } = require('./logsController');

const listRoles = async (req, res) => {
  const roles = await Role.findAll({
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    order: [['name', 'ASC']],
  });
  res.json({ success: true, data: roles });
};

const createRole = async (req, res) => {
  const { name, description, permissionIds } = req.body;
  const role = await Role.create({ name, description });
  if (permissionIds && permissionIds.length > 0) {
    for (const permId of permissionIds) {
      await RolePermission.create({ roleId: role.id, permissionId: permId });
    }
  }
  try { await createLog(req.user?.id || null, 'Role', 'create', role.id, `Created role ${role.name}`, { permissionIds }, req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Role created', data: role });
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description, permissionIds } = req.body;

  const role = await Role.findByPk(id);
  if (!role) {
    return res.status(404).json({ success: false, message: 'Role not found' });
  }

  await role.update({ name: name || role.name, description: description !== undefined ? description : role.description });

  // Update permissions if provided
  if (permissionIds && Array.isArray(permissionIds)) {
    await RolePermission.destroy({ where: { roleId: role.id } });
    for (const permId of permissionIds) {
      await RolePermission.create({ roleId: role.id, permissionId: permId });
    }
  }
  try { await createLog(req.user?.id || null, 'Role', 'update', role.id, `Updated role ${role.name}`, { permissionIds }, req.ip); } catch (e) {}

  res.json({ success: true, message: 'Role updated', data: role });
};

const deleteRole = async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);
  if (!role) {
    return res.status(404).json({ success: false, message: 'Role not found' });
  }
  await RolePermission.destroy({ where: { roleId: role.id } });
  await role.destroy();
  try { await createLog(req.user?.id || null, 'Role', 'delete', role.id, `Deleted role ${role.name}`, null, req.ip); } catch (e) {}
  res.json({ success: true, message: 'Role deleted' });
};

module.exports = { listRoles, createRole, updateRole, deleteRole };
