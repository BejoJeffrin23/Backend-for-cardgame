const express = require('express');
const app = express();
const path= require('path')
const bodyParser = require('body-parser');

const redis = require('redis');
const redisPort = 6379
const client = redis.createClient(redisPort);


client.on('connect', () => {
    console.log('connected to database -redis');
  });
  
client.on('error', (err) => {
    console.log("Error " + err);
  });
  
const port = 7000;


app.use(bodyParser.json()); // for parsing application/json 
app.use(bodyParser.urlencoded({ extended: false })); 



// api routes index
app.get('/api/v1/index', (req, res) => {
    res.json({ message: 'Welcome to  cards' });
});



client.on("error", (err) => {
    console.log(err);
})

// middleware for allowing cross origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, api_key, Accept, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    //console.log('req.query', req.query, req.query.API_KEY);
    // console.log('env '+app.get('env'));

    if (req.query.API_KEY) {
        const API_KEY = req.query.API_KEY;
        //console.log('API_KEY ', API_KEY);
        if (API_KEY == undefined) {
            return res.status(401).json({ message: "API_KEY undefined" });
        }
        if (API_KEY != 'fHUuioTyELUantbGA7O4qP7NkY6JMdE8') {
            return res.status(401).json({ message: "Invalid API_KEY" });
        }
    }
    else {
        return res.status(401).json({ message: "API_KEY not provided" });
    }

    next()


 
});

app.get("/api/v1/users", async(req, res) => {
    try {
        console.log('working')
        client.zrevrange('users', 0, -1, 'withscores', function(err, members) {
    
            function listToMatrix(list, elementsPerSubArray) {
                var matrix = [], i, k;
            
                for (i = 0, k = -1; i < list.length; i++) {
                    if (i % elementsPerSubArray === 0) {
                        k++;
                        matrix[k] = [];
                    }
            
                    matrix[k].push(list[i]);
                }
            
                return matrix;
            }    
        var lists=listToMatrix(members,2);
        // console.log( lists );
        if (!err) return  res.status(200).send({message: 'User scores fetched',users:lists});

    });
      
     
    } catch(err) {
        res.status(500).send({message: err.message});
    }
});


app.post("/api/v1/users", (req, res) => {
    console.log('working')
    try {
        client.zrank(['users',req.body.name], function (e, r) {
            console.log(r,e)

            if (r!==null) return  res.status(200).send({message: 'User already registered'});
        
          client.zadd([
            'users',
            0,
            req.body.name
          ], function (e, r) {
            console.log(r,e)

            if (!e) return  res.status(200).send({message: 'User registered'});
        
            log.error(e);
            exit();
            
          })
            
          })
        
    } catch(err) {
        res.status(500).send({message: err.message});
    }
});

app.put("/api/v1/users", (req, res) => {
    console.log('working')
    try {
        client.zincrby([
            'users',
            1,
            req.body.name
          ], function (e, r) {
            if (!e) return;
        
            log.error(e);
            exit();
          })
    } catch(err) {
        res.status(500).send({message: err.message});
    }
});


app.listen(port, () => {
    console.log(' listening on port ' + port);
});