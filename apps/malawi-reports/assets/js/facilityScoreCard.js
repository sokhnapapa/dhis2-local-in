var dhisBaseURL = '';
var homeURL2 = new String();
$(document).ready(function () {


    var reportType = sessionStorage.getItem('reportType');
    var selectedDistrictUID = sessionStorage.getItem('selectedDistrictUID');
    var selectedDistrictName = sessionStorage.getItem('selectedDistrictName');

    var selectedFacilityUID = sessionStorage.getItem('selectedFacilityUID');
    var selectedFacilityName = sessionStorage.getItem('selectedFacilityName');

    var startPeriodYear = sessionStorage.getItem('startPeriodYear');
    var endPeriodYear = sessionStorage.getItem('endPeriodYear');


    var startPeriodQuater = sessionStorage.getItem('startPeriodQuater');
    var startPeriodQuaterName = sessionStorage.getItem('startPeriodQuaterName');
    var endPeriodQuater = sessionStorage.getItem('endPeriodQuater');
    var endPeriodQuaterName = sessionStorage.getItem('endPeriodQuaterName');
    var scoreCardStartPeriod = sessionStorage.getItem('scoreCardStartPeriod');
    var scoreCardEndPeriod = sessionStorage.getItem('scoreCardEndPeriod');

    var fromPeriod = startPeriodQuaterName + " " + startPeriodYear;
    var toPeriod = endPeriodQuaterName + " " + endPeriodYear;

    //alert( fromPeriod + "--" + toPeriod );

    $('#districtName').html( selectedDistrictName );
    $('#facilityName').html( selectedFacilityName );
    $('#startPeriod').html( fromPeriod );
    $('#endPeriod').html( toPeriod );

    $('#districtName1').html( selectedDistrictName );
    $('#facilityName1').html( selectedFacilityName );
    $('#startPeriod1').html( fromPeriod );
    $('#endPeriod1').html( toPeriod );

    $('#districtName2').html( selectedDistrictName );
    $('#facilityName2').html( selectedFacilityName );
    $('#startPeriod2').html( fromPeriod );
    $('#endPeriod2').html( toPeriod );

    //homeURL2 = sessionStorage.getItem('homeURL2');

    //$('#testURL').html( homeURL2 );

    //alert( homeURL2 );

	/*
    alert(reportType + "-" + selectedDistrictUID + "--" + selectedFacilityUID + "\n"
    + startPeriodYear + "-" + endPeriodYear + "--" + startPeriodQuater + "\n"
    + endPeriodQuater + "-" + scoreCardStartPeriod + "--" + scoreCardEndPeriod + "\n");
	*/
	
    var scoreCardPeriods = new Array();

    //scoreCardPeriods.push( scoreCardStartPeriod );
    //scoreCardPeriods.push( scoreCardEndPeriod );

    startPeriodYear = parseInt(startPeriodYear);
    endPeriodYear = parseInt(endPeriodYear);
    startPeriodQuater = parseInt(startPeriodQuater);
    endPeriodQuater = parseInt(endPeriodQuater);

    //alert( scoreCardPeriods );
    //debugger;

    //http://hospdev.hispindia.org/quic_siera_leone/api/analytics?dimension=pe:2015Q1&dimension=ou:xkS7G43gmA9;RBdPlhP0LQx;eZUhoFRwHfg;KSyTJiyLGt7;upTXWgGu7Ry;aViRz09so4i;dlwPD9f7hPR;GbfUaqHC0uF;gXKe40aC1SC;sTU9bbIaiNp;zefSg6XUCzB&dimension=dx:TU7YJCglJj4;Z5reqVtbpLE;ANK88sqN1lp;hZlgAu2zTuJ;qRxRC6G8KXa;mZEdXsMl3Qz;POX0wNKk1sS&format=json&tableLayout=true&columns=dx;pe&rows=ou&format=json


    //var periodList = new String();

    while (startPeriodYear <= endPeriodYear) {
        if (startPeriodYear == endPeriodYear) {
            for (var i = startPeriodQuater; i <= endPeriodQuater; i++) {
                scoreCardPeriods.push(startPeriodYear + "Q" + i);

                // periodList = periodList.concat(';' + startPeriodYear + "Q" + i );
            }
        }
        else {
            for (var i = startPeriodQuater; i <= 4; i++) {
                scoreCardPeriods.push(startPeriodYear + "Q" + i);
                //periodList = periodList.concat(';' + startPeriodYear + "Q" + i );
            }
        }

        //startPeriodQuater++;
        startPeriodYear++;
        startPeriodQuater = 1;

        console.log(scoreCardPeriods);
    }

    //alert(periodList);

    getFacilityScoreCardData("questionareTable", scoreCardPeriods, selectedFacilityUID);
    getFacilityScoreCardData("dataElementTable", scoreCardPeriods, selectedFacilityUID);


    //$('#btnPrint').click(function () {
    //    var printContents = document.getElementById('printArea').innerHTML;
    //    var originalContents = document.body.innerHTML;
    //    document.body.innerHTML = printContents;
    //    window.print();
    //    document.body.innerHTML = originalContents;
    //});


    $("#btnExportExcel").click(function(e) {
        alert("alert");
        window.open('data:application/vnd.ms-excel,'+ encodeURIComponent($('#printArea').html()));
        e.preventDefault();
    });


});


var getFacilityScoreCardData = function (tableId, scoreCardPeriods, selectedFacilityUID) {

    //var scorecardPeriod=sessionStorage.getItem('scorecardPeriod');

    var dataElementCount = $('#' + tableId + ' thead tr')[0].childElementCount;

    //var j=1;

    var dimensionPe = "";
    var dimensionDx = "";

    for (j = 0; j < scoreCardPeriods.length; j++)
    {
        dimensionPe = dimensionPe + ";" + scoreCardPeriods[j];
    }
    for (i = 1; i <= dataElementCount; i++)
    {
        var $th = $('#' + tableId + ' tr').find('th:nth-child(' + i + ')');
        var de = $th[0].attributes[0].value;
        dimensionDx = dimensionDx + ";" + de;
    }

    dimensionDx = dimensionDx.substring(4, dimensionDx.length);
    dimensionPe = dimensionPe.substr(1, dimensionPe.length);

    var analyticsURL = '../../analytics?' + 'dimension=pe:' + dimensionPe + '&dimension=ou:' + selectedFacilityUID + '&dimension=dx:' + dimensionDx + "&format=json&tableLayout=true&columns=dx;ou&rows=pe";

    $.ajax({
        url: analyticsURL,
        async:false,
        dataType: "json",
        data:
        {
            format: "json"
        },
        success: function (response)
        {
            response;

            for ( j=0;j<scoreCardPeriods.length;j++ )
            {
                var period = scoreCardPeriods[j];

                $('#'+tableId).append("<tr><td>"+response.rows[j][1]+"</td>");

                for (i=4;i<response.rows[j].length;i++){

                    if (response.rows[j][i]!=""){
                        var value = response.rows[j][i];
                        var imgHtml = getColorImage(value);
                        //appendHtml(trField,imgHtml);
                        $('#'+tableId+' tr:last').append("<td>"+imgHtml+"</td>");
                    }else{
                        $('#'+tableId+' tr:last').append("<td></td>");

                    }
                }

                $('#'+tableId).append("</tr>");

            }

        }
    });





    /*
    for (var j = 0; j < scoreCardPeriods.length; j++)
    {

        var period = scoreCardPeriods[j];
        $('#' + tableId).append("<tr><td>" + period + "</td>");
        var i = 1;
        for (i = 1; i <= dataElementCount; i++)
        {

            var $th = $('#' + tableId + ' tr').find('th:nth-child(' + i + ')');
            var de = $th[0].attributes[0].value;

            var analyticsURL = '../../analytics?' + 'dimension=pe:' + period + '&dimension=ou:' + selectedFacilityUID + '&dimension=dx:' + de;

            //console.log( analyticsURL );

            $.ajax({
                url: analyticsURL,
                async: false,
                dataType: "json",
                data: {
                    format: "json"
                },
                success: function (response) {
                    if (response.rows.length > 0) {
                        var value = response.rows[0][3];
                        var imgHtml = getColorImage(value);
                        $('#' + tableId + ' tr:last').append("<td>" + imgHtml + "</td>");
                    } else {
                        $('#' + tableId + ' tr:last').append("<td></td>");

                    }
                }
            });




        }
        $('#' + tableId).append("</tr>");

    }

    */
}
var getColorImage = function(value){
    var htmlContent="N/A";
    var width=19;
    var height=19;
    if (value == 'RED'){
        htmlContent = "<img src=assets/img/red.png width="+width+" height="+height+" align=middle>";
    }

    else if (value=='YELLOW'){
        htmlContent = "<img src=assets/img/yellow.png width="+width+" height="+height+" align=middle>";
    }

    else if (value=='GREEN'){
        htmlContent = "<img src=assets/img/green.png width="+width+" height="+height+" align=middle>";
    }
    else if (value=='AMBER'){
        htmlContent = "<img src=assets/img/orange.png width="+width+" height="+height+" align=middle>";
    }
    else if (value==parseInt("0.0")){
        htmlContent = "<img src=assets/img/wrongRedCircle.png width="+width+" height="+height+" align=middle>";
    }else if (value==parseInt("1.0")){
        htmlContent = "<img src=assets/img/rightGreenCircle.png width="+width+" height="+height+" align=middle>";
    }else if (value == parseInt("9.0")){
        htmlContent = "N/A";
    }
    return htmlContent;
}

// return to dashBoard
function goToDashBoardFromFacilityScoreCard()
{
    homeURL2 = sessionStorage.getItem('homeURL2');
    console.log( homeURL2);
    //alert(homeURL2);
    document.getElementById('facilityDashBoardURL').href = homeURL2;
}