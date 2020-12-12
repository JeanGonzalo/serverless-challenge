import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;   
    const { amount } = event.body;
    let updateAuction;
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount,
        },
        ReturnValues: 'ALL_NEW',
    };

    try {
        let data = await dynamodb.update(params).promise();
        updateAuction = data.Attributes;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({ updateAuction, event }),
    };
}

export const handler = middy(placeBid)
    .use(httpJsonBodyParser())
    .use(httpEventNormalizer())
    .use(httpErrorHandler());




