'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User = require('../user/user.model').model,
    Category = require('./category.model');

var ClassifiedSchema = new Schema({
  created: { type: Date, default: Date.now, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  email: String,
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  title: String,
  location: String,
  contact: String,
  content: String,
  posted: {
    type: Date,
    set: function(posted) {
      this._previousPosted = this.posted;
      return posted;
    },
    index: true
  },
  images: [{image: { data: Buffer }, thumbnail: {data: Buffer }}],
  ipAddress: { type: String },
  flagged: {
    type: Boolean,
    default: false
  },
  flaggedBy: [{user: {type: Schema.Types.ObjectId, ref: 'User'}, ipAddress: String, date: {type: Date, default: Date.now}}],
  emailDigests: [Date],
});

var fieldAccessByUserRole = {
  admin: ['all'],
  default: ['created','user','email','categories','title','location','contact','content','posted','images','flagged'],
}
fieldAccessByUserRole.user = fieldAccessByUserRole.default;
fieldAccessByUserRole.email = fieldAccessByUserRole.default;

exports.fieldAccessByUserRole = fieldAccessByUserRole;
exports.model = mongoose.model('Classified', ClassifiedSchema);
