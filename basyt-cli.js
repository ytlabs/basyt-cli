var _ = require("lodash"),
    bunyan = require("bunyan"),
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

    var log, access_log;
    log = bunyan.createLogger({name: projectInfo.name, streams: config.basyt.log_streams});
    access_log = bunyan.createLogger({name: projectInfo.name+"_access", streams: config.basyt.access_log_streams});

    GLOBAL.logger = log;
    GLOBAL.access_logger = access_log;

    this.truncateEntities = function () {
        _.forOwn(process.basyt.collections, function (entity) {
            log.info(entity.name);
            entity.delete({}, {multi: true}).catch(function () {});
        });
    };

    //Initialize Auth
    if (config.basyt.enable_auth === true && !_.isUndefined(config.basyt.auth)) {
        log.info('Installed Auth');
        var userEntity, userSettingsEntity, userCollection;
        userCollection = require('basyt-storage-collection');
        userEntity = require('./user');
        userSettingsEntity = require('./user_settings');
        this.collections['user'] = new Collection(userEntity, 'user');
        this.collections['user_settings'] = new Collection(userSettingsEntity, 'user_settings');
    }

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