(function(){

  "use strict";

  angular.module('app.user')

    // display my account informations
    .controller('meCtrl',
      ['$scope', '$ionicPopup', 'authentication', 'user', '$state',
       function($scope, $ionicPopup, authentication, user, $state) {

         // get current user datas from local storage.
         var authDatas = authentication.isAuthenticated();

         // get full user object from server.
         user.get({id: authDatas.id}).$promise.then(function(me){
           $scope.me = me;
         });

         $scope.signOut = function(redirection) {
           authentication.signOut()

             .success(_.bind(function(data, status, headers, config) {
               // redirect to app.onboard.home
               $state.go(redirection);
             }, $state))

             .error(function(data, status, headers, config) {
               alert(status);
             });

         };

       }])

    .controller('meFormCtrl', ['$scope', 'authentication', 'user', '$state', function($scope, authentication, user, $state) {

      // get current user datas from local storage.
      var authDatas = authentication.isAuthenticated();

      // get full user object from server.
      $scope.user = user.get({id: authDatas.id});

      $scope.updateUser = function(updatedUser) {
        user.save(updatedUser);
      };

      $scope.cancelEdition = function() {
        $state.go('app.main.me');
      }

    }])

    // create a new user from signUp form
    .controller('signUpCtrl', ['$scope', 'user', '$state', function($scope, userService, $state) {

      $scope.user = {
        email : '',
        password: ''
      };

      $scope.createUser = function(user) {

        userService.save(user).$promise.then(

          // success callback
          function(){
            //alert('user successfully created, you can signIn');
            $state.go('app.onboard.signin');
          },

          // error callback
          function(response){
            if (typeof response.data.error.message != 'undefined') {
              alert("User not created : " + response.data.error.message);
            }
            else {
              alert("An error was encountered but no message error found.")
            }
          }
        );

      };

    }])

    // list all existing users
    .controller('usersListCtrl', ['$scope', '$ionicPopup', 'user', function($scope, $ionicPopup, user) {

      // query the server
      user.query().$promise
        .then(function(users) {
          $scope.users = users;
        })
        .catch(function(response){
          $ionicPopup.alert({
            title: 'Server error',
            template: 'Fail to get users lists from server'
          });
        }
      );


      // refresh user list when dragging down
      $scope.doRefresh = function() {

        user.query().$promise
          .then(function(users) {
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
          })
          .catch(function(users) {
            $ionicPopup.alert({
              title: 'Server error',
              template: 'Fail to get users lists from server'
            });
          })
          .finally(function(){
            $scope.$broadcast('scroll.refreshComplete');
          });

      };
    }])

    // see detail for a specific user.
    .controller('userDetailCtrl', ['$scope', '$stateParams', 'user', function($scope, $stateParams, user) {
      $scope.user = user.get({ id: $stateParams.userId });
    }]);

})();

