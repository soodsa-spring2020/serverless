const AWS = require('aws-sdk');
exports.handler = function(event, context) {
     var m = JSON.parse(event.Records[0].Sns.Message);
     const params = {
        Destination: { 
            ToAddresses: [m.email]
        },
        Message: { 
            Body: {  
                Text: { 
                    Data: m.bill
                }
            },
            Subject: { 
                Data: 'Due Bills' 
            }
        },
        Source: 'sood.sa@husky.neu.edu'
    };
    
    const sendPromise = new AWS.SES().sendEmail(params).promise();
    sendPromise.then(data => { 
        context.done(null, 'Success'); 
    }).catch(err => {
        context.done(err, 'Failed');
    });
    
};
   