import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;   
    const { amount } = event.body;

    const auction = await getAuctionById(id);
    
    if(amount <= auction.highestBid.amount){
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount,
        },
        ReturnValues: 'ALL_NEW',
    };

    let updateAuction;
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

export const handler = commonMiddleware(placeBid);




