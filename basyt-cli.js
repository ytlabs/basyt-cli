var _ = require('lodash'),
    fs = require("fs");

function InputError(errors) {
    this.name = "Input Error";
    this.err = errors;
    this.statusCode = 200;
    Error.captureStackTrace(this, InputError);
}

function BasytError(err, statusCode) {
    this.name = "Basyt Internal Error";
    this.err = err;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, BasytError);
}

InputError.prototype = Object.create(Error.prototype);
InputError.prototype.constructor = InputError;
BasytError.prototype = Object.create(Error.prototype);
BasytError.prototype.constructor = BasytError;

function Basyt() {
    //register basyt instance to process
    process.basyt = this;

    var config = GLOBAL.APP_CONFIG;
    var entitiesFolder = config.basyt.entities_folder || config.base_folder + 'entities/';

    //setup properties
    this.collections = {};
    this.ErrorDefinitions = {
        InputError: InputError,
        BasytError: BasytError
    };

    this.truncateEntities = function () {
        _.forOwn(process.basyt.collections, function (entity) {
            console.log(entity.name);
            entity.delete({}, {multi: true}).catch(function () {});
        });
    };

    //Import entities
    if (fs.existsSync(entitiesFolder)) {
        fs.readdirSync(entitiesFolder).forEach(function (file, index) {
            var entityName = file.toLowerCase().slice(0, -3),
                entityConfig = require(entitiesFolder + file),
                storage = entityConfig.storage || 'mongodb',
                Collection = require('basyt-' + storage + '-collection');
            this.collections[entityConfig.collection.name] = new Collection(entityConfig.collection, entityName);
        }, this);
    }
}

module.exports = Basyt;