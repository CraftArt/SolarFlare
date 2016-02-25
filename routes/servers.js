'use strict';
var express = require('express');
var router = express.Router();
var DataUtil = require('../modules/DataUtil');

router.get('/', function(req, res, next) {
    new DataUtil().process( (serverData) => {res.send(serverData);} );
});

module.exports = router;
