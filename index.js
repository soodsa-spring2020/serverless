const AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB();
const tableName = 'DUE_BILL_EMAIL_DB';
const subject = 'Due Bills';
const source = 'sood.sa@husky.neu.edu';
const ttl = 40;

exports.handler = function(event, context) {
    var message = JSON.parse(event.Records[0].Sns.Message);
    var SECONDS_IN_AN_HOUR = ttl;
    var secondsSinceEpoch = Math.round(Date.now() / 1000);
    var expirationTime = secondsSinceEpoch + SECONDS_IN_AN_HOUR;

    var getParams = {
        TableName: tableName,
        FilterExpression: '(email = :email) AND (expires_at > :expires_at)',
        ExpressionAttributeValues: {
          ':email': {S: message.email},
          ':expires_at' : {S: secondsSinceEpoch.toString()},
        }
    };

    const get = ddb.scan(getParams).promise();
    get.then(data => {
        if(data.Count == 0) { 
            var params = {
                Destination: { ToAddresses: [message.email] },
                Message: { 
                    Body: { Text: { Data: message.bill } },
                    Subject: { Data: subject }
                },
                Source: source
            };
            
            const sendPromise = new AWS.SES().sendEmail(params).promise();
            sendPromise.then(data => { 
                var putParams = {
                    TableName: tableName,
                    Item: {
                        'email' : {S: message.email},
                        'content' : {S: message.bill},
                        'expires_at' : {S: expirationTime.toString()}
                    }
                };

                ddb.putItem(putParams, function(err, data) {
                    if (err) {
                      console.log("Error Put", err);
                    } else {
                      console.log("Success Put", data);
                    }
                });
            }).catch(err => {
                context.done(err, 'Failed');
            });
        }
    }).catch(err => {
        context.done(err, 'Failed');
    });
};
