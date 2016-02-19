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

"Authorization": "Basic " + btoa( ins.uname + ':' + ins.pword )

};	

$http({ method : 'get', url : ins.url+"/api/me", headers: header })
.success( function( data )
{
console.log( ins.name +" login success" );
$("#fail" + ins.id ).hide();
$("#succ" + ins.id ).show();

//logins : a global variable declared in app.js
logins.push('{"ins" : '+ ins.id + ',"isAvailable" : "true"}');

})
.error( function( data)
{
console.log( ins.name +" login failed" );
$("#fail" + ins.id ).show();
$("#succ" + ins.id ).hide();

//logins : a global variable declared in app.js
logins.push('{"ins" : '+ ins.id + ',"isAvailable" : "false"}');

});
});

}