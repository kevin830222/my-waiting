/*===================================
=            Leaflet Map            =
===================================*/

const ACCESS_TOKEN = 'pk.eyJ1IjoiamFja3loc3UiLCJhIjoiY2lpdmprMjh5MDAzOXUza21zazg1OHN6YSJ9.fUbM8w0ecKf_UcHi1XKmGw';
const ATTR = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
var URL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + ACCESS_TOKEN;

var marker_color = ['#9a9a9a', '#2cd8b6', '#ef7203', '#a15af8', '#e11b0c', '#ff6b93', '#30c9ef', '#ebbd5b', '#1bb05d', '#54d62c', '#0f7ce2'];

var custom_icon = (function() {
	var LeafIcon = L.Icon.extend({
		options: {
			iconSize: [32, 32],
			iconAnchor: [16, 32],
		}
	});
	var list = [];
	for (var i in marker_color) {
		list.push(new LeafIcon({
			iconUrl: '/img/marker/' + i + '.png'
		}));
	}
	return list;
})();

var mapbox_light = L.tileLayer(URL, {
	attribution: ATTR,
	id: 'mapbox.light'
});

var map_container = L.map('leaflet-map', {
	center: [25.0333, 121.6333],
	zoom: 13,
	layers: [mapbox_light]
});

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(showPosition);
	}
}

var googleKey = 'AIzaSyAzph6fbD28zqwrk8AF9F-xx10qKZfn52s';
function showPosition(position) {
	currentLocation = position.coords;
	map_container.setView([position.coords.latitude, position.coords.longitude], 15);
	$('#menu-list > li').each(function(index, elem) {
		var latlng = JSON.parse($(this).find('a').attr('data-latlng'));
		var _self = this;
		$.ajax({
				url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
				data: {
					origins: position.coords.latitude + ',' + position.coords.longitude,
					destinations: latlng[0] + ',' + latlng[1],
					key: googleKey,
				},
			})
			.done(function(response) {
				console.log(response);
				var distance = 'Cannot detect';
				if (response.status === 'OK' && response.rows[0].elements[0].status === 'OK') {
				    distance = response.rows[0].elements[0].distance.text;
				}
				console.log(distance);
				$(_self).find('.text').html(distance);
			})
			.fail(function() {
				console.log("error");
			})
			.always(function() {
				console.log("complete");
			});
		
	});
}

/*==================================
=            Google map            =
==================================*/



/*=============================
=            Parse            =
=============================*/

Parse.initialize("zsM7jMlv5rSBynZReBXIvUWNgwx0hmpqXrHodpO7", "gvjbH0CIqIUxfqj5sFjHthTwIhQ8FN4lNlKCVsh1");

function reportDetail(report) {
	var picture = report.get("licensePlatePicture");
	var location = report.get('Location');
	$.ajax({
		url: 'https://maps.googleapis.com/maps/api/geocode/json',
		data: {
			latlng: location._latitude + ',' + location._longitude,
			key: googleKey,
		},
	})
	.done(function(response) {
		console.log(response);
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
	
	if (picture._url) {
		return '<img src="' + picture._url + '">';
	}
	return 'No picture';
}

function showReport(report) {
	var location = report.get("Location");
	var picture = report.get("licensePlatePicture");
	L.marker([location._latitude, location._longitude], custom_icon)
		.addTo(map_container)
		.bindPopup(reportDetail(report));

	// draw menu
	var item = $('#' + report.id);
	if (item.length == 0) {
		$('#menu-list').prepend(
			$('<li>').append(
				$('<a href="#" class="hvr-sweep-to-right">').attr({
					'data-latlng': '[' + location._latitude + ',' + location._longitude + ']'
				})
				.append(
					$('<div class="img-container">').append(
						$('<img alt="" class="img-responsive">')
						.attr({
							'src': picture._url,
							'height': 400,
							'width': 300,
						})

					),
					$('<div class="text">')
				)
				.click(function(evt) {
					var latlng = JSON.parse($(this).attr('data-latlng'));
					map_container.setView(latlng, 15);
				})
			).attr('id', report.id)
		);
	};

}

var Report = Parse.Object.extend("Report");
var query = new Parse.Query(Report);
// query.equalTo("playerName", "Dan Stemkoski");
query.find({
	success: function(results) {
		// Do something with the returned Parse.Object values
		for (var i = 0; i < results.length; i++) {
			var report = results[i];
			showReport(report);
		}
	},
	error: function(error) {
		alert("Error: " + error.code + " " + error.message);
	}
});


/*===========================
=            Run            =
===========================*/

$(function() {
	getLocation();
});



// {
// 	img: '1.jpg',
// 	latlng: [25.040245109051735, 121.53897903467575]
// }, {
// 	img: '2.jpg'
// 	latlng: [25.0596784, 121.5567165]
// }, {
// 	img: '3.jpg',
// 	latlng: [25.0559851, 121.5315252]
// }, {
// 	img: '4.jpg',
// 	latlng: [25.0559851, 121.5315252]
// }
