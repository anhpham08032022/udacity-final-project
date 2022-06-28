import * as AWS from 'aws-sdk'
import { filterDoneIsFalse } from  '../../businessLogic/todos'

const snsWarningTopic = process.env.SNS_WARNING_TOPIC
const accountId = process.env.AWS_ACCOUNT_ID
const region = process.env.REGION
exports.handler = async function() {
    AWS.config.update({region: region})
    const topicArn = "arn:aws:sns:" + region + ":" + accountId + ":" + snsWarningTopic
    var todoItems = await filterDoneIsFalse();
    console.log("Received todo items:", todoItems);
    todoItems.forEach(item => {
        let msg = `Hi ${item.userId}. Your ${item.name} has one day left, please proceed.`
        var params = {
            Message: msg, 
            Subject: "List of undone Todos",
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
    })
    
};