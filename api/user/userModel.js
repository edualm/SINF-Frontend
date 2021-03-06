var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var RoleSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: Number,
    min: 0,
    required: true
  }

});
var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: RoleSchema,
    required: false
  }

});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  this.password = this.encryptPassword(this.password);
  console.log(this);
  next();
})

UserSchema.methods = {
  // check the passwords on signin
  authenticate: function(plainTextPword) {
    return bcrypt.compareSync(plainTextPword, this.password);
  },
  // hash the passwords
  encryptPassword: function(plainTextPword) {
    if (!plainTextPword) {
      return ''
    } else {
      var salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(plainTextPword, salt);
    }
  },

  toJson: function() {
    var obj = this.toObject()
    delete obj.password;
    return obj;
  }
};


module.exports = mongoose.model('user', UserSchema);
