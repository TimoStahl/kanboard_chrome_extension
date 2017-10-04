angular.module('KanboardCtrl')
.controller('ProjectListController', function($scope, navigation, dataFactory) {
  $scope.$navigation = navigation;
  var projectList = this;

  $scope.endpoints = dataFactory.getEndpoints();

  for (var i = 0; i < $scope.endpoints.length; i++) {
    $scope.endpoints[i].id = i;
    var id = i + 1;
    var result;
    dataFactory.getProjects(id).then(
      function(request) {
        result = request.data.result;
        $scope.endpoints[id-1].projects = result;        
      },
      function(error) {
        console.log(error);
      });
  }
});
