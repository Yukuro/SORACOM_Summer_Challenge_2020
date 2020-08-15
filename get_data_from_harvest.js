const https = require('https');
const url = require('url');
const gpsIMSI = process.env.GPS_IMSI;
const harvestUrl = "https://api.soracom.io/v1/data/Subscriber/" + gpsIMSI + "?sort=desc&limit=1";

exports.handler = function (e, ctx, cb) {
    console.log('event: %j', e);
    console.log('context: %j', ctx);

    var harvestReqOptions = url.parse(harvestUrl);
    harvestReqOptions.method = 'GET';
    harvestReqOptions.headers = {
        'Accept': 'application/json',
        'X-Soracom-API-Key': e.apiKey,
        'X-Soracom-Token': e.apiToken
    };

    var req_harvest = https.request(harvestReqOptions, function (res_harvest) {
        if (res_harvest.statusCode === 200) {
            console.log('Got to Harvest');
            res_harvest.setEncoding('utf8');
            res_harvest.on('data', (chunk) => {
                console.log("BODY : " + chunk.slice(1,-1));
                var parsedHarvest = JSON.parse(chunk.slice(1,-1));
                console.log("content : " + parsedHarvest.content);
                
                var parsedPayload = JSON.parse(parsedHarvest.content);
                console.log("payload : " + parsedPayload.payload);
                var buff = new Buffer(parsedPayload.payload, 'base64');
                var text = buff.toString('ascii');
                console.log("text : " + text);
                var payload = JSON.parse(text);
                payload.type = 99; //for LTE-M Button
                cb(null, payload);
            });
        } else {
            cb(false, { "result": "ng", "reason": 'Failed to post slack ' + res_harvest.statusCode });
        }
        return res_harvest;
    });

    req_harvest.end();
};