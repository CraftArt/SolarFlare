"use strict";
let fs = require('fs'),
    _ = require('underscore'),
    Converter = require('csvtojson').core.Converter;
_.mixin({
        groupByMulti: function (data, values, ctx) {
            if (!values.length){
                return data;
            }
            let byFirst = _.groupBy(data, values[0], ctx),
                rest = values.slice(1);
            for (let prop of byFirst) {
                byFirst[prop] = _.groupByMulti(byFirst[prop], rest, ctx);
            }
            return byFirst;
        }
    });

class DataUtil {

    constructor(){
    }

    _grabMapping(mappingCsvPath, serverCsvPath, callback){
        let _fileStream = fs.createReadStream(mappingCsvPath),
            _csvConverter = new Converter({constructResult: true});
        _fileStream.pipe(_csvConverter);
        _csvConverter.on("end_parsed", (data) => {
            this._mappingJson = _.filter(data, (d) => d.Identifier !== '' );
            this._serverDataJson = this._grabServerData(serverCsvPath, callback);
        });
    }

    _grabServerData(serverCsvPath, callback){
        let _fileStream = fs.createReadStream(serverCsvPath);
        let _csvConverter = new Converter({constructResult: true});
        _fileStream.pipe(_csvConverter);
        _csvConverter.on("end_parsed", (data) => {
            this._serverDataJson = data;
            return callback();
        });
    }

    _clubData(mappingCsvPath, serverCsvPath, callback){
    this._grabMapping(mappingCsvPath, serverCsvPath, () => {
        for(let appObj of this._mappingJson){
            if (appObj.Identifier.indexOf(',') === -1) {
                for (let serverObj of this._serverDataJson) {
                    if (appObj.Identifier.indexOf(',') === -1) {
                        if (serverObj.App === undefined && serverObj.Name.indexOf(appObj.Identifier.trim()) !== -1) {
                            serverObj.App = appObj.Acronym === '' ? appObj.App : appObj.Acronym;
                            serverObj.Portfolio = appObj.Portfolio;
                            serverObj.Service = appObj.Service;
                        }
                    }
                }
            } else {
                let idGroup = appObj.Identifier.split(',');
                for (let id of idGroup) {
                    for (let serverObj of this._serverDataJson) {
                        if (serverObj.App === undefined && serverObj.Name.indexOf(id.trim()) !== -1) {
                            serverObj.App = appObj.Acronym === '' ? appObj.App : appObj.Acronym;
                            serverObj.Portfolio = appObj.Portfolio;
                            serverObj.Service = appObj.Service;
                        }
                    }
                }
            }
        }

        let lessData = _.filter(this._serverDataJson, (data) => data.Service != null);
        fs.writeFile("./public/data/clubTest.json", JSON.stringify(lessData));
        return callback(lessData);
        });
    }

    process(mappingCsvPath, serverCsvPath, callback){
        this._clubData(mappingCsvPath, serverCsvPath, (data) => {
            let jsonObj = data,
                totalServers = jsonObj.length,
                groupedData = _.groupByMulti(jsonObj,['Portfolio','Service','App','Model','OS']),
                root = {
                    name: "Dash",
                    total: totalServers,
                    children:[]
                };
            for(let portfolio of groupedData) {
                let levelP = {
                    name: portfolio,
                    autocolor: true,
                    children: []
                }
                for(let service of groupedData[portfolio]) {
                    let level0 = {
                        name: service,
                        autocolor: true,
                        children: []
                    };
                    for(let app of groupedData[portfolio][service]) {
                        let level1 = {
                            name: app,
                            autocolor: true,
                            children: []
                        };
                        for(let model of groupedData[portfolio][service][app]) {
                            let level2 = {
                                name: model,
                                type: 'Model',
                                children: []
                            };
                            for(let os in groupedData[portfolio][service][app][model]) {
                                let level3 = {
                                    name: os,
                                    type: 'OS',
                                    size: groupedData[portfolio][service][app][model][os].length
                                };
                                //console.log(service+"-"+app + "-" + model + "-" +os+ ","+groupedData[service][app][model][os].length);
                                level2.children.push(level3);
                            }
                            level1.children.push(level2);
                        }
                        level0.children.push(level1);
                    }
                    levelP.children.push(level0);
                }
                root.children.push(levelP);
            }
            fs.writeFile("./public/data/test.json",JSON.stringify(root));
            callback(root);
        });
    }
}

//ES6 export not yet supported by node, falling back to commonJS
//export {DataUtil};

module.exports = DataUtil;