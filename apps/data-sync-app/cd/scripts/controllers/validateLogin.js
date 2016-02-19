
	// validate whether an instance is logged in or not
	function validateLogin($http, instanceUrl)
	{
		$http.jsonp(instanceUrl)
		.success(function(response){
			console.log("Instance available");
		})
		.error(function(response) {
			$('#loginErrMsg').html('This instance is not currently available. Explicit URL navigation is not recommended in this app.');
			$("#coverLoad").hide();
			$('#loginErrModal').modal('show');
		});
	}