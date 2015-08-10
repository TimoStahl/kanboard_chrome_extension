angular.module('KanboardCtrl')
.controller('ProjectListController', function($scope, navigation, dataFactory) {
  $scope.$navigation = navigation;
  var projectList = this;

  $scope.endpoints = dataFactory.getEndpoints();

  for (var i = 0; i < $scope.endpoints.length; i++) {
    $scope.endpoints[i].id = i;
    var id = i + 1;
    var result;
    dataFactory.getProjects(id)
      .success(function(request) {
        result = request.result;
        $scope.endpoints[request.id - 1].projects = result;
      })
      .error(function(error) {
        console.log(error);
      });
  }
});