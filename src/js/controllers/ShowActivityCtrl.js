angular.module('KanboardCtrl')
        .controller('ShowActivityController', function ($routeParams, $scope, navigation, dataFactory, $sce) {
            $scope.$navigation = navigation;
            $scope.project_id = $routeParams.projectId;

            var api_id = parseInt($routeParams.api_id) + 1;
            $scope.api_id = $routeParams.api_id;
            var project;


            dataFactory.getProjectById(api_id, $routeParams.projectId)
                    .success(function (request) {
                        project = request.result;
                        $scope.project = project;
                    })
                    .error(function (error) {
                        console.log(error);
                    });

            dataFactory.getProjectActivity(api_id, $routeParams.projectId)
                    .success(function (request) {
                        var activities = request.result;

                        for (var i = 0; i < activities.length; i++) {
                            activities[i].event_content = $sce.trustAsHtml(activities[i].event_content);                            
                            activities[i].event_content_removed = $sce.trustAsHtml(String(activities[i].event_content).replace(/<a\b[^>]*>/i,"").replace(/<\/a>/i, ""));
                        }
                        $scope.activities = activities;

                    })
                    .error(function (error) {
                        console.log(error);
                    });

        });