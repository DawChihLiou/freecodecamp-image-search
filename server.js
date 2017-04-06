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
    
    // fetch 10 search results and allow pagination
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
        
        // save search record in database
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
    Mongo.connect(mlabUrl, (err, db) => {
       if (err) console.error(`Unable to connect to mongodb ${err}`);
       
       // get the latest 10 search records in {term, where} format
       db.collection('searches').find({}, {_id: false}, {
           limit: 10,
           sort: [['when', 'desc']]
       }).toArray((err, docs) => {
           if (err) console.error(`Unable to retrieve search records ${err}`);
           
           res.send(docs);
           db.close();
       })
    });
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`); 
});