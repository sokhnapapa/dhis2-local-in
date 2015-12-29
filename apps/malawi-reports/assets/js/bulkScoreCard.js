var dhisBaseURL = '';
var homeURL2 = new String();
$(document).ready(function () {

    $.ajaxSetup({
        async: false
    });

    var reportType = sessionStorage.getItem('reportType');
    var selectedDistrictUID = sessionStorage.getItem('selectedDistrictUID');
    var selectedDistrictName = sessionStorage.getItem('selectedDistrictName');

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



    $('#districtName').html( selectedDistrictName );
    //$('#facilityName').html( selectedFacilityName );
    $('#startPeriod').html( fromPeriod );
    $('#endPeriod').html( toPeriod );

    $('#districtName1').html( selectedDistrictName );
    //$('#facilityName1').html( selectedFacilityName );
    $('#startPeriod1').html( fromPeriod );
    $('#endPeriod1').html( toPeriod );

    $('#districtName2').html( selectedDistrictName );
    //$('#facilityName2').html( selectedFacilityName );
    $('#startPeriod2').html( fromPeriod );
    $('#endPeriod2').html( toPeriod );


    var scoreCardPeriods = new Array();

    startPeriodYear = parseInt(startPeriodYear);
    endPeriodYear = parseInt(endPeriodYear);
    startPeriodQuater = parseInt(startPeriodQuater);
    endPeriodQuater = parseInt(endPeriodQuater);

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


    var facilities = new Array();
    facilities = getChildrenListByParentUid( selectedDistrictUID );

    console.log("facilities   " + facilities );

    for ( var j=0; j<facilities.length; j++)
    {
        console.log(" Facility Id  " + facilities[j].id + " Facility name  " + facilities[j].name );

        //var newDiv=$('<div id="mySecondDiv"></div>');
        //getFacilityScoreCardData("questionareTable"+[j]+"", scoreCardPeriods, facilities[j].id, facilities[j].name );
        //getFacilityScoreCardData("dataElementTable"+[j]+"", scoreCardPeriods, facilities[j].id, facilities[j].name );

        $('#printArea').append( '<div id="htmlContentQUIC'+j+'" >' );

        $('#htmlContentQUIC'+j).append( '<h2 align="middle">QuIC Scorecard : District : <label id="districtName'+j+'">'+ selectedDistrictName +'</label> Facility : <label id="facilityName'+j+'">'+facilities[j].name+'</label> <br>    Progress towards emergency obstetric and neonatal care status, <br />    From : <label id="startPeriod'+j+'">'+fromPeriod+'</label> To : <label id="endPeriod'+j+'">' +toPeriod+' </label>   </h2>');
        $('#htmlContentQUIC'+j).append(  $('#htmlContentQUIC').html() );

        $('#htmlContentQUIC'+j).append(' <div style="page-break-before: always">' );

        $('#printArea').append( '<div id="facilityScorecard'+j+'" >' );

        $('#facilityScorecard'+j).append( '<p id="enablerP'+j+'" align="middle">QuIC Enabler Scorecard: District : <label id="districtName'+j+'">'+ selectedDistrictName +'</label> Facility : <label id="facilityName'+j+'">'+ facilities[j].name + '</label> ( From : '+fromPeriod +' To : '+toPeriod +' )</p>' );
        //$('#facilityScorecard'+j).append( '<p id="enablerP'+j+'" align="middle">' );
        //$('#enablerP'+j).append(  $('#enablerP').html() );
        //$('#enablerP'+j).append( '</p>' );

        $('#facilityScorecard'+j).append( '<table id="questionareTable'+j+'" class="bordered" style="width:100%;">' );
        $('#questionareTable'+j).append(  $('#questionareTable').html() );
        getFacilityScoreCardData("questionareTable"+j, scoreCardPeriods, facilities[j].id, facilities[j].name, selectedDistrictName,  j );
        $('#facilityScorecard'+j).append( '</table><br>' );

        /*
        $('#facilityScorecard'+j).append( '<p id="dataElementP'+j+'" align="middle">' );
        $('#dataElementP'+j).append(  $('#dataElementP').html() );
        $('#dataElementP'+j).append( '</p>' );
        */

        $('#facilityScorecard'+j).append( '<p id="dataElementP'+j+'" align="middle">QuIC Signal Function Scorecard: District : <label id="districtName2'+j+'">'+ selectedDistrictName +'</label> Facility : <label id="facilityName1'+j+'">'+ facilities[j].name + '</label> Signal Functions ( From : '+fromPeriod +' To : '+toPeriod +' )</p>' );

        $('#facilityScorecard'+j).append( '<table id="dataElementTable'+j+'" class="bordered" style="width:100%;">' );
        $('#dataElementTable'+j).append(  $('#dataElementTable').html() );
        getFacilityScoreCardData("dataElementTable"+j, scoreCardPeriods, facilities[j].id, facilities[j].name, selectedDistrictName, j );
        $('#facilityScorecard'+j).append( '</table><br>' );

        if( j< facilities.length-1 )
        {
            $('#facilityScorecard'+j).append(' <div style="page-break-before: always">' );
        }
        //$('#facilityScorecard'+j).append(' <div style="page-break-before: always">' );

        $('#printArea').append( '</div>' );

      //  getFacilityScoreCardData("dataElementTable", scoreCardPeriods, facilities[j].id, facilities[j].name );


    }





    //alert(periodList);

    //getFacilityScoreCardData("questionareTable", scoreCardPeriods, selectedFacilityUID);
    //getFacilityScoreCardData("dataElementTable", scoreCardPeriods, selectedFacilityUID);


    $('#btnPrint').click(function () {
        var printContents = document.getElementById('printArea').innerHTML;
        var originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    });


    $("#btnExportExcel").click(function(e) {
        alert("alert");
        window.open('data:application/vnd.ms-excel,'+ encodeURIComponent($('#printArea').html()));
        e.preventDefault();
    });


});


var getFacilityScoreCardData = function (tableId, scoreCardPeriods, selectedFacilityUID, facilityName, selectedDistrictName, j ) {

    //var scorecardPeriod=sessionStorage.getItem('scorecardPeriod');

    //$('#facilityName').html( facilityName );
    //$('#facilityName1').html( facilityName );
    //$('#facilityName2').html( facilityName );


    /*
    $('#districtName'+j).html( selectedDistrictName );
    $('#districtName1'+j).html( selectedDistrictName );
    $('#districtName2'+j).html( selectedDistrictName );


    $('#facilityName'+j).html( facilityName );
    $('#facilityName1'+j).html( facilityName );
    $('#facilityName2'+j).html( facilityName );
     */


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


var getChildrenListByParentUid = function(uid){
    var result;
    $.ajax({
        url: "../../organisationUnits?filter=id:eq:"+uid+"&fields=children[id,name]&paging=false",
        dataType: "json",
        data: {
            format: "json"
        },
        success: function (response) {
            result = response.organisationUnits[0].children ;
        }
    });
    return result;
}



// return to dashBoard
function goToDashBoardFromFacilityScoreCard()
{
    homeURL2 = sessionStorage.getItem('homeURL2');
    console.log( homeURL2);
    //alert(homeURL2);
    document.getElementById('facilityDashBoardURL').href = homeURL2;
}
