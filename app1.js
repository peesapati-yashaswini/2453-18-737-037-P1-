var express=require('express')
var bodyParser=require('body-parser')
var Mongo=require('mongodb').Mongo;
var app=express()
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const MongoClient=require('mongodb').MongoClient;
//connecting server file for AWT
let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');

const url='mongodb://127.0.0.1:27017';
const dbname='hospmng';
let db

MongoClient.connect(url,{useUnifiedTopology:true},(err,client) =>{
    if(err) return console.log(err);
    db=client.db(dbname);
    console.log(`Connected Database:${url}`);
    console.log(`Database:${dbname}`);
})

app.get('/hospitaldetails',middleware.checkToken,(req,res)=>{ //fetching hospital details
    console.log(' hosp details');
    var data=db.collection('hospital').find().toArray().then(result => res.json(result));
})

app.get('/ventilatordetails',middleware.checkToken,(req,res)=>{ //fetching ventilator details
    console.log(' ventilator details');
    var data=db.collection('ventilator').find().toArray().then(result => res.json(result));
})
app.post('/searchventbystatus',middleware.checkToken,(req,res)=>{ //ventilator by status
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('ventilator').find({"status" : status}).toArray().then(result => res.json(result));
})
app.post('/searchventbyname',middleware.checkToken,(req,res)=>{//searching ventilators by hospital name
    var name=req.query.hname;
    console.log(name);
    var ventilatordetails=db.collection('ventilator').find({'hname':new RegExp(name,'i')}).toArray().then(result => res.json(result));
})
app.post('/searchbyname',middleware.checkToken,(req,res) => {//searching hosp by hospital name
    var name=req.query.hname;
    console.log(name);
    var data=db.collection('hospital').find({'hname':new RegExp(name,'i')}).toArray().then(result => res.json(result));
})
app.put('/updateventilator',middleware.checkToken,(req,res)=>{//updating ventilator
    var ventid={vid : req.body.vid};
    console.log(ventid);
    var newvalue={$set: {status:req.body.status}};
    db.collection('ventilator').updateOne(ventid,newvalue,function(err,result){
        res.send('1 document updated');
        if(err) throw err;
        //console.log('updated');
    })
})

app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{//add ventilator
    var hid=req.body.hid;
    var vid=req.body.vid;
    var status=req.body.status;
    var hname=req.body.hname;
    var item=
    {
        hid:hid,vid:vid,status:status,hname:hname
    };
    db.collection('ventilator').insertOne(item,function(err,result){
        res.json('Item inserted');
    })
})

app.delete('/delete',middleware.checkToken,(req,res)=>{//delete ventilator
    var myquery=req.query.vid;
    console.log(myquery);
    var myquery1={vid:myquery};
    db.collection('ventilator').deleteOne(myquery1,function(err,obj){
        res.json("Document deleted")
        if(err) throw err;
    })
})

app.listen(3000,function(){
    console.log('server started');
});
