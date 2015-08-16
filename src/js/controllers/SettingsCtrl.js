angular.module('KanboardCtrl')
.controller('SettingsController', function($scope, navigation, dataFactory, $mdDialog, $mdToast) {
    $scope.$navigation = navigation;

    var items = dataFactory.getEndpoints();
    $scope.endpoints = items;
    
    var settings = dataFactory.getSettings();
    $scope.settings = settings;
    
    $scope.saveSettings = function(){
      dataFactory.setSettings($scope.settings);
    };

    $scope.showDeleteConfirm = function(ev, endpoint) {
      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Would you like to delete your endpoint?')
        .content('Name: ' + endpoint.name)
        .ariaLabel('Delete')
        .ok('Yes')
        .cancel('No')
        .targetEvent(ev);

      $mdDialog.show(confirm).then(function() {

        //delete from storage
        var items_new = new Array();
        for (var i = 0; i < items.length; i++) {
          if (i == endpoint.id) {
            //nothing
          }
          else {
            items_new.push(items[i]);
          }
        }
        dataFactory.setEndpoints(items_new);

        //refresh list
        $scope.endpoints = dataFactory.getEndpoints();

        $mdToast.show(
          $mdToast.simple()
          .content('Deleted!')
          .hideDelay(3000)
        );
      }, function() {
        //$scope.alert = 'Nothing changed.';
      });
    };

  });