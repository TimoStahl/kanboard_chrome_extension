function add_url() {
	var url = $('#url').val();	
	var token = $('#token').val();	
	var api = url + ';' + token;
	var name = 'Testname';
	
	var api_new = {url:url, token:token, name:name};
	
	//ToDo: validate URL
	if(url.length > 20 && token.length > 20){
		
		//reset fields
		$('#token').val('');
		$('#url').val('');
		
			//get endpoints from storage:
			chrome.storage.sync.get('endpoints', function(items) {
				if(typeof items.endpoints === 'undefined'){
					var endpoints = [api_new];
				}else{
					var endpoints = items.endpoints;
					endpoints.push(api_new);					
				}	
				chrome.storage.sync.set({endpoints: endpoints}, function() {
					addApiToTable(api_new);
				}); 				
			});
	}
}

function addApiToTable(endpoint) {
	//var split = string.split(';')
	$('#api_table').append('<tr><td>' + endpoint.name + '</td><td>' + endpoint.url + '</td><td>' + endpoint.token + '</td></tr>');
}

function restore_options() {
	var endpoints = [];
	chrome.storage.sync.get( 'endpoints', function(items) {
		items.endpoints.forEach(function(entry) {						
			addApiToTable(entry);
		});
	});
	console.log('Settings Restored');
}

$( document ).ready( function() {
	restore_options();
	$('#add').click( function() {
		add_url(); 
	});
	$('#reset').click( function() {
		chrome.storage.sync.clear(function (){
			console.log('All settings deleted');
		});
	});
});
