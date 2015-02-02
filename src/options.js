function add_url() {
    var url = $('#url').val();

    var token = $('#token').val();


    var api = url + ';' + token;

    //ToDo: validate URL
    if (url.length > 20 && token.length > 20) {

        //reset fields
        $('#token').val('');
        $('#url').val('');

        //get urls from storage:
        chrome.storage.sync.get('urls', function (items) {
            if (typeof items.urls === 'undefined') {
                var urls = [api];
            } else {
                var urls = items.urls;
                urls.push(api);
            }
            chrome.storage.sync.set({urls: urls}, function () {
                addApiToTable(api);
            });
        });
    }
}

function addApiToTable(string) {
    var split = string.split(';')
    $('#api_table').append('<tr><td>' + split[0] + '</td><td>' + split[1] + '</td></tr>');
}

function restore_options() {
    var urls = [];
    chrome.storage.sync.get('urls', function (items) {
        items.urls.forEach(function (entry) {
            addApiToTable(entry);
        });
    });
    console.log('Settings Restored');
}

$(document).ready(function () {
    restore_options();
    $('#add').click(function () {
        add_url();
    });
    $('#reset').click(function () {
        chrome.storage.sync.clear(function () {
            console.log('All settings deleted');
        });
    });
});
