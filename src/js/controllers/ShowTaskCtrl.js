 angular.module('KanboardCtrl')
 .controller('ShowTaskController', function($routeParams, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var id = $routeParams.taskId;
    $scope.task;

    dataFactory.getTaskById(api_id, id)
      .success(function(request) {
        $scope.task = request.result;
      })
      .error(function(error) {
        console.log(error);
      });

  });