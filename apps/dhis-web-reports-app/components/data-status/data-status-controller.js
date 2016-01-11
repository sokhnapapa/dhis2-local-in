/**
 *
 */

reportsApp.controller('DataStatusController',
    function ($rootScope,$scope, $location,reportSettingService,reportsService,
              ReportAppSectionSettingService,periodService,$window,organisationUnitGroupService,
              userService,ReportConfigurationService,DataSetService,$timeout,OrganisationUnitService)
    {

        $scope.REPORT_APP_CONFIGURATION_KEY = "reportApp-configuration-json";
        $scope.ReportAppConfigurationSettings = {};
        $scope.ReportAppConfigurationSettings.parameters=[];

        ReportConfigurationService.getAllReportConfiguration($scope.REPORT_APP_CONFIGURATION_KEY).then(function(conf){
            for (var count in conf.parameters){
                $scope.ReportAppConfigurationSettings.parameters[conf.parameters[count].key] = conf.parameters[count];
            }
        });

        $scope.currentSelection = {
            "orgUnit":"",
            "orgUnitName":"",
            "dataStatusReport":"",
            "includeZero":true,
            "dataSet":"",
            "startPeriodMonth":"",
            "startPeriodYear":"",
            "endPeriodMonth":"",
            "endPeriodYear":""
        };


        var clearAllValues = function(){
            $scope.currentSelection={
                "orgUnit":"",
                "orgUnitName":"",
                "dataStatusReport":"",
                "includeZero":true,
                "dataSet":"",
                "startPeriodMonth":"",
                "startPeriodYear":"",
                "endPeriodMonth":"",
                "endPeriodYear":""
            }
        };


        DataSetService.getAllDataSet().then(function(data){
                $scope.dataSets = data.dataSets;
                $scope.updatePeriods();
            }
        );


        $scope.updatePeriods = function(){
            if(true){
                var currentDate = new Date();
                $scope.monthList = periodService.getMonthList();
                $scope.yearList = periodService.getYearListBetweenTwoYears(1900,currentDate.getFullYear());

            }else{
                $scope.periodList = periodService.getLast12Months();
            }
        };

        $scope.listenToOuChange = function(){
            //clearAllValues();
            $timeout(function() {
                $scope.selectedOrgUnit = selection.getSelected();
                $scope.currentSelection.orgUnit = $scope.selectedOrgUnit;
                OrganisationUnitService.getOrgUnitNameAndLevelByUid( $scope.selectedOrgUnit ).then(function(data){
                        $scope.currentSelection.orgUnitName = data.organisationUnits[0].name;
                        ReportConfigurationService.getAllReportConfiguration().then(function (resultData) {
                            if(resultData != "") {
                                $scope.configurationParameters = resultData;
                                $scope.currentSelection.dataStatusReport = $scope.ReportAppConfigurationSettings.parameters['ds_status_report'].value;
                            }
                        });
                    }
                );

            }, 10);
        };

        selection.setListenerFunction($scope.listenToOuChange);

        $scope.generateDataStatusReport = function(){
            //alert( $scope.currentReport.period.year );
            //alert( $scope.currentReport.section );
            //alert( $scope.currentReport.id );
            //alert( $scope.currentReport.section );

            var date = new Date();
            var currentMonthFirstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var currentMonthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            var selectedStartPeriod = "";
            var lastDayOfSelStartPeriod = "";
            var lastDayOfSelEndPeriod = "";

            //alert( $scope.currentSelection.includeZero);


            var isValidated = "true";
            if( $scope.currentSelection.orgUnitName === "" || $scope.currentSelection.orgUnitName === undefined )
            {
                alert( "Please select organisation unit");
                isValidated = "false";
                return;
            }
            else if( $scope.currentSelection.dataStatusReport === "" || $scope.currentSelection.dataStatusReport === undefined )
            {
                alert( "Please set data set Status Report in Report Configuration page");
                isValidated = "false";
                return;
            }
            else if( $scope.currentSelection.dataSet === "" || $scope.currentSelection.dataSet === undefined )
            {
                alert( "Please select data set");
                isValidated = "false";
                return;
            }
            else if( $scope.currentSelection.startPeriodMonth === "" || $scope.currentSelection.startPeriodMonth === undefined )
            {
                alert( "Please select start period month");
                isValidated = "false";
                return;
            }

            else if( $scope.currentSelection.startPeriodYear === "" || $scope.currentSelection.startPeriodYear === undefined )
            {
                alert( "Please select start period year");
                isValidated = "false";
                return;
            }
            else if( $scope.currentSelection.endPeriodMonth === "" || $scope.currentSelection.endPeriodMonth === undefined )
            {
                alert( "Please select end period month");
                isValidated = "false";
                return;
            }

            else if( $scope.currentSelection.endPeriodYear === "" || $scope.currentSelection.endPeriodYear === undefined )
            {
                alert( "Please select end period year");
                isValidated = "false";
                return;
            }
            if( $scope.currentSelection.startPeriodMonth != undefined && $scope.currentSelection.startPeriodYear != undefined  )
            {
                var selStartYear = $scope.currentSelection.startPeriodYear;
                var selStartMonth = $scope.currentSelection.startPeriodMonth;
                selectedStartPeriod = new Date( selStartYear + "-" + selStartMonth + "-01" );
                lastDayOfSelStartPeriod = new Date(selectedStartPeriod.getFullYear(), selectedStartPeriod.getMonth() + 1, 0);

                if( lastDayOfSelStartPeriod > currentMonthLastDay )
                {
                    alert( "You can not select future period for start period");
                    isValidated = "false";
                    return;
                }
            }
            if( $scope.currentSelection.endPeriodMonth != undefined && $scope.currentSelection.endPeriodYear != undefined  )
            {
                var selEndYear = $scope.currentSelection.endPeriodYear;
                var selEndMonth = $scope.currentSelection.endPeriodMonth;
                var selectedEndPeriod = new Date( selEndYear + "-" + selEndMonth + "-01" );
                lastDayOfSelEndPeriod = new Date(selectedEndPeriod.getFullYear(), selectedEndPeriod.getMonth() + 1, 0);

                if( lastDayOfSelEndPeriod > currentMonthLastDay )
                {
                    alert( "You can not select future period for end period");
                    isValidated = "false";
                    return;
                }
            }

            if( $scope.currentSelection.startPeriodMonth != undefined && $scope.currentSelection.startPeriodYear != undefined
                    && $scope.currentSelection.endPeriodMonth != undefined && $scope.currentSelection.endPeriodYear != undefined )
            {
                var selStartYear = $scope.currentSelection.startPeriodYear;
                var selStartMonth = $scope.currentSelection.startPeriodMonth;
                var selectedStartPeriod = new Date( selStartYear + "-" + selStartMonth + "-01" );

                var selEndYear = $scope.currentSelection.endPeriodYear;
                var selEndMonth = $scope.currentSelection.endPeriodMonth;
                var selectedEndPeriod = new Date( selEndYear + "-" + selEndMonth + "-01" );

                if( selectedStartPeriod > selectedEndPeriod )
                {
                    alert( "Start period should not be greater then end period");
                    isValidated = "false";
                    return;
                }
            }

            /*
            else if( $scope.currentReport.id != undefined )
            {
                var date = new Date();
                var currentMonthFirstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                var currentMonthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);


                if( $scope.reportSettingMapping[$scope.currentReport.id].periodType =='monthly')
                {

                    if( $scope.currentReport.period.month === "" || $scope.currentReport.period.month === undefined )
                    {
                        alert( "Please select month");
                        isValidated = "false";
                        return;
                    }
                    else if( $scope.currentReport.period.year === "" || $scope.currentReport.period.year === undefined )
                    {
                        alert( "Please select year");
                        isValidated = "false";
                        return;
                    }

                    else if( $scope.currentReport.period.month != undefined && $scope.currentReport.period.year != undefined  )
                    {
                        var selYear = $scope.currentReport.period.year;
                        var selMonth = $scope.currentReport.period.month;
                        var selectedPeriod = new Date( selYear + "-" + selMonth + "-01" );
                        var lastDayOfSelPeriod = new Date(selectedPeriod.getFullYear(), selectedPeriod.getMonth() + 1, 0);



                        if( lastDayOfSelPeriod > currentMonthLastDay )
                        {
                            alert( "You can not select future period");
                            isValidated = "false";
                            return;
                        }
                    }
                }
                else if( $scope.reportSettingMapping[$scope.currentReport.id].periodType =='start-end' )
                {
                    var selStartDate = new Date( $scope.currentReport.startDate );
                    var selEndDate = new Date( $scope.currentReport.endDate );
                    var startDateYear = $scope.currentReport.startDate.split("-")[0];
                    var endDateYear = $scope.currentReport.endDate.split("-")[0];

                    var diffInYear = endDateYear - startDateYear;

                    if( $scope.currentReport.startDate === "" || $scope.currentReport.startDate === undefined )
                    {
                        alert( "Please select start date");
                        isValidated = "false";
                        return;
                    }
                    else if( $scope.currentReport.endDate === "" || $scope.currentReport.endDate === undefined )
                    {
                        alert( "Please select end date");
                        isValidated = "false";
                        return;
                    }

                    else if( selStartDate > selEndDate )
                    {
                        alert( "Start date should not be greater then end date");
                        isValidated = "false";
                        return;
                    }
                    else if( diffInYear > 5 )
                    {
                        alert( "Date difference should not greater then 5 year");
                        isValidated = "false";
                        return;
                    }
                }

            }
            */
            /*
            else
            {
                //alert(isValidated);
                var selOrgUnit = selection.getSelected();
                var selDataSetUid = $scope.currentSelection.dataSet;
                var selStartPeriod = $scope.currentSelection.startPeriodYear + "" + $scope.currentSelection.startPeriodMonth;
                var selEndPeriod = $scope.currentSelection.endPeriodYear + "" + $scope.currentSelection.endPeriodMonth;

                alert("selOrgUnit - " + selOrgUnit + "- selDataSetUid - " + selDataSetUid + " - selStartPeriod - " + selStartPeriod + " - selEndPeriod - " + selEndPeriod );

                //$window.location.href = "../dhis-web-reporting/generateHtmlReport.action?uid="+$scope.currentReport.id+"&pe="+$scope.currentReport.period.year+""+$scope.currentReport.period.month+"&ou="+ selection.getSelected()+"&sd="+$scope.currentReport.startDate+"&ed="+$scope.currentReport.endDate;
            }
            */

            if( isValidated === "true")
            {
                //alert(isValidated);
                var selOrgUnit = selection.getSelected();
                var selDataSetUid = $scope.currentSelection.dataSet;
                var selStartPeriod = $scope.currentSelection.startPeriodYear + "" + $scope.currentSelection.startPeriodMonth;
                var selEndPeriod = $scope.currentSelection.endPeriodYear + "" + $scope.currentSelection.endPeriodMonth;
                var reportUid = $scope.currentSelection.dataStatusReport;
                var includeZero = $scope.currentSelection.includeZero;
                OrganisationUnitService.getOrganisationUnitLevelLength().then(function(data){
                        $scope.level = data.organisationUnitLevels.length;
                        //console.log( "Level Length is -- " + $scope.level);
                    }
                );

                DataSetService.getDataSetPeriodTypeAndSource( selDataSetUid ).then(function(data){
                        $scope.dataSetPeriodType = data.dataSets[0].periodType;
                        $scope.dataSetSource = data.dataSets[0].organisationUnits;

                        //console.log( "dataSetPeriodType is -- " + $scope.dataSetPeriodType );
                        //console.log( "dataSetSource length  is -- " + $scope.dataSetSource.length );

                        sessionStorage.setItem('selOrgUnit',selOrgUnit);
                        sessionStorage.setItem('selDataSetUid',selDataSetUid);
                        sessionStorage.setItem('dataSetPeriodType',$scope.dataSetPeriodType);
                        sessionStorage.setItem('dataSetSource',$scope.dataSetSource);
                        sessionStorage.setItem('selStartPeriod',selStartPeriod);
                        sessionStorage.setItem('selEndPeriod',selEndPeriod);
                        sessionStorage.setItem('selectedStartPeriod',selectedStartPeriod);
                        sessionStorage.setItem('lastDayOfSelStartPeriod',lastDayOfSelStartPeriod);
                        sessionStorage.setItem('lastDayOfSelEndPeriod',lastDayOfSelEndPeriod);

                        //alert("selOrgUnit - " + selOrgUnit + "- selDataSetUid - " + selDataSetUid + " - selStartPeriod - " + selStartPeriod + " - selEndPeriod - " + selEndPeriod );

                        //window.location.href = '../dhis-web-reports-app/index.html#/data-status-result';
                        //alert( "Report Uid - " + reportUid );

                        $window.location.href = "../dhis-web-reporting/generateHtmlReport.action?uid="+reportUid+"&orgUnitUID="+selOrgUnit+"&dataSetUID="+selDataSetUid+"&dataSetPeriodType="+$scope.dataSetPeriodType
                        +"&startDate="+selStartPeriod+"&endDate="+selEndPeriod+"&includeZero="+includeZero ;


                        /*
                        $window.location.href = "../dhis-web-reporting/generateHtmlReport.action?uid=DUZxcstfQNm&orgUnitUID="+selOrgUnit+"&dataSetUID="+selDataSetUid+"&dataSetPeriodType="+$scope.dataSetPeriodType
                        +"&startDate="+selStartPeriod+"&endDate="+selEndPeriod ;
                        */

                    }
                );


                //$window.location.href = "../dhis-web-reporting/generateHtmlReport.action?uid="+$scope.currentReport.id+"&pe="+$scope.currentReport.period.year+""+$scope.currentReport.period.month+"&ou="+ selection.getSelected()+"&sd="+$scope.currentReport.startDate+"&ed="+$scope.currentReport.endDate;
            }


        }


    });
