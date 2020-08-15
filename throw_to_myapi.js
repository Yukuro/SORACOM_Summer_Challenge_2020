const https = require('https');
const url = require('url');
const machineArn = process.env.STATEMACHINE;
const atsuatsuUrl = process.env.APIURL;

exports.handler = function(e, ctx, cb) {
    console.log('event: %j', e);
    console.log('context: %j', ctx);
    console.log('URL: %s', atsuatsuUrl);

    var atsuReqOptions = url.parse(atsuatsuUrl);
    atsuReqOptions.method = 'POST';
    
    var payload = 
    {
        "input": "{}",
        "stateMachineArn": machineArn
    };
    
    var body = JSON.stringify(payload);
    console.log("body: %j", body);
    atsuReqOptions.headers = { 
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    };
    var req = https.request(atsuReqOptions, function(res) {
        if (res.statusCode === 200) {
            console.log('Posted to machine');
            console.log('res: %s',res);
            cb(null, {"result":"ok"});
        } else {
            cb(false, {"result":"ng", "reason":'Failed to post slack ' + res.statusCode});
        }
        return res;
    });
    req.write(body);
    req.end();
};