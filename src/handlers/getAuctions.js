import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
    let auctions;
    try {
        const data = await dynamodb.scan({
        TableName: process.env.AUCTIONS_TABLE_NAME,        
        }).promise();  
        
        auctions = data.Items
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 201,
        body: JSON.stringify({ auctions }),
    };
}

export const handler = commonMiddleware(getAuctions);
    



