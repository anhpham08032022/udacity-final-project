import * as AWS from 'aws-sdk'

const snsWarningTopic = process.env.SNS_WARNING_TOPIC
const accountId = process.env.AWS_ACCOUNT_ID
const region = process.env.REGION
exports.handler = function() {
    AWS.config.update({region: region})
    console.log
    const topicArn = "arn:aws:sns:" + region + ":" + accountId + ":" + snsWarningTopic
    console.log(`ARN of Topic: ${topicArn}`)
    var eventText = "Hello SNS"
    console.log("Received event:", eventText);
    var params = {
        Message: eventText, 
        Subject: "Test SNS From Lambda",
        TopicArn: topicArn
    };
    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
    function(data) {
        console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
    }).catch(
        function(err) {
        console.error(err, err.stack);
    });
};