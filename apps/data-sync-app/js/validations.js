
/* **************************************************************************************
	Some common needed funtions
   ************************************************************************************ */
   
   	function isNull(inputId)
	{
		if($('#'+inputId).val()=="")
			return true;
		else
			return false;
	}
	function isValid(inputId)
	{
		if($('#'+inputId).val()=="http://localhost:8080/dhis")
			return true;
		else
			return false;
	}
	function hasMinCharacters(inputId,numOfMinChars)
	{
		if($('#'+inputId).val().length >= numOfMinChars)
			return true;
		else
			return false;
	}
	
	
	/*function isUrlValid(textval) {
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
}
	*/
	
/* **************************************************************************************
	Validating Add Instance Form
   ************************************************************************************ */
   
	function validateAddForm()
	{
		if(isNull("title"))
		{
			$("#alertMsg").html("Instance name is empty");
			$("#title").focus();					
			$("#alertModal").modal("show");	
		}
		else if(!hasMinCharacters("title",3))
		{
			$("#alertMsg").html("Instance name should be at least of 3 characters");
			$("#title").focus();	
			$("#alertModal").modal("show");	
		}
		else if(isNull("url"))
		{
			$("#alertMsg").html("Instance URL is empty");
			$("#url").focus();			
			$("#alertModal").modal("show");
					
			
		}
		else  if(isValid("url")){
			$("#alertMsg").html("Invalid URL");
			$("#url").focus();			
			$("#alertModal").modal("show");		
			
		}
		
		
		else if(isNull("uname"))
		{
			$("#alertMsg").html("User name is empty");
			$("#uname").focus();
			$("#alertModal").modal("show");	
			
		}
		else if(isNull("pword"))
		{
			$("#alertMsg").html("Password is empty");
			$("#pword").focus();
			$("#alertModal").modal("show");	
			
		}
		else
		{
			$("#instanceModal").modal("hide");
			return true;
		}
	}
	
/* **************************************************************************************
	Validating Edit Instance Form
   ************************************************************************************ */
   
	function validateEditForm()
	{
		if(isNull("ename"))
		{
			$("#alertMsg2").html("Instance name is empty");
			$("#ename").focus();
			$("#alertModal").modal("show");	
		}
		else if(!hasMinCharacters("ename",3))
		{
			$("#alertMsg").html("Instance name should be at least of 3 characters");
			$("#ename").focus();
			$("#alertModal").modal("show");	
		}
		else if(isNull("eurl"))
		{
			$("#alertMsg").html("Instance URL is empty");
			$("#eurl").focus();
			$("#alertModal").modal("show");	
		}
		/*else if(!isUrlValid("url"))
		{
			$("#alertMsg").html("Invalid URL");
			$("#alertModal").modal("show");	
			return false;
		}*/
		else if(isNull("euname"))
		{
			$("#alertMsg").html("User name is empty");
			$("#euname").focus();
			$("#alertModal").modal("show");	
		}
		else if(isNull("epword"))
		{
			$("#alertMsg").html("Password is empty");
			$("#epword").focus();
			$("#alertModal").modal("show");	
		}
		else
		{
			$("#editInstanceModal").modal("hide");
			return true;
		}
	}
