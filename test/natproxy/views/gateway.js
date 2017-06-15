/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    "wilton/test/natproxy/appContext",
    "wilton/natproxy/proxy"
], function(ctx, proxy) {
    "use strict";
    
    function enqueue(req) {
        return proxy.enqueueRequest({
            dbConn: ctx.dbConn,
            req: req,
            waitTimeoutMillis: ctx.conf.waitTimeoutMillis,
            timeoutStatusCode: ctx.conf.timeoutStatusCode            
        });
    }
    
    return {
        GET: enqueue,
        POST: enqueue,
        PUT: enqueue,
        DELETE: enqueue
    };
});
