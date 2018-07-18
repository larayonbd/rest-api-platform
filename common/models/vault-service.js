'use strict';
var async = require('async');
var axios = require('axios');
var exec = require('child_process').exec;

module.exports = function(Vaultservice) {

    Vaultservice.seal = function(Key, cb) {
        var vaultUrl = "127.0.0.1:8200";
        var responseService = {};
        async.waterfall(
            [
                function(callback) {
                    var app = Vaultservice.app;
                    app.models.services.findOne({
                        where: {
                            name: 'vault'
                        }
                    }, function(err, vaultConfig) {
                        if (vaultConfig === null) {
                            callback(new Error('Configuration for Vault Service not found'), null);
                        }
                        vaultUrl = vaultConfig.host;
                        callback(null, "ok");

                    });
                },
                function(step1, callback) {

                    var baseUrl = vaultUrl + '/v1/sys/seal';
                    var child;
                    var url = "curl -s -o /dev/null -w '%{http_code}' --header X-Vault-Token:" + Key + " -X PUT " + baseUrl;
                    child = exec(url, function(error, stdout, stderr) {
                        if (stdout) {
                            responseService.sealed = (stdout = 204) ? true : false;
                            callback(null, "ok")
                        } else {
                            responseService.data = "Connection refused";
                            callback(null, "ok")


                        }


                    });

                }
            ],
            function(err, response) {
                return cb(null, responseService);
            }
        );
    };


    Vaultservice.unseal = function(data, cb) {
        var vaultUrl = "127.0.0.1:8200";
        var responseService = {
            "status": "run",
            "key1": "undefined",
            "key2": "undefined",
            "key3": "undefined"
        };
        var unsealKeys = [{
            "key": data.key1
        }, {
            "key": data.key2
        }, {
            "key": data.key3
        }];
        var baseUrl = vaultUrl + '/v1/sys/unseal';
        var child;
        async.waterfall(
            [
                function(callback) {
                    var app = Vaultservice.app;
                    app.models.services.findOne({
                        where: {
                            name: 'vault'
                        }
                    }, function(err, vaultConfig) {
                        if (vaultConfig === null) {
                            callback(new Error('Configuration for Vault Service not found'), null);
                        }
                        vaultUrl = vaultConfig.host;
                        callback(null, "ok");

                    });
                },
                function(step1, callback) {
                    const jsonData = JSON.stringify(unsealKeys[0]);
                    var url = "curl -s  -o /dev/null -w '%{http_code}'  --header 'Content-Type: application/json' -X PUT -d '" + `${jsonData}` + "' " + baseUrl;
                    child = exec(url, function(error, stdout, stderr) {
                        if (stdout) {
                            if (stdout == 200) {
                                responseService.key1 = true;
                                callback(null, "ok");
                            } else {
                                responseService.key1 = false;
                                callback(null, "ok");

                            }
                        } else {
                            callback(null, "ok");
                        }
                    });
                },
                function(step2, callback) {
                    const jsonData = JSON.stringify(unsealKeys[1]);
                    var url = "curl -s  -o /dev/null -w '%{http_code}'  --header 'Content-Type: application/json' -X PUT -d '" + `${jsonData}` + "' " + baseUrl;
                    child = exec(url, function(error, stdout, stderr) {
                        if (stdout) {
                            if (stdout == 200) {
                                responseService.key2 = true;
                                callback(null, "ok");
                            } else {
                                responseService.key2 = false;
                                callback(null, "ok");

                            }
                        } else {
                            callback(null, "ok");
                        }
                    });
                },
                function(step3, callback) {
                    const jsonData = JSON.stringify(unsealKeys[2]);
                    var url = "curl -s  -o /dev/null -w '%{http_code}'  --header 'Content-Type: application/json' -X PUT -d '" + `${jsonData}` + "' " + baseUrl;
                    child = exec(url, function(error, stdout, stderr) {
                        if (stdout) {
                            if (stdout == 200) {
                                responseService.key3 = true;
                                callback(null, "ok");
                            } else {
                                responseService.key3 = false;
                                callback(null, "ok");

                            }
                        } else {
                            callback(null, "ok");
                        }
                    });
                }
            ],
            function(err, response) {

                return cb(null, responseService);
            }
        );
    };

    Vaultservice.vaultHealth = function(cb) {
        var vaultUrl = "127.0.0.1:8200";
        var responseService = {};
        async.waterfall(
            [
                function(callback) {
                    var app = Vaultservice.app;
                    app.models.services.findOne({
                        where: {
                            name: 'vault'
                        }
                    }, function(err, vaultConfig) {
                        if (vaultConfig === null) {
                            callback(new Error('Configuration for Vault Service not found'), null);
                        }
                        vaultUrl = vaultConfig.host;
                        callback(null, "ok");

                    });
                },
                function(step1, callback) {

                    var baseUrl = vaultUrl + '/v1/sys/health';
                    var child;
                    var url = "curl -k " + baseUrl;
                    child = exec(url, function(error, stdout, stderr) {
                        if (stdout) {
                            responseService = JSON.parse(stdout);
                            callback(null, "ok")
                        } else {
                            responseService.status = "Connection refused";
                            callback(null, "ok")


                        }


                    });
                }
            ],
            function(err, response) {
                return cb(null, responseService);
            }
        );
    };

    Vaultservice.remoteMethod(
        'vaultHealth', {
            http: {
                path: '/vaultHealth',
                verb: 'get'
            },
            returns: {
                arg: 'data',
                type: 'object'
            }
        }
    );
    Vaultservice.remoteMethod(
        'unseal', {
            http: {
                path: '/unseal',
                verb: 'put'
            },
            accepts: {
                arg: 'data',
                type: 'object',
                http: {
                    source: 'body'
                }
            },
            returns: {
                arg: 'data',
                type: 'object'
            }
        }
    );
    Vaultservice.remoteMethod(
        'seal', {
            http: {
                path: '/seal',
                verb: 'put'
            },
            accepts: {
                arg: 'token',
                type: 'string'
            },
            returns: {
                arg: 'data',
                type: 'object'
            }
        }
    );

};
