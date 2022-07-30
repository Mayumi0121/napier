'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
    	static associate(models) {
			this.hasMany(models.Profile, {
				foreignKey: 'userId',
				sourceKey: 'id',
				as: 'profiles'
			})
    	}
  	}
  	User.init({
    	name: DataTypes.STRING,
    	hash_password: DataTypes.STRING
  	}, {
    	sequelize,
    	modelName: 'User',
  	});
  	return User;
};
