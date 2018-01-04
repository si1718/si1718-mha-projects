"use strict";
/* global __dirname */

var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var mdb = require('mongodb');
var MongoClient = mdb.MongoClient;
var ObjectID = require('mongodb').ObjectID;
var path = require("path");
var accents = require('remove-accents');
var mdbURL = "mongodb://manuel:manuel@ds255455.mlab.com:55455/si1718-mha-projects";

var port = (process.env.PORT || 10000);
var BASE_API_PATH = "/api/v1";

var app = express();
app.use(cors());
var db;
var dbTweets;
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.json()); //use default json enconding/decoding
app.use(helmet()); //improve security

MongoClient.connect(mdbURL,{native_parser:true},(err,database) =>{

    if(err){
        console.log("CAN NOT CONNECT TO DB: "+err);
        process.exit(1);
    }
    
    db = database.collection("projects");
    dbTweets = database.collection("tweets");
    

    app.listen(port, () => {
        console.log("Magic is happening on port " + port);    
    });

});






// GET a collection
// app.get(BASE_API_PATH + "/projects", function (request, response) {
//     console.log("INFO: New GET request to /projects");
//     db.find({}).toArray( function (err, projects) {
//         if (err) {
//             console.error('WARNING: Error getting data from DB');
//             response.sendStatus(500); // internal server error
//         } else {
//             console.log("INFO: Sending projects: " + JSON.stringify(projects, 2, null));
//             response.send(projects);
//         }
//     });
// });

/*Get url params*/
app.get(BASE_API_PATH + "/projects", function (request, response) {

    console.log("INFO: New GET request to /projects");
    
    var researcherName = request.query.researcherName;
    var name = request.query.name;
    var type = request.query.type;
    var startDate = request.query.startDate;
    var endDate = request.query.endDate;
    var researchers = request.query.researchers;
    
    var search = request.query.search;
    var query;
    
    
    if(search){
        var searchStr = String(search);
        
        query = { $or: [ { 'researcher': { '$regex': searchStr,"$options":"i" } }, { 'researcherName': searchStr }, { 'name': searchStr }, { 'type': searchStr }, { 'startDate': searchStr }, { 'endDate': searchStr }, { 'researchers': searchStr }, { 'keywords': searchStr }]};

    }
    
    console.info(request.query);
    db.find(query).toArray( function (err, projects) {

        if (err) {

            console.error('WARNING: Error getting data from DB');

            response.sendStatus(500); // internal server error

        } else {

            console.log("INFO: Sending projects: " + JSON.stringify(projects, 2, null));

            response.send(projects);

        }

    });

});

app.get(BASE_API_PATH + "/tweets", function (request, response) {

    console.log("INFO: New GET request to /tweets");
    
    dbTweets.find({}).toArray(function (err, tweets) {

        if (err) {

            console.error('WARNING: Error getting data from DB');

            response.sendStatus(500); // internal server error

        } else {

            console.log("INFO: Sending tweets: " + JSON.stringify(tweets, 2, null));

            response.send(tweets);

        }

    });

});

// GET a single resource
app.get(BASE_API_PATH + "/projects/:idProject", function (request, response) {
    var idProject = request.params.idProject;
    if (!idProject) {
        console.log("WARNING: New GET request to /projects/:idProject without id, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New GET request to /projects/" + idProject);
        db.findOne({"idProject": idProject}, function (err, filteredProject) {
            
            if (err) {
                console.error('WARNING: Error getting data from DB');
                response.sendStatus(500); // internal server error
            } else {
               
                if (filteredProject) {
                    var project = filteredProject; //since we expect to have exactly ONE project with this id
                    console.log("INFO: Sending project: " + JSON.stringify(project, 2, null));
                    response.send(project);
                } else {
                    console.log("WARNING: There are not any project with idProject " + idProject);
                    response.sendStatus(404); // not found
                }
            }
        });
    }
});


//POST over a collection
app.post(BASE_API_PATH + "/projects", function (request, response) {
    var newProject = request.body;
    if (!newProject) {
        console.log("WARNING: New POST request to /projects/ without project, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New POST request to /projects with body: " + JSON.stringify(newProject, 2, null));
        if (!newProject.researcher || !newProject.name || !newProject.type) {
            console.log("WARNING: The project " + JSON.stringify(newProject, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // unprocessable entity
        } else {
            
             //Creating idPtoject
            var idProject = generateIdProject(newProject);
            db.findOne({"idProject": idProject }, function (err, projects) {
            //db.find({}, function (err, projects) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                    // var projectsBeforeInsertion = projects.filter((project) => {
                    //     return (project.id.localeCompare(newProject.id, "en", {'sensitivity': 'base'}) === 0);
                    // });
                    // if (projectsBeforeInsertion.length > 0) {
                    if (projects) {
                        console.log("WARNING: The project " + JSON.stringify(newProject, 2, null) + " already extis, sending 409...");
                        response.sendStatus(409); // conflict
                    } else {
                        var titleDate = generateIdProject(newProject);
                        
                        newProject.idProject = titleDate;
                        console.log("INFO: Adding project " + JSON.stringify(newProject, 2, null));
                        //Pasamos los strings a colecciones tanto de researchers como de keywords
                        var researchersCollection = researchersStrToCollection(newProject);
                        
                        newProject.researchers = researchersCollection;
                        
                        var keywordsCollection = keywordsStrToCollection(newProject);
                        
                        newProject.keywords = keywordsCollection;
                        db.insert(newProject);
                        response.sendStatus(201); // created
                    }
                }
            });
        }
    }
});


//POST over a single resource
app.post(BASE_API_PATH + "/projects/:idProject", function (request, response) {
    var idProject = request.params.idProject;
    console.log("WARNING: New POST request to /projects/" + idProject + ", sending 405...");
    response.sendStatus(405); // method not allowed
});


//PUT over a collection
app.put(BASE_API_PATH + "/projects", function (request, response) {
    console.log("WARNING: New PUT request to /projects, sending 405...");
    response.sendStatus(405); // method not allowed
});



//PUT over a single resource
app.put(BASE_API_PATH + "/projects/:idProject", function (request, response) {
    var updatedProject = request.body;
    var idProject = request.params.idProject;
    
    if (!updatedProject) {
        console.log("WARNING: New PUT request to /projects/ without project, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New PUT request to /projects/" + idProject + " with data " + JSON.stringify(updatedProject, 2, null));
        if (!updatedProject.researcher || !updatedProject.name || !updatedProject.type){
            console.log("WARNING: The project " + JSON.stringify(updatedProject, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // unprocessable entity
        } else {
             
            db.findOne({"idProject": idProject }, function (err, projects) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');   
                    response.sendStatus(500); // internal server error
                } else {
                    // var projectsBeforeInsertion = projects.filter((project) => {
                    //     return (project.id.localeCompare(idProject, "en", {'sensitivity': 'base'}) === 0);
                    // });
                    if (projects) {
                        db.update({'idProject':idProject}, updatedProject);
                        console.log("INFO: Modifying project with idProject " + idProject + " with data " + JSON.stringify(updatedProject, 2, null));
                        response.send(updatedProject); // return the updated project
                    } else {
                        console.log("WARNING: There are not any project with idProject " + idProject);
                        response.sendStatus(404); // not found
                    }
                }
            });
        }
    }
});


//DELETE over a collection
app.delete(BASE_API_PATH + "/projects", function (request, response) {
    console.log("INFO: New DELETE request to /projects");
    db.remove({}, function (err, numRemoved) {
        if (err) {
            console.error('WARNING: Error removing data from DB');
            response.sendStatus(500); // internal server error
        } else {
           
            if (numRemoved.result.n > 0) {
                
                console.log("INFO: All the projects (" + numRemoved + ") have been succesfully deleted, sending 204...");
                response.sendStatus(204); // no content
            } else {
                console.log("WARNING: There are no projects to delete");
                response.sendStatus(404); // not found
            }
        }
    });
});


//DELETE over a single resource
app.delete(BASE_API_PATH + "/projects/:idProject", function (request, response) {
    var idProject = request.params.idProject;
    if (!idProject) {
        console.log("WARNING: New DELETE request to /projects/:idProject without name, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New DELETE request to /projects/" + idProject);
        db.remove({'idProject':idProject}, {}, function (err, numRemoved) {
            if (err) {
                console.error('WARNING: Error removing data from DB');
                response.sendStatus(500); // internal server error
            } else {
                console.log("INFO: projects removed: " + numRemoved);
                if (numRemoved.result.n > 0) {
                    console.log("INFO: The project with idProject " + idProject + " has been succesfully deleted, sending 204...");
                    response.sendStatus(204); // no content
                } else {
                    console.log("WARNING: There are no projects to delete");
                    response.sendStatus(404); // not found
                }
            }
        });
    }
});

function generateIdProject(project) {
    //Delete spaces and convert to lowercase and replace strange characters
                        
   
    var titleFormat = project.startDate;
    titleFormat = accents.remove(titleFormat).replace(/ /g,'');
    //Concatenate date
    var titleDate = "ref-"+titleFormat.trim();
                        
    return titleDate;
   
}

function researchersStrToCollection(project) {
    var researchersCollection = [];
                        
        var split = project.researchers.split(",");
        
        for(var i in split){
            researchersCollection.push(split[i]);
        }
    return researchersCollection;
   
} 

function keywordsStrToCollection(project) {
    var keywordsCollection = [];
                        
                        var split = project.keywords.split(",");
                        
                        for(var i in split){
                            keywordsCollection.push(split[i]);
                        }
    return keywordsCollection;
   
} 