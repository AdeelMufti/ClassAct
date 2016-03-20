'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.remove);
router.get('/getAll', auth.hasRole('admin'), controller.getAll);
router.get('/getAll/:startTime', auth.hasRole('admin'), controller.getAll);
router.get('/getAll/:startTime/:window', auth.hasRole('admin'), controller.getAll);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/generateVerificationEmail', auth.isAuthenticated(), controller.generateVerificationEmail);
router.put('/:id/verify', controller.verify);
router.put('/:id/update', auth.isAuthenticated(), controller.update);
router.post('/misc/:action', controller.misc);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.post('/multipleUpdate', auth.hasRole('admin'), controller.multipleUpdate);
router.post('/multipleRemove', auth.hasRole('admin'), controller.multipleRemove);

module.exports = router;
