import {Resolver, Schema} from './graphql';
import {graphql} from 'graphql';
import {locatedError, formatError} from 'graphql/error';



export const graphqlApi = (event, context, callback) => {
    const baseResponse = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
        }
    };

    let graphqlRequest = '';

    try {
        graphqlRequest = JSON.parse(event.body);
        if(typeof graphqlRequest.query === 'undefined') {
            throw new Error('Not a graphql query');
        }
    } catch(err) {
        return callback(null, {
            statusCode: 400,
            body: {
                errors: [
                    formatError(locatedError(err))
                ]
            }
        });
    }

    const {query, variables} = graphqlRequest;

    graphql(Schema, query, Resolver, variables).then((result) => {
        callback(null, Object.assign({}, baseResponse, {
            body: result,
            statusCode: result.errors ? 400 : 200
        }));
    }).catch(err => {
        callback(null, Object.assign({}, baseResponse, {
            statusCode: 500
        }));
    });
};