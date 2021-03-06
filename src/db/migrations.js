
const _       = require('lodash');
const async   = require('async');

const fs      = require('fs');
const path    = require('path');
const util    = require('util');

const config  = require('../config');
const logger  = require('../logger');
const plugins = require('../plugins');

let db;

module.exports.init = function(_db) {
  db = _db;

  if (!config.auto_migrate) {
    return ;
  }

  db.getConnection((err, connection) => {
    if (err) {
      return console.error(err);
    }
    const lock = config.mysql.database + '.__db_migrations';
    connection.query(`SELECT GET_LOCK('${lock}', 0) AS 'lock'`, function(err, res) {
      if (!res || !res[0] || res[0].lock < 1) {
        // could not get lock, skip migration
        return connection.release();
      }
      // got lock, migrate!
      module.exports.migrate(() => {
        connection.query(`SELECT RELEASE_LOCK('${lock}')`, () => {
          connection.release();
        });
      });
    });
  });
};

//
module.exports.initmigrations = function(callback) {
  var create = 'CREATE TABLE IF NOT EXISTS `__db_migrations` (' + '`id` INTEGER NOT NULL AUTO_INCREMENT, ' + '`file` VARCHAR(100), ' + '`success` TINYINT(1), ' + '`err` VARCHAR(255), ' + '`creation` DATETIME, ' + 'PRIMARY KEY (`id`) ' + ') ENGINE=InnoDB DEFAULT CHARSET=utf8';
  db.query(create, callback);
};

//
module.exports.list = function(callback) {
  module.exports.initmigrations(() => {
    var sql = 'SELECT * FROM `__db_migrations` ORDER BY `id` DESC';
    db.query(sql, callback);
  });
};

//
module.exports.migrate = function(sqldir, callback) {
  if (_.isFunction(sqldir)) {
    callback = sqldir;
    sqldir = null;
  }
  sqldir          = sqldir || './sql';
  let querybuf  = '';

  const executeLine = function(line, callback) {
    line = line.replace('\r', '');
    line.trim();
    if (line.match('^--')) {
      callback();
    } else if (line.match('\\;$')) {
      querybuf += line;
      if (config.mysql.debugsql) {
        logger.info(querybuf);
      }
      db.query(querybuf, callback);
      querybuf = '';
    } else if (line.length > 0) {
      querybuf += line;
      callback();
    } else {
      callback();
    }
  };

  const executeFile = function(file, callback) {
    if (!file.filename.match('[0-9]{8}.*\\.sql$')) {
      return callback();
    }
    return async.waterfall([
      function(callback) {
        var sql;
        sql = 'SELECT id from  `__db_migrations` WHERE `file`=? AND `success`=1';
        return db.queryOne(sql, [file.filename], function(err, result) {
          if (result) {
            return callback('alreadyplayed');
          } else {
            return callback();
          }
        });
      }, function(callback) {
        return fs.readFile(file.path, function(err, data) {
          if (err || !data) {
            logger.error(err);
            return callback('could not read ' + file.path);
          }
          return callback(null, data);
        });
      }, function(data, callback) {
        var lines = data.toString().split('\n');
        if (config.mysql.debugsql) {
          logger.info('Executing ' + file.path + ': ' + lines.length + ' lines to process');
        }
        async.eachSeries(lines, executeLine, function(err) {
          if (err) {
            logger.error('SQL error in file %s', file.path);
          }
          var sql = 'INSERT INTO `__db_migrations`(file, success, err, creation) ' + 'VALUES(?, ?, ?, ?)';
          var success = err ? 0 : 1;
          logger.info((success ? '✅ ' : '❌ ') + file.filename);
          err = err ? util.format('%s', err) : null;
          db.query(sql, [file.filename, success, err, new Date()], () => {
            callback(err);
          });

        });
      }
    ], function(err, result) {
      if (err === 'alreadyplayed') {
        err = null;
      }
      callback(err, result);
    });
  };

  //
  let files = [];
  fs.readdir(sqldir, function(err, filenames) {
    if (err) {
      return callback(err);
    }
    filenames.forEach(function(filename) {
      files.push({
        filename: filename,
        path:     path.join(sqldir, filename)
      });
    });

    // Load Plugins migrations
    async.each(plugins.list, function(plugin, callback) {
      fs.readdir(plugin.dirname + '/sql', function(err, filenames) {
        filenames.forEach(function(filename) {
          files.push();
          files.push({
            filename: filename,
            path:     path.join(plugin.dirname, '/sql', filename)
          });
        });
        callback();
      });
    }, () => {
      // execute migrations
      files = _.sortBy(files, 'filename');
      module.exports.initmigrations(() => {
        async.eachSeries(files, executeFile, callback);
      });
    });
  });
};
