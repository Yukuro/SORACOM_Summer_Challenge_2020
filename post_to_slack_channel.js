const https = require('https');
const url = require('url');
const slackToken = process.env.SLACK_TOKEN;
const channelId  = process.env.CHANNEL_NOTIFY_ID;
const slackUrl = "https://slack.com/api/chat.postMessage";

exports.handler = function(e, ctx, cb) {
    console.log('event: %j', e);
    console.log('context: %j', ctx);

    var slackReqOptions = url.parse(slackUrl);
    slackReqOptions.method = 'POST';
    
    var di_score = 0.81 * e.temp + 0.01 * e.humi * (0.99 * e.temp - 14.3) + 46.3;
    
    var payload =
        e.type == 99 ? {"channel":channelId,"text":"現在、気温:" + e.temp + "度/湿度:" + e.humi + "%で不快指数" + parseInt(di_score) +"だよ～"} 
    :  di_score > 80 ? {"channel":channelId,"text":"暑くない?:thermometer:\n" + "現在、気温:" + e.temp + "度/湿度:" + e.humi + "%で不快指数" + parseInt(di_score) +"だよ～"}
    : {}
    ;
    
    var body = JSON.stringify(payload);
    console.log("body: %j", body);
    var auth = "Bearer " + slackToken; 
    slackReqOptions.headers = { 
        "Authorization": auth,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        };
    var req = https.request(slackReqOptions, function(res) {
        if (res.statusCode === 200) {
            console.log('Posted to slack');
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