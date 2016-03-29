/**
 * Node Server Base Http.
 */

'use strict';


module.exports = function (response, ctx) {
    try {
        var info = JSON.parse(response.body);
            
        ctx.body = info;
    } catch(e) {
        // log.error('Rrong Java Response When Get Data');
        ctx.body = response.body;
    }
};
