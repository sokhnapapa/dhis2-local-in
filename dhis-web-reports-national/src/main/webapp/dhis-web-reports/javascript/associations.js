
var numberOfSelects = 0;

function selectAllAtLevel()
{
	showOverlay();
	var request = new Request();
    request.setCallbackSuccess( selectReceived );
    //request.send( 'selectLevel.action?level=' + getListValue( 'levelList' ) );
    var requestString = "selectLevel.action";
    var params = 'level=' + getListValue( 'levelList' );   

    request.sendAsPost( params );
    request.send( requestString );
}

function unselectAllAtLevel()
{
	showOverlay();
	var request = new Request();
    request.setCallbackSuccess( selectReceived );
    //request.send( 'unselectLevel.action?level=' + getListValue( 'levelList' ) );
    
    var requestString = "unselectLevel.action";
    var params = 'level=' + getListValue( 'levelList' );	

    request.sendAsPost( params );
    request.send( requestString );

}

function selectGroup()
{
	showOverlay();
    var request = new Request();
    request.setCallbackSuccess( selectReceived );
    //request.send( 'selectOrganisationUnitGroup.action?organisationUnitGroupId=' + getListValue( 'groupList' ) );
    
    var requestString = "selectOrganisationUnitGroup.action";
    var params = 'organisationUnitGroupId=' + getListValue( 'groupList' );	

    request.sendAsPost( params );
    request.send( requestString );

}

function unselectGroup()
{
	showOverlay();
    var request = new Request();
    request.setCallbackSuccess( selectReceived );
    //request.send( 'unselectOrganisationUnitGroup.action?organisationUnitGroupId=' + getListValue( 'groupList' ) );
    
    var requestString = "unselectOrganisationUnitGroup.action";
    var params = 'organisationUnitGroupId=' + getListValue( 'groupList' );	

    request.sendAsPost( params );
    request.send( requestString );

}

function unselectAll()
{
	showOverlay();
    var request = new Request();
    request.setCallbackSuccess( selectReceived );
    request.send( 'unselectAll.action' );
}

function selectReceived()
{
    selectionTree.buildSelectionTree();
    
    hideOverlay();
}

function treeClicked()
{
    numberOfSelects++;
    
    setMessage( i18n_loading );
    
    document.getElementById( "submitButton" ).disabled = true;
}

function selectCompleted( selectedUnits )
{
    numberOfSelects--;
    
    if ( numberOfSelects <= 0 )
    {
        hideMessage();
        
        document.getElementById( "submitButton" ).disabled = false;
    }
}

function showOverlay() 
{
	var o = document.getElementById('overlay');
	o.style.visibility = 'visible';
	jQuery("#overlay").css({"height": jQuery(document).height()});
	jQuery("#overlayImg").css({"top":jQuery(window).height()/2});
}

function hideOverlay() 
{
	var o = document.getElementById('overlay');
	o.style.visibility = 'hidden';
}
