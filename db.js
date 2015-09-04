var Promise = require('bluebird');

module.exports = {
    comments: {
        save: function(comment){
            console.log('saving', comment);
            return Promise.resolve(comment);
        }
    }
};