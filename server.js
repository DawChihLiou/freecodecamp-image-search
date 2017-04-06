'use strict';

const port = process.env.PORT;
const apikey = process.env.BING_ACCOUNT_KEY;
const mlabUrl = process.env.MLAB_URL;

const express = require('express');
const url = require('url');
const Bing = require('node-bing-api')({accKey: apikey});
const mongodb = require('mongodb');

const app = express();
const Mongo = mongodb.MongoClient;

/**
 *  Image Search with Bing and save search record in MongoDB
 */
app.get('/api/imagesearch/:search', (req, res) => {
    const searchParams = req.params.search;
    const searchOffset = req.query.offset;
    const data = [];
    
    Bing.images(searchParams, {
        count: 10,
        offset: searchOffset || 0
    }, (err, resp, body) => {
        if (err) console.error(`Unable to fetch image data ${err}`);
        
        for (const v of body.value) {
            const img = {
                url: v.contentUrl,
                snippet: v.name,
                thumbnail: v.thumbnailUrl,
                context: v.contentUrl
            };
            data.push(img);
        }
        
        Mongo.connect(mlabUrl, (err, db) => {
            if (err) console.error(`Unable to connect to mongodb ${err}`);
            
            db.collection('searches').save({
                term: searchParams,
                when: (new Date()).toJSON()
            }, (err) => {
                if (err) console.error(`Unable to save search record to mongodb ${err}`);
                
                res.send(data);
                db.close();
            });
        });
    });
});

/**
 * Show latest searches from MongoDB
 */
app.get('/api/latest/imagesearch', (req, res) => {
    res.send('hi');
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`); 
});