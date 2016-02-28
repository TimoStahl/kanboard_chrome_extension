angular.module('KanboardCtrl')
  .controller('SettingsEndpointController', function($routeParams, $scope, navigation, dataFactory, $base64, $mdToast) {
    $scope.$navigation = navigation;
    var items;

    if ($routeParams.api_id >= 0) {
      var api_id = parseInt($routeParams.api_id);
      items = dataFactory.getEndpoints();
      $scope.endpoint = items[api_id];
      $scope.edit = true;
    }
    else {
      $scope.endpoint = new Object();
      $scope.edit = false;
    }

    $scope.save = function() {
      //console.log($scope.endpoint.token);
      if (typeof $scope.endpoint.token != 'undefined' && typeof $scope.endpoint.user != 'undefined') {
        $scope.endpoint.auth = $base64.encode($scope.endpoint.user + ':' + $scope.endpoint.token);
        delete($scope.endpoint.token);
      }

      if ($scope.endpoint.id >= 0) {
        items = dataFactory.getEndpoints();
        items[$scope.endpoint.id] = $scope.endpoint;
        dataFactory.setEndpoints(items);
        navigation.settings();
      }
      else {
        if (typeof $scope.endpoint.auth == 'undefined') {
          $mdToast.show(
            $mdToast.simple()
            .content('Please enter user and password!')
            .hideDelay(3000)
          );
        }
        else {
          items = dataFactory.getEndpoints();
          items.push($scope.endpoint);
          dataFactory.setEndpoints(items);
          navigation.settings();
        }
      }

    };

  });