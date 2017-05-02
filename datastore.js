#!/usr/bin/env node

/**
 * The LevelDB datastore wrapper functions for the unblinkingbot.
 * @module datastore
 * @author jmg1138 {@link https://github.com/jmg1138 jmg1138 on GitHub}
 */

/**
 * Require the 3rd party modules that will be used.
 * @see {@link https://github.com/petkaantonov/bluebird bluebird}
 */
const P = require("bluebird");

/**
 * Datastore related functions for the unblinkingbot application.
 * @constant datastore
 */
const datastore = {

  /**
   * Get all key-value pairs.
   * @function getAllData
   * @param {Object} db Reference to the LevelDB data store
   * @param {Function} callback Called when the ReadStream ends.
   */
  getAllData: db => {
    return new P((resolve, reject) => {
      let foundData = {};
      db.createReadStream()
        .on("data", data => foundData[data.key] = data.value)
        .on("error", err => reject(err))
        //.on("close", () => console.log("closing"))
        .on("end", () => resolve(foundData));
    });
  },

  /**
   * Get all keys with a given prefix.
   * @function getKeysByPrefix
   * @param {Object} bundle References to the LevelDB data store, Slack RTM Client, and Socket.io server.
   * @param {Function} callback A callback function
   */
  getValuesByKeyPrefix: (bundle, prefix) => {
    return new P((resolve, reject) => {
      let values = {};
      bundle.db.createReadStream()
        .on("data", data => {
          if (data.key.startsWith(prefix)) {
            values[data.key] = data.value;
            /*
            console.log(`Prefix: ${prefix}`);
            console.log(`emitName: ${emitName}`);
            console.log(`Data.value: ${data.value}`);
            bundle.io.emit(emitName, data.value);
            */
          }
        })
        .on("error", (err) => reject(err))
        /*.on("close", () => console.log("closing"))*/
        .on("end", () => resolve(values));
    });
  },

  /**
   * @param {Object} bundle References to the LevelDB data store, Slack RTM Client, and Socket.io server.
   * @param {Function} callback A callback function
   */
  trimByKeyPrefix: (bundle, prefix) => {
    return new P((resolve, reject) => {
      let matchingKeys = [];
      bundle.db.createReadStream({
          keys: true,
          values: false
        })
        .on("data", key => {
          if (key.startsWith(prefix)) matchingKeys.push(key);
        })
        .on("error", (err) => reject(err))
        //.on("close", () => console.log("closing"))
        .on("end", () => {
          matchingKeys.sort().reverse();
          Object.keys(matchingKeys).forEach(key => {
            if (key > 4) bundle.db.del(matchingKeys[key]);
          });
          resolve(bundle);
        });
    });
  }

};

module.exports = datastore;