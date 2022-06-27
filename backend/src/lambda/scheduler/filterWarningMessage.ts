import * as AWS from 'aws-sdk'

const snsWarningTopic = process.env.SNS_WARNING_TOPIC
const accountId = process.env.AWS_ACCOUNT_ID
const region = process.env.REGION
exports.handler = function() {
    console.log
    const topicArn = "arn:aws:sns:" + region + ":" + accountId + ":" + snsWarningTopic
    console.log(`ARN of Topic: ${topicArn}`)
    var eventText = "Hello SNS"
    console.log("Received event:", eventText);
    var sns = new AWS.SNS();
    var params = {
        Message: eventText, 
        Subject: "Test SNS From Lambda",
        TopicArn: topicArn
    };
    sns.publish(params);
};