angular.module("ProjectManagerApp")
    .controller("EditCtrl", ["$scope", "$http", "$routeParams", "$location",
        function($scope, $http, $routeParams, $location) {
            var researcher;
            
            $scope.projectId = $routeParams.idProject;
            console.log("EditCtrl initialized for project "+$scope.projectId);
            $http
                .get("/api/v1/projects/"+$scope.projectId)
                .then(function(response) {
                    $scope.updatedProject = response.data;
                    
                    console.log("longitud:"+$scope.updatedProject.researcher);
                if($scope.updatedProject.researcher.length>0){
                    researcher = String($scope.updatedProject.researcher);
                }else{
                    
                    researcher = String($scope.updatedProject.researcherName);
                
                }
                
                if(researcher.includes("https://") == true){
                    $scope.muestraValida = false;
                    researcher = $scope.updatedProject.researcherName;
                }else{
                    $scope.muestraValida = true; 
                }
                
                    
                $http
                .get("https://si1718-dfr-researchers.herokuapp.com/api/v1/researchers?search="+researcher)
                .then(function(response) {
                    $scope.researchers = response.data;
                     if($scope.researchers.length>0){
                    $scope.researcher = $scope.researchers[0]; 
                    $scope.researcherName =  $scope.researchers[0].name;
                }
                    
                });
                  
                    
                });
               
               
                

                
            
            $scope.updateProject = function (){
              
              delete $scope.updatedProject._id;
              
            //Pasamos los strings a colecciones tanto de researchers como de keywords
             
            var researchersCollection = researchersStrToCollection($scope.updatedProject);
                        
            $scope.updatedProject.researchers = researchersCollection;
            
                     
            var keywordsCollection = keywordsStrToCollection($scope.updatedProject);
                        
            $scope.updatedProject.keywords = keywordsCollection;
            
              $http
                .put("/api/v1/projects/"+$scope.projectId,$scope.updatedProject)
                .then(function(response) {
                    console.log("updated");
                    $location.path("/");
                }, function(error){
                    
                    if(String(error.status) != '200'){
                        switch (String(error.status)) {
                            case '422':
                                $scope.error = "Please review the information entered in the fields";
                                break;
                            default:
                                $scope.error = "Error, please contact administrator";
                        }
                    
                    }  
                    //alert(error.data);
                });
            
            }
            
            $scope.validateProject = function (){
              
              delete $scope.updatedProject._id;
             
              if($scope.researchers.length>0){
                    $scope.updatedProject.researcherName = $scope.researcher.name;
                    $scope.updatedProject.researcher = 'https://si1718-dfr-researchers.herokuapp.com/api/v1/researchers/'+ $scope.researchers[0].idResearcher;
                }
                
                //Pasamos los strings a colecciones tanto de researchers como de keywords
             
            var researchersCollection = researchersStrToCollection($scope.updatedProject);
                        
            $scope.updatedProject.researchers = researchersCollection;
            
                     
            var keywordsCollection = keywordsStrToCollection($scope.updatedProject);
                        
            $scope.updatedProject.keywords = keywordsCollection;

              $http
                .put("/api/v1/projects/"+$scope.projectId,$scope.updatedProject)
                .then(function(response) {
                    console.log("updated");
                    // $location.path("/");
                    $location.path("/");
                }, function(error){
                    
                    if(String(error.status) != '200'){
                        switch (String(error.status)) {
                            case '422':
                                $scope.error = "Please review the information entered in the fields";
                                break;
                            default:
                                $scope.error = "Error, please contact administrator";
                        }
                    
                    }  
                    //alert(error.data);
                });
            
            }
            
        
        
        $scope.changeProject = function (){
              delete $scope.updatedProject._id;
            $scope.updatedProject.researcher = "";
            $http
                .put("/api/v1/projects/"+$scope.projectId,$scope.updatedProject)
                .then(function(response) {
                    console.log("updated");
                    // $location.path("/project/"+$scope.projectId);
                    $location.path("/");
                }, function(error){
                    
                 if(String(error.status) != '200'){
                    switch (String(error.status)) {
                        case '422':
                            $scope.error = "Please review the information entered in the fields";
                            break;
                        default:
                            $scope.error = "Error, please contact administrator";
                    }
                    
                }  
                    //alert(error.data);
                });
                    
                
            
            }
            
        
        }]);
       
function researchersStrToCollection(project) {
    
    
      
    if(!Array.isArray(project.researchers)){
    var researchersCollection = [];
       var split = project.researchers.split(",");
                        
    for(var i in split){
        researchersCollection.push(split[i]);
    }
    return researchersCollection;
    }else{
       return project.researchers; 
    }                  
    
    
    
   
} 
function keywordsStrToCollection(project) {
    
    if(!Array.isArray(project.keywords)){
    var keywordsCollection = [];
       var split = project.keywords.split(",");
                        
    for(var i in split){
        keywordsCollection.push(split[i]);
    }
    return keywordsCollection;
    }else{
       return project.keywords; 
    }                  
    
   
} 