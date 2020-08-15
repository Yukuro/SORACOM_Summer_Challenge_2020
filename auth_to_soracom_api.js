const https = require('https');
const url = require('url');

const authKeyId = process.env.AUTH_KEY_ID;
const authKeySecret = process.env.AUTH_KEY_SECRET;

const authUrl = "https://api.soracom.io/v1/auth";

exports.handler = function(e, ctx, cb) {
    console.log('event: %j', e);
    console.log('context: %j', ctx);

    var authReqOptions = url.parse(authUrl);
    authReqOptions.method = 'POST';

    var payload_auth = 
      { "authKey": authKeySecret, "authKeyId": authKeyId, "tokenTimeoutSeconds": 18000 };

    var body_auth = JSON.stringify(payload_auth);
    console.log("body: %j", body_auth);
    
    authReqOptions.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        };

    var req_auth = https.request(authReqOptions, function(res_auth) {
      var apiKey = '', apiToken = '';
      if (res_auth.statusCode === 200) {
        console.log('Posted to Auth');
        res_auth.setEncoding('utf8');
        res_auth.on('data', (chunk) => {
            console.log("BODY : " + chunk);
            var parsedAuth = JSON.parse(chunk);
            apiKey = parsedAuth.apiKey;
            apiToken = parsedAuth.token;
            cb(null, {"result":"ok", "apiKey": apiKey, "apiToken": apiToken});
        });
      } else {
        cb(false, {"result":"ng", "reason":'Failed to post slack ' + res_auth.statusCode});
      }
    return {
      'apiKey': apiKey,
      'apitoken': apiToken
    };
    });

    req_auth.write(body_auth);
    req_auth.end();
};