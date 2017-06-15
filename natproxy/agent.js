/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "wilton/Logger",
    "wilton/clientManager",
    "wilton/utils"
], function(Logger, clientManager, utils) {
    "use strict";

    var logger = new Logger("wilton.natproxy.agent");

    function agentJob(conf) {
        utils.checkProperties(conf, [
            "clientManagerKey",
            "proxyGetUrl",
            "proxyPostUrl",
            "endpointName",
            "endpointBaseUrl"]);
        var client = clientManager.create({
            sharedKey: conf.clientManagerKey
        });
        logger.debug("polling");
        var resp = client.execute(conf.proxyGetUrl + "?endpoint=" + conf.endpointName);
        if (200 === resp.responseCode) {
            logger.warn(resp.data);
            var reqlist = JSON.parse(resp.data);
            for (var i = 0; i < reqlist.length; i++) {
                var req = reqlist[i];
                var sresp = client.execute(conf.endpointBaseUrl + req.path, {
                    data: req.data,
                    meta: {
                        method: req.method,
                        headers: JSON.parse(req.headers)
                    }
                });
                client.execute(conf.proxyPostUrl + "?endpoint=" + conf.endpointName + "&id=" + req.id, {
                    data: sresp.data,
                    meta: {
                        method: "POST"
                    }
                });
            }
        }
    }
    
    return {
        agentJob: agentJob
    };
});