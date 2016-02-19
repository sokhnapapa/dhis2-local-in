	//to log into the instances
	var numOfIns = 0;
	var currentNumber = 0;
	
	function logInToAllInstance( $rootScope, $http )
	{
		numOfIns = $rootScope.setting.instances.length;

		//if there are no instance, move to the next step
		if( numOfIns == 0 )
			checkFinished();
		
		//individual logins
		$rootScope.setting.instances.forEach(function(ins) {
			var header = { 
						"Accept": "application/json",
						"Authorization": "Basic " + btoa( ins.uname + ':' + ins.pword ),
						"Access-Control-Allow-Origin" : "*",
						"Access-Control-Allow-Methods" : "GET, POST, DELETE, PUT, JSONP"
					};		
					
			 $http({ method : 'post', url : ins.url, headers: header })
			 .success( function( data )
			 {
				console.log( ins.name +" login success" );
				$("#fail" + ins.id ).hide();
				$("#succ" + ins.id ).show();
				//logins : a global variable declared in app.js
				logins.push('{"ins" : '+ ins.id + ',"isAvailable" : "true"}');
				checkFinished();
			 })
			 .error( function( data)
			 {
				console.log( ins.name +" login failed" );
				$("#fail" + ins.id ).show();
				$("#succ" + ins.id ).hide();
				//logins : a global variable declared in app.js
				logins.push('{"ins" : '+ ins.id + ',"isAvailable" : "false"}');
				checkFinished();
			 });
		});
	}
	
	//to check if all the instance are tried to login ( no matter succeeded or failed )
	function checkFinished()
	{
		currentNumber++;
		
		if( currentNumber >= numOfIns )
		{
			$("#coverLoad").hide();
		}
	}
	
	//to check whether an instance is logged in or not
	function isLoggedIn(ins)
	{
		var isInstanceLoggedIn = false;
		
		logins.forEach(function(ld) {
			if( ld.ins == ins && ld.isAvailable == "true" )
				isInstanceLoggedIn = true;
		});
		
		return isInstanceLoggedIn;
	}
	