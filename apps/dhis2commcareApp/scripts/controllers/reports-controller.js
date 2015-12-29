/**
 * Created by hisp on 19/10/15.
 */
dhis2commcareAppControllers
    .controller('ReportsController', function($rootScope,$scope,$timeout,utilityService){

    $scope.goToReportsApp = function(currentInstance){
        window.location.href = "../../apps/"+currentInstance.domain+"-reports/outputs.html?rootOu="+currentInstance.dhisSettings.rootOuUid;
    }

    // Fetch instance configuration from systemSetting,
        utilityService.getInstancesWithAuthorityMap().then(function(instancesAndAuthorityMap){
            $timeout(function(){
                $scope.configurationInstances = instancesAndAuthorityMap.configurationInstances;
                $scope.currentUserInstanceAuthorityMap = instancesAndAuthorityMap.currentUserInstanceAuthorityMap;
            })
        })


    })