
var dhisBaseURL='';
var homeURL2 = new String();
$(document).ready(function(){
    var selectedDistrictUID=sessionStorage.getItem('selectedDistrictUID');

    var selectedDistrictName=sessionStorage.getItem('selectedDistrictName');
    var date=sessionStorage.getItem('date') + sessionStorage.getItem('year');

    getFacilityListByDistrictUid(selectedDistrictUID);

    $('#ouLabel1').html(selectedDistrictName);
    $('#ouLabel2').html(selectedDistrictName);
    $('#ouLabel3').html(selectedDistrictName);
    $('#date').html(date);
    $('#date2').html(date);
    $('#date3').html(date);

    //$('#btnPrint').click(function() {
    //    var printContents = document.getElementById('printArea').innerHTML;
    //    var originalContents = document.body.innerHTML;
    //    document.body.innerHTML = printContents;
    //    window.print();
    //    document.body.innerHTML = originalContents;
    //});

});
var doData = function(tableId,facilities){
    var scorecardPeriod=sessionStorage.getItem('scorecardPeriod');
    var deCount = $('#'+tableId+' thead tr')[0].childElementCount;

    var j=1;
    var dimensionOu="";
    var dimensionDx="";
    for (j=0;j<facilities.length;j++){
        dimensionOu = dimensionOu + ";"+facilities[j].id;
    }
    for (i=1;i<=deCount;i++) {
        var $th = $('#' + tableId + ' tr').find('th:nth-child(' + i + ')');
        var de = $th[0].attributes[0].value;
        dimensionDx=dimensionDx+";"+de;
    }
    dimensionDx=dimensionDx.substring(4,dimensionDx.length);
    dimensionOu=dimensionOu.substr(1,dimensionOu.length);
    var analyticsURL='../../analytics?'+ 'dimension=pe:'+scorecardPeriod+'&dimension=ou:'+dimensionOu+'&dimension=dx:'+dimensionDx +"&format=json&tableLayout=true&columns=dx;pe&rows=ou";

    $.ajax({
        url: analyticsURL,
        async:false,
        dataType: "json",
        data: {
            format: "json"
        },
        success: function (response) {
            response;

            for (j=0;j<facilities.length;j++){
                var facility = facilities[j];
                $('#'+tableId).append("<tr><td>"+response.rows[j][1]+"</td>");
                for (i=4;i<response.rows[j].length;i++){

                    if (response.rows[j][i]!=""){
                        var value = response.rows[j][i];
                        var imgHtml = getColorImage(value);
                        //        appendHtml(trField,imgHtml);
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
var appendHtml = function(trField,htmlContent){
    trField.append("<td>"+htmlContent+"</td>");
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
        htmlContent = "NA";
    }
    return htmlContent;
}
var getFacilityListByDistrictUid = function(id){

    $.ajax({
        url: "../../organisationUnits?filter=id:eq:"+id+"&fields=children[id,name]&paging=false",
        dataType: "json",
        data: {
            format: "json"
        },
        success: function (response) {
            doData("questionare",response.organisationUnits[0].children);
            doData("signal",response.organisationUnits[0].children);

            return ;
        }
    });

}


// return to dashBoard
function goToDashBoardFromDistrictScoreCard()
{
    homeURL2 = sessionStorage.getItem('homeURL2');
    console.log( homeURL2);
    //alert(homeURL2);
    document.getElementById('districtDashBoardURL').href = homeURL2;
}