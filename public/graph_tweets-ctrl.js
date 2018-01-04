angular.module("ProjectManagerApp")
   .controller("GraphTweetsCtrl", ["$scope", "$http", function($scope, $http) {
    

        function refresh(){
            $http
                .get("/api/v1/tweets")
                .then(function(response) {
                    $scope.tweets = response.data;
                    var statisticTweets = [];
                    var arrayTweetsKey = [];
                     for(var i in $scope.tweets) {
                        statisticTweets.push($scope.tweets[i].statistic);
                        
                        var tweetsKey = $scope.tweets[i].key;
                        arrayTweetsKey.push(tweetsKey);
                       
                }
                    Highcharts.chart('container', {
                        chart: {
                            type: 'area',
                            spacingBottom: 30
                        },
                        title: {
                            text: 'Statistics By Tweets'
                        },
                    
                        legend: {
                            layout: 'vertical',
                            align: 'left',
                            verticalAlign: 'top',
                            x: 150,
                            y: 100,
                            floating: true,
                            borderWidth: 1,
                            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                        },
                        xAxis: {
                            categories: arrayTweetsKey
                        },
                        yAxis: {
                            title: {
                                text: 'Statistic of Tweets'
                            },
                            labels: {
                                formatter: function () {
                                    return this.value;
                                }
                            }
                        },
                        tooltip: {
                            formatter: function () {
                                return '<b>' + this.series.name + '</b><br/>' +
                                    this.x + ': ' + this.y;
                            }
                        },
                        plotOptions: {
                            area: {
                                fillOpacity: 0.5
                            }
                        },
                        credits: {
                            enabled: false
                        },
                        series: [{
                            name: 'Statistic Tweets',
                            data: statisticTweets
                        }]
                    });
                });
          
        }
    
     

        refresh();
        
        

}]);