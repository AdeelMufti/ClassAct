'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
  sort: Number,
  title: [{language: String, value: String}],
  icon: String
});

module.exports = mongoose.model('Category', CategorySchema);
