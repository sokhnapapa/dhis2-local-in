/* CCEI Model Controller */


trackerCapture.controller('ModelController',
    function($rootScope,
             $scope,
             TEIService,
             CCEIProgram,
             $timeout
        ) {

    var listenToBroadcast  = function(){

    if ($scope.selectedTei) {
        angular.forEach($scope.selectedTei.attributes,function(attr){
            if (attr.valueType == "TRACKER_ASSOCIATE"){
                CCEIProgram.getByUid(attr.value).then(function(tei){
                    $timeout(function(){
                        $scope.modelTei =tei;
                    });

                });
            }
        });
    }
}
        $scope.$on('dashboardWidgets', function () {
            listenToBroadcast();
        });

        $scope.$on('modelWidget', function() {
            listenToBroadcast();
        });
    });
