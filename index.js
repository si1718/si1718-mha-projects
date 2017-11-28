"use strict";
/* global __dirname */

var express = require("express");
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
var db;
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.json()); //use default json enconding/decoding
app.use(helmet()); //improve security

MongoClient.connect(mdbURL,{native_parser:true},(err,database) =>{

    if(err){
        console.log("CAN NOT CONNECT TO DB: "+err);
        process.exit(1);
    }
    
    db = database.collection("projects");
    

    app.listen(port, () => {
        console.log("Magic is happening on port " + port);    
    });

});






// GET a collection
app.get(BASE_API_PATH + "/projects", function (request, response) {
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

/*Get url params*/
app.get(BASE_API_PATH + "/projects/search", function (request, response) {
    
    let req_researcher = request.query.researcher;
    let req_name = request.query.name;
    let req_type = request.query.type;
    let req_startDate = request.query.startDate;
    let req_endDate = request.query.endDate;
    let req_researchers = request.query.researchers;
   
    // let req_web = request.query.web;
    var db_query = {"$and": []};

    if(req_researcher){
        db_query.$and.push({"researcher" : {$regex : ".*"+req_researcher+".*"}});
    }
    if(req_name){
        db_query.$and.push({"name" : {$regex : ".*"+req_name+".*"}});
    }
    if(req_type){
        db_query.$and.push({"type" : {$regex : ".*"+req_type+".*"}});
    }
    if(req_startDate){
        db_query.$and.push({"startDate" : {$regex : ".*"+req_startDate+".*"}});
    }
    if(req_endDate){
        db_query.$and.push({"endDate" : {$regex : ".*"+req_endDate+".*"}});
    }
    if(req_researchers){
        db_query.$and.push({"researchers": {$elemMatch: {"researchers": {$regex: ".*"+req_researchers+".*"}}}});
        //db_query.$and.push({"researchers": {$elemMatch: {".*": {$regex: ".*"+req_researcher+".*"}}}});
    }

console.log(db_query);
    /*else{
        db_query = {"researcher" : [{$regex : ".*"+req_researcher+".*"}]};
        db_query =  {"researchers": {$elemMatch: {"school": {$regex: ".*"+req_school+".*"}}}}
    }*/

    db.find(db_query).toArray( function (err, projects) {
        
        if (err) {
            response.sendStatus(500); // internal server error
        } else {
            response.send(projects);
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
                        
    /*
    var patentJson = JSON.stringify(newPatent, 2, null);
    var objectValue = JSON.parse(patentJson);
    var titleStr = objectValue['title'];
    */
    var titleFormat = project.startDate;
    titleFormat = accents.remove(titleFormat).replace(/ /g,'');
    //Concatenate date
    var titleDate = "ref-"+titleFormat.trim();
                        
    return titleDate;
   
}