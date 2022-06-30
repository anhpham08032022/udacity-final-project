import * as AWS from 'aws-sdk'
import { filterDoneIsFalse } from  '../../businessLogic/todos'

const snsWarningTopic = process.env.SNS_WARNING_TOPIC
const accountId = process.env.AWS_ACCOUNT_ID
const region = process.env.REGION
exports.handler = async function() {
    AWS.config.update({region: region});
    const topicArn = "arn:aws:sns:" + region + ":" + accountId + ":" + snsWarningTopic;
    // get todo items which has undone
    var todoItems = await filterDoneIsFalse();
    console.log("Received todo items:", todoItems);
    todoItems.forEach(item => {
        if (isOneDayLeft(item.dueDate)) {
            let msg = `Hi ${item.userId}. Your task [${item.name}] has one day left, please proceed.`;
            console.log(`Send notification with message: ${msg}`)
            var params = {
                Message: msg, 
                Subject: "List of undone Todos",
                TopicArn: topicArn
            };
            var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

            publishTextPromise.then(
            function(data) {
                console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
                console.log("MessageID is " + data.MessageId);
            }).catch(
                function(err) {
                console.error(err, err.stack);
            });
        }
    });
};

function isOneDayLeft(compareDate:string): boolean {
    var now = new Date();
    var date = new Date(compareDate);
    var diff = date.getTime() - now.getTime();
    var dayDiff = diff / (1000 * 60 * 60 * 24);
    return (dayDiff > 0 && dayDiff <= 1);
}