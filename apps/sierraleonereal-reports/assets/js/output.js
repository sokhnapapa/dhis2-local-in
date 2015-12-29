/**
 * Created by Janaka on 2/25/2015.
 */

var facilityLevel='';
var facilityType='';
var dhisBaseURL = new String();
var homeURL = new String();
$(document).ready(function () {

    $.ajaxSetup({
        async: false
    });

    var loadForm = function(){

        selectedReportType = $('#reportSelect option:selected').val();

        console.log('Selected report type: '+selectedReportType);

        if(selectedReportType === 'districtScoreCard')
        {
            $('#districtReport').show();
            $('#facilityReport').hide();
            $('#bulkReportScoreCardReport').hide();
        }
        else if(selectedReportType === 'facilityScoreCard')
        {
            $('#districtReport').hide();
            $('#facilityReport').show();
            $('#bulkReportScoreCardReport').hide();
        }

        else if(selectedReportType === 'bulkScoreCard')
        {
            $('#districtReport').hide();
            $('#facilityReport').hide();
            $('#bulkReportScoreCardReport').show();
        }
        else
        {
            $('#districtReport').hide();
            $('#facilityReport').hide();
            $('#bulkReportScoreCardReport').hide();
        }
    };

    $('#reportSelect').selectpicker('refresh');

    loadForm();

    //-------------Bulk ScoreCard Parameters------------//

    $('#bulkReportDistrictSelect').selectpicker('refresh');

    $('#bulkStartQuarterSelect').selectpicker('refresh');
    $('#bulkStartYearPicker').datetimepicker({
        pickTime: false,
        format: "YYYY",
        viewMode: "years",
        minViewMode: "years",
        defaultDate: new Date()
    });

    $('#bulkEndQuarterSelect').selectpicker('refresh');
    $('#bulkEndYearPicker').datetimepicker({
        pickTime: false,
        format: "YYYY",
        viewMode: "years",
        minViewMode: "years",
        defaultDate: new Date()
    });

    //-------------Facility ScoreCard Parameters------------//

    $('#facilityCouncilSelect').selectpicker('refresh');
    $('#facilitySelect').selectpicker('refresh');
    $('#startQuarterSelect').selectpicker('refresh');
    $('#startYearPicker').datetimepicker({
        pickTime: false,
        format: "YYYY",
        viewMode: "years",
        minViewMode: "years",
        defaultDate: new Date()
    });

    $('#endQuarterSelect').selectpicker('refresh');
    $('#endYearPicker').datetimepicker({
        pickTime: false,
        format: "YYYY",
        viewMode: "years",
        minViewMode: "years",
        defaultDate: new Date()
    });

    //-------------District ScoreCard Parameters------------//

    $('#councilSelect').selectpicker('refresh');
    $('#yearPicker').datetimepicker({
        pickTime: false,
        format: "YYYY",
        viewMode: "years",
        minViewMode: "years",
        defaultDate: new Date()
    });
    $('#quarterSelect').selectpicker('refresh');




    jQuery.getJSON("manifest.webapp", function (json) {
        console.log(json.toString());
        dhisBaseURL = json.activities.dhis.href + "/api";
        homeURL = json.activities.dhis.href;
        console.log(json.activities.dhis.href + "/api");
    });

    $.ajaxSetup({
        async: true
    });
    ;

    $('#reportSelect').change(function(){
        loadForm();
    });


    $.ajax({
        url: dhisBaseURL+"/organisationUnits/B0AFbiJFgtT.json?paging=false&includeDescendants=true&fields=id,name,level",
        data: {
            format: "json"
        },
        success: function (response) {
            /** @namespace response.organisationUnits */
            for (var item in response.organisationUnits) {
                        /** @namespace response2.level */
                            var response2 = response.organisationUnits[item];
                        var lvl=response2.level;

                        if(lvl=='3'){
                            $('#facilityCouncilSelect').append('<option id=\'' + response2.id + '\' value=\'' + response2.id + '\'>' + response2.name + '</option>');
                            $('#councilSelect').append('<option id=\'' + response2.id + '\' value=\'' + response2.id + '\'>' + response2.name + '</option>');
                            $('#bulkReportDistrictSelect').append('<option id=\'' + response2.id + '\' value=\'' + response2.id + '\'>' + response2.name + '</option>');
                        }
                        $('#facilityCouncilSelect').selectpicker('refresh');
                        $('#councilSelect').selectpicker('refresh');
                        $('#bulkReportDistrictSelect').selectpicker('refresh');

            }
        }
    });

    $('#facilityCouncilSelect').change(function () {
        document.getElementById('msgs').innerHTML='';
        var selectedCouncil=document.getElementById('facilityCouncilSelect').value;
        var y = document.getElementById("facilitySelect");
        var x = document.getElementById("facilitySelect").length;
        for(var i=0;i<x;i++){
            y.remove(y);
        }
        $('#facilitySelect').append('<option value="">Select Facility</option>');

        if(selectedCouncil!=''){
            $.ajax({
                url: dhisBaseURL+"/organisationUnits/"+selectedCouncil+".jsonp?paging=false",
                dataType: "jsonp",
                data: {
                    format: "json"
                },
                success: function (response2) {
                    for(var i=0;i<response2.children.length;i++) {
                        console.log(response2.children[i].id);
                        $('#facilitySelect').append('<option id=\'' + response2.children[i].id + '\' value=\'' + response2.children[i].id + '\'>' + response2.children[i].name + '</option>');
                    }
                    $('#facilitySelect').selectpicker('refresh');
                }
            });
        }
        else{
            $('#facilitySelect').selectpicker('refresh');

        }
    });




    $('#genDistrictButton').click(function(){
        var reportSelect = $('#reportSelect option:selected').text();
        var selectedDistrictUID = $('#councilSelect option:selected').val();
        var selectedDistrictName = $('#councilSelect option:selected').text();
        var scorecardPeriod = moment($('#year').val()).format('YYYY');
        var selectedQuarter= $('#quarterSelect option:selected').val();
        var date= $('#quarterSelect option:selected').text();

        sessionStorage.setItem('scorecardPeriod',scorecardPeriod+"Q"+selectedQuarter);
        sessionStorage.setItem('selectedDistrictUID',selectedDistrictUID);
        sessionStorage.setItem('selectedDistrictName',selectedDistrictName);
        sessionStorage.setItem('date',date);
        sessionStorage.setItem('year',scorecardPeriod);

        sessionStorage.setItem('homeURL2',homeURL);

        window.location.href ="scorecard.html";

    });

    // Facility Report
    $('#genFacilityButton').click(function(){
        var reportType = $('#reportSelect option:selected').text();
        var selectedDistrictUID = $('#facilityCouncilSelect option:selected').val();

        var selectedDistrictName = $('#facilityCouncilSelect option:selected').text();

        var selectedFacilityUID = $('#facilitySelect option:selected').val();
        var selectedFacilityName = $('#facilitySelect option:selected').text();

        var startPeriodYear = moment($('#startYear').val()).format('YYYY');
        var endPeriodYear = moment($('#endYear').val()).format('YYYY');

        var startPeriodQuater = $('#startQuarterSelect option:selected').val();
		var startPeriodQuaterName = $('#startQuarterSelect option:selected').text();
        var endPeriodQuater = $('#endQuarterSelect option:selected').val();
		var endPeriodQuaterName = $('#endQuarterSelect option:selected').text();
		
		
        var scorecardPeriod = moment($('#year').val()).format('YYYY');
        var selectedQuarter= $('#quarterSelect option:selected').val();


        var scoreCardStartPeriod = startPeriodYear + "Q" + startPeriodQuater;
        var scoreCardEndPeriod = endPeriodYear + "Q" + endPeriodQuater;

        sessionStorage.setItem('reportType',reportType);
        sessionStorage.setItem('selectedDistrictUID',selectedDistrictUID);
        sessionStorage.setItem('selectedDistrictName',selectedDistrictName);
        sessionStorage.setItem('selectedFacilityUID',selectedFacilityUID);
        sessionStorage.setItem('selectedFacilityName',selectedFacilityName);
        sessionStorage.setItem('startPeriodYear',startPeriodYear);
        sessionStorage.setItem('endPeriodYear',endPeriodYear);
        sessionStorage.setItem('startPeriodQuater',startPeriodQuater);
        sessionStorage.setItem('endPeriodQuater',endPeriodQuater);
        sessionStorage.setItem('scoreCardStartPeriod',scoreCardStartPeriod);
        sessionStorage.setItem('scoreCardEndPeriod',scoreCardEndPeriod);
		sessionStorage.setItem('startPeriodQuaterName',startPeriodQuaterName);
        sessionStorage.setItem('endPeriodQuaterName',endPeriodQuaterName);
	    sessionStorage.setItem('homeURL2',homeURL);

        /*
         alert( reportType + "-" + selectedDistrictUID + "--" + selectedFacilityUID  +"\n"
         + startPeriodYear + "-" + endPeriodYear + "--" + startPeriodQuater  +"\n"
         + endPeriodQuater + "-" + scoreCardStartPeriod + "--" + scoreCardEndPeriod  +"\n"   );


         var scoreCardPeriods = [ scoreCardStartPeriod, scoreCardEndPeriod ];

         alert( scoreCardPeriods[0] + "-" + scoreCardPeriods[1]  );
         */

        window.location.href ="facilityScoreCard.html";
    });


    // bulk report scorecard Report
    $('#genBulkScoreCardReportButton').click(function(){
        var reportType = $('#reportSelect option:selected').text();
        var selectedDistrictUID = $('#bulkReportDistrictSelect option:selected').val();

        var selectedDistrictName = $('#bulkReportDistrictSelect option:selected').text();


        var startPeriodYear = moment($('#bulkStartYear').val()).format('YYYY');
        var endPeriodYear = moment($('#bulkEndYear').val()).format('YYYY');

        var startPeriodQuater = $('#bulkStartQuarterSelect option:selected').val();
        var startPeriodQuaterName = $('#bulkStartQuarterSelect option:selected').text();
        var endPeriodQuater = $('#bulkEndQuarterSelect option:selected').val();
        var endPeriodQuaterName = $('#bulkEndQuarterSelect option:selected').text();

        var scoreCardStartPeriod = startPeriodYear + "Q" + startPeriodQuater;
        var scoreCardEndPeriod = endPeriodYear + "Q" + endPeriodQuater;

        sessionStorage.setItem('reportType',reportType);
        sessionStorage.setItem('selectedDistrictUID',selectedDistrictUID);
        sessionStorage.setItem('selectedDistrictName',selectedDistrictName);

        sessionStorage.setItem('startPeriodYear',startPeriodYear);
        sessionStorage.setItem('endPeriodYear',endPeriodYear);
        sessionStorage.setItem('startPeriodQuater',startPeriodQuater);
        sessionStorage.setItem('endPeriodQuater',endPeriodQuater);
        sessionStorage.setItem('scoreCardStartPeriod',scoreCardStartPeriod);
        sessionStorage.setItem('scoreCardEndPeriod',scoreCardEndPeriod);
        sessionStorage.setItem('startPeriodQuaterName',startPeriodQuaterName);
        sessionStorage.setItem('endPeriodQuaterName',endPeriodQuaterName);
        sessionStorage.setItem('homeURL2',homeURL);
        /*
         alert( reportType + "-" + selectedDistrictUID + "--" + selectedDistrictName  +"\n"
         + startPeriodYear + "-" + endPeriodYear + "--" + startPeriodQuater  +"\n"
         + endPeriodQuater + "-" + scoreCardStartPeriod + "--" + scoreCardEndPeriod  +"\n"
         + startPeriodQuaterName + "--" + endPeriodQuaterName  +"\n" );
         */

        window.location.href ="bulkScoreCard.html";
    });


});
