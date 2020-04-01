const AWS = require('aws-sdk');
exports.handler = function(event, context) {
     var message = JSON.parse(event.Records[0].Sns.Message);
     const params = {
        Destination: { 
            ToAddresses: [message.email]
        },
        Message: { 
            Body: {  
                Text: { 
                    Data: message.bill
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
   