const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { User, Role, Permission } = require('../models');
const { createLog } = require('./logsController');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      errors: [{ field: 'email/password', message: 'Missing credentials' }],
    });
  }

  const user = await User.findOne({ 
    where: { email },
    include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }] }]
  });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const passwordMatches = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const permissions = user.role?.permissions?.map(p => p.name) || ['*'];
  const tokenPayload = {
    id: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role?.name || 'guest',
    permissions: permissions.length > 0 ? permissions : ['*'],
  };

  const token = jwt.sign(tokenPayload, env.jwtSecret, { expiresIn: env.jwtExpire });

  try { await createLog(user.id, 'User', 'login', user.id, `User logged in: ${user.email}`, null, req.ip); } catch (e) {}

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || 'guest',
      status: user.status,
    },
  });
};

const register = async (req, res) => {
  const { email, password, fullName, roleId } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'Email, password and full name are required',
      errors: [{ field: 'registration', message: 'Missing required fields' }],
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
      errors: [{ field: 'password', message: 'Password too short' }],
    });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = await User.create({
    fullName,
    email,
    passwordHash: hashedPassword,
    roleId: roleId || null,
    status: 'active',
  });

  await newUser.reload({ include: [{ model: Role, as: 'role' }] });

  const tokenPayload = {
    id: newUser.id,
    email: newUser.email,
    roleId: newUser.roleId,
    roleName: newUser.role?.name || 'guest',
    permissions: ['*'],
  };

  const token = jwt.sign(tokenPayload, env.jwtSecret, { expiresIn: env.jwtExpire });

  try { await createLog(newUser.id, 'User', 'create', newUser.id, `Registered user ${newUser.email}`, null, req.ip); } catch (e) {}

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      roleId: newUser.roleId,
      roleName: newUser.role?.name || 'guest',
      status: newUser.status,
    },
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required', errors: [{ field: 'email', message: 'Email required' }] });
  }

  return res.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link shortly.' });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and password are required', errors: [{ field: 'reset', message: 'Missing required fields' }] });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters', errors: [{ field: 'password', message: 'Password too short' }] });
  }

  return res.json({ success: true, message: 'Password reset successful' });
};

const currentUser = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }] }]
  });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const permissions = user.role?.permissions?.map(p => p.name) || [];
  res.json({
    success: true,
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name,
      status: user.status,
      permissions,
    },
  });
};

const listUsers = async (req, res) => {
  const users = await User.findAll({
    include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'description'] }],
    order: [['fullName', 'ASC']]
  });
  const result = users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role?.name || 'Unassigned',
    status: user.status,
  }));
  res.json({ success: true, data: result });
};

const updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const updatedFields = {
    fullName: req.body.fullName || user.fullName,
    roleId: req.body.roleId !== undefined ? req.body.roleId : user.roleId,
    status: req.body.status || user.status,
  };

  if (req.body.password) {
    updatedFields.passwordHash = bcrypt.hashSync(req.body.password, 10);
  }

  await user.update(updatedFields);
  await user.reload({ include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }] });

  try { await createLog(req.user?.id || null, 'User', 'update', user.id, `Updated user ${user.email}`, JSON.stringify(updatedFields), req.ip); } catch (e) {}

  res.json({
    success: true,
    message: 'User updated',
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || 'Unassigned',
      status: user.status,
    },
  });
};

const deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  await user.destroy();
  try { await createLog(req.user?.id || null, 'User', 'delete', user.id, `Deleted user ${user.email}`, null, req.ip); } catch (e) {}
  res.json({ success: true, message: 'User deleted' });
};

module.exports = { login, register, forgotPassword, resetPassword, currentUser, listUsers, updateUser, deleteUser };
