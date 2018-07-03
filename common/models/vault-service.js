'use strict';
var async = require('async');
var axios = require('axios');

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
                    axios({
                            method: 'PUT',
                            url: baseUrl,
                            headers: {
                                'X-Vault-Token': Key
                            }
                        })
                        .then(function(response) {
                            responseService.sealed = true;
                            callback(null, "ok")
                        })
                        .catch(function(error) {
                            responseService = error.response.data;
                            callback(null, "ok");
                        });
                }
            ],
            function(err, response) {
                return cb(null, responseService);
            }
        );
    };


    Vaultservice.unseal = function(key1, key2, key3, cb) {
        var vaultUrl = "127.0.0.1:8200";
        var responseService = [];
        var unsealKeys = [{
            "key": key1
        }, {
            "key": key2
        }, {
            "key": key3
        }];
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
                    var baseUrl = vaultUrl + '/v1/sys/unseal';
                    for (var i = 0; i < 3; i++) {
                        var jsonData = JSON.parse(JSON.stringify(unsealKeys[i]));
                        axios({
                                method: 'put',
                                url: baseUrl,
                                data: jsonData
                            })
                            .then(function(response) {
                                responseService.push(response.data);
                                if (i = 2) {
                                    callback(null, "ok")
                                }
                            })
                            .catch(function(error) {
                                responseService.push(error.response.data);
                                if (i = 2) {
                                    callback(null, "ok")
                                }
                            });


                    }

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
                    axios({
                            method: 'get',
                            url: baseUrl
                        })
                        .then(function(response) {
                            responseService = response.data;
                            callback(null, "ok")
                        })
                        .catch(function(error) {
                            responseService = error.response.data;
                            callback(null, "ok");
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
            accepts: [{
                    arg: 'key1',
                    type: 'string'
                },
                {
                    arg: 'key2',
                    type: 'string'
                },
                {
                    arg: 'key3',
                    type: 'string'
                }
            ],
            returns: {
                arg: 'data',
                type: 'array'
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
