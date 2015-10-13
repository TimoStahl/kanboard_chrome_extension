angular.module('KanboardCtrl')
.controller('SettingsEndpointController', function($routeParams, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    var items;

    if ($routeParams.api_id >= 0) {
      var api_id = parseInt($routeParams.api_id);
      items = dataFactory.getEndpoints();
      $scope.endpoint = items[api_id];
      $scope.edit = true;
    } else {
      $scope.endpoint = new Object();
      $scope.edit = false;
    }

    $scope.save = function() {
      if ($scope.endpoint.id >= 0) {
        items = dataFactory.getEndpoints();
        items[$scope.endpoint.id] = $scope.endpoint;
        dataFactory.setEndpoints(items);
      }
      else {
        items = dataFactory.getEndpoints();
        items.push($scope.endpoint);
        dataFactory.setEndpoints(items);
      }
      navigation.settings();
    };

  });