'use strict';

var express = require('express');
var controller = require('./classified.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/getPosted', controller.getPosted);
router.get('/getPosted/:startTime', controller.getPosted);
router.get('/getPosted/:startTime/:window', controller.getPosted);
router.get('/getAll', auth.hasRole('admin'), controller.getAll);
router.get('/getAll/:startTime', auth.hasRole('admin'), controller.getAll);
router.get('/getAll/:startTime/:window', auth.hasRole('admin'), controller.getAll);
router.get('/getForUser', auth.isAuthenticated(), controller.getForUser);
router.get('/categories', controller.indexCategories);
router.get('/:id', controller.show);
router.get('/:id/flag', controller.flag);
router.get('/:classifiedId/images/image/:imageId', controller.getImage);
router.get('/:classifiedId/images/thumbnail/:imageId', controller.getThumbnail);
router.post('/', controller.create);
router.post('/emailDigest', auth.hasRole('admin'), controller.emailDigest);
router.post('/image/upload', controller.uploadImage);
router.get('/image/rotate/:imageFile/:orientation', controller.rotateImage);
router.get('/image/getTemp/:imageFile', controller.getTempImage);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.post('/multipleUpdate', auth.hasRole('admin'), controller.multipleUpdate);
router.post('/multipleRemove', auth.hasRole('admin'), controller.multipleRemove);
router.delete('/:id', auth.isAuthenticated(), controller.remove);

module.exports = router;
