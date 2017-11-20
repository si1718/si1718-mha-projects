"use strict";
/* global __dirname */

var express = require("express");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var path = require('path');
var  mdb = require('mongodb');
var  MongoClient = require('mongodb').MongoClient;

var mdbURL = "mongodb://manuel:manuel@ds255455.mlab.com:55455/si1718-mha-projects";

var port = (process.env.PORT || 10000);
var BASE_API_PATH = "/api/v1/projects";

var db;


MongoClient.connect(mdbURL,{native_parser:true},function (err,database){

    if(err){
        console.log("CAN NOT CONNECT TO DB: "+err);
        process.exit(1);
    }
    
    db = database.collection("projects");
    

    app.listen(port, () => {
        console.log("Magic is happening on port " + port);    
    });

});

var app = express();

app.use(bodyParser.json()); //use default json enconding/decoding
app.use(helmet()); //improve security


// GET a collection
app.get(BASE_API_PATH + "/get", function (request, response) {
    console.log("INFO: New GET request to /projects");
    db.find({}).toArray( function (err, projects) {
        if (err) {
            console.error('WARNING: Error getting data from DB');
            response.sendStatus(500); // internal server error
        } else {
            console.log("INFO: Sending projects: " + JSON.stringify(projects, 2, null));
            response.send(projects);
        }
    });
});


// GET a single resource
app.get(BASE_API_PATH + "/get/:id", function (request, response) {
    var id = request.params.id;
    if (!id) {
        console.log("WARNING: New GET request to /projects/get/:id without id, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New GET request to /projects/get/" + id);
        db.findOne({'_id': mdb.ObjectID(id)}, function (err, filteredProject) {
            
            if (err) {
                console.error('WARNING: Error getting data from DB');
                response.sendStatus(500); // internal server error
            } else {
               
                if (filteredProject) {
                    var project = filteredProject; //since we expect to have exactly ONE project with this id
                    console.log("INFO: Sending project: " + JSON.stringify(project, 2, null));
                    response.send(project);
                } else {
                    console.log("WARNING: There are not any project with id " + id);
                    response.sendStatus(404); // not found
                }
            }
        });
    }
});


//POST over a collection
app.post(BASE_API_PATH + "/post", function (request, response) {
    var newProject = request.body;
    if (!newProject) {
        console.log("WARNING: New POST request to /projects/ without project, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New POST request to /projects with body: " + JSON.stringify(newProject, 2, null));
        if (!newProject.idProject || !newProject.reference || !newProject.researcher || !newProject.name || !newProject.type) {
            console.log("WARNING: The project " + JSON.stringify(newProject, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // unprocessable entity
        } else {
            db.find({}, function (err, projects) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                    var projectsBeforeInsertion = projects.filter((project) => {
                        return (project.id.localeCompare(newProject.id, "en", {'sensitivity': 'base'}) === 0);
                    });
                    if (projectsBeforeInsertion.length > 0) {
                        console.log("WARNING: The project " + JSON.stringify(newProject, 2, null) + " already extis, sending 409...");
                        response.sendStatus(409); // conflict
                    } else {
                        console.log("INFO: Adding project " + JSON.stringify(newProject, 2, null));
                        db.insert(newProject);
                        response.sendStatus(201); // created
                    }
                }
            });
        }
    }
});


//POST over a single resource
app.post(BASE_API_PATH + "/post/:id", function (request, response) {
    var id = request.params.id;
    console.log("WARNING: New POST request to /projects/" + id + ", sending 405...");
    response.sendStatus(405); // method not allowed
});


//PUT over a collection
app.put(BASE_API_PATH + "/put", function (request, response) {
    console.log("WARNING: New PUT request to /projects, sending 405...");
    response.sendStatus(405); // method not allowed
});


//PUT over a single resource
app.put(BASE_API_PATH + "/put/:id", function (request, response) {
    var updatedProject = request.body;
    var id = request.params.id;
    
    if (!updatedProject) {
        console.log("WARNING: New PUT request to /projects/ without project, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New PUT request to /projects/" + id + " with data " + JSON.stringify(updatedProject, 2, null));
        if (!updatedProject.idProject || !updatedProject.reference || !updatedProject.researcher || !updatedProject.name || !updatedProject.type){
            console.log("WARNING: The project " + JSON.stringify(updatedProject, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // unprocessable entity
        } else {
            db.find({}, function (err, projects) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                    var projectsBeforeInsertion = projects.filter((project) => {
                        return (project.id.localeCompare(id, "en", {'sensitivity': 'base'}) === 0);
                    });
                    if (projectsBeforeInsertion) {
                        db.update({'_id': mdb.ObjectID(id)}, updatedProject);
                        console.log("INFO: Modifying project with id " + id + " with data " + JSON.stringify(updatedProject, 2, null));
                        response.send(updatedProject); // return the updated project
                    } else {
                        console.log("WARNING: There are not any project with id " + id);
                        response.sendStatus(404); // not found
                    }
                }
            });
        }
    }
});


//DELETE over a collection
app.delete(BASE_API_PATH + "/delete", function (request, response) {
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
app.delete(BASE_API_PATH + "/delete/:id", function (request, response) {
    var id = request.params.id;
    if (!id) {
        console.log("WARNING: New DELETE request to /projects/:id without name, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New DELETE request to /projects/" + id);
        db.remove({'_id': mdb.ObjectID(id)}, {}, function (err, numRemoved) {
            if (err) {
                console.error('WARNING: Error removing data from DB');
                response.sendStatus(500); // internal server error
            } else {
                console.log("INFO: projects removed: " + numRemoved);
                if (numRemoved.result.n > 0) {
                    console.log("INFO: The project with id " + id + " has been succesfully deleted, sending 204...");
                    response.sendStatus(204); // no content
                } else {
                    console.log("WARNING: There are no projects to delete");
                    response.sendStatus(404); // not found
                }
            }
        });
    }
});
