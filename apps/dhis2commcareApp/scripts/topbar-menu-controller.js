/**
 * Created by harsh on 22/6/15.
 */


dhis2commcareApp.controller('TopBarMenuController',
    function ($rootScope,$scope,goToService) {


        $scope.goTo = function (place) {
           goToService.goTo(place);
        };


    });