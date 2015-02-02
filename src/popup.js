document.addEventListener('DOMContentLoaded', function () {
    $(function () {

        $('body').on('click', 'a', function () {
            chrome.tabs.create({url: $(this).attr('href')});
            return false;
        });

        var urls = [];
        chrome.storage.sync.get('urls', function (items) {
            items.urls.forEach(function (entry) {

                var split = entry.split(';')

                var user = 'jsonrpc';
                var password = split[1];
                var request = '{"jsonrpc": "2.0", "method": "getAllProjects", "id": 1}';
                var url = split[0].substring(0, split[0].length - 11);
                var endpoint = split[0];

                $("#projects").append('<br><li><i>' + url + '</i><ul data-url="' + url + '"></ul></li>');

                $.ajax({
                    url: endpoint,
                    type: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    data: request,
                    beforeSend: function (xhr) {
                        var auth = Base64.encode(user + ':' + password);
                        xhr.setRequestHeader("Authorization", "Basic " + auth);
                    },
                    success: function (data) {
                        var result = data.result;

                        $.each(result, function (index, element) {


                            var href = url + '?controller=board&action=show&project_id=' + element.id;

                            $("ul").find("[data-url='" + url + "']").append('<li><a href="' + href + '">' + element.name + '</a></li>');
                        });

                    },
                    error: function (data) {
                        $("ul").find("[data-url='" + url + "']").append('<li>ERROR</li>');
                    }
                });
            });
        });
        console.log('Settings Restored');



    });
});

