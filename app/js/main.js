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
	zoom: 10,
	layers: [mapbox_light]
});



var googleKey = 'AIzaSyDAGg0K_pKJzgVU6Z1J18unImf05zu43uE';

var data = {};

function reportDetail(rep) {
	var output = rep.address;
	return output;
}

function showReport(rep) {
	L.marker(rep.latlng, custom_icon[1])
		.addTo(map_container)
		.bindPopup(reportDetail(rep));

	$('#menu-list').prepend(
		$('<li>').attr({
			id: rep.id
		}).append(
			$('<a href="#">').addClass('hvr-sweep-to-right').append(
				$('<div>').addClass('img-container').append(
					$('<img>').addClass('img-responsive').attr({
						'src': rep.pics[0]._url
					}),
					$('<i>').addClass('fa fa-arrow-left left'),
					$('<i>').addClass('fa fa-arrow-right right')
				),
				$('<div>').addClass('text')
			).click(function() {
				var id = $(this).parent().attr('id');
				var latlng = data[id].latlng;
				map_container.setView(latlng, 16);
			})
		)
	);
}



/*=============================
=            Parse            =
=============================*/

Parse.initialize('zsM7jMlv5rSBynZReBXIvUWNgwx0hmpqXrHodpO7', 'gvjbH0CIqIUxfqj5sFjHthTwIhQ8FN4lNlKCVsh1');

var Report = Parse.Object.extend('Report');
var query = new Parse.Query(Report);

function getAddress(location, id) {
	$.ajax({
		url: 'https://maps.googleapis.com/maps/api/geocode/json',
		data: {
			latlng: location._latitude + ',' + location._longitude,
			key: googleKey,
			language: 'zh-TW'
		},
	}).done(function(response) {
		data[id].address = response.results[0].formatted_address;
		showReport(data[id]);
	}).fail(function(xhr) {
		console.log(xhr);
	});
}

query.find({
	success: function(res) {
		for (var i in res) {
			var id = res[i].id;
			if (!data[id]) {
				var location = res[i].get('Location');

				data[id] = {
					id: id,
					latlng: [location._latitude, location._longitude],
					pics: res[i].get('Pictures'),
					lp: res[i].get('LicensePlatePicture')._url
				};

				getAddress(location, id);
			}
		}
		getLocation();
	},
	error: function(error) {
		alert("Error: " + error.code + " " + error.message);
	}
});



/*============================================
=            Get Current Location            =
============================================*/

function getDistance(center, id) {
	$.ajax({
		url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
		data: {
			origins: center,
			destinations: data[id].latlng[0] + ',' + data[id].latlng[1],
			key: googleKey,
		}
	}).done(function(res) {
		if (res.status === 'OK' && res.rows[0].elements[0].status === 'OK') {
			data[id].distance = res.rows[0].elements[0].distance.text;
		}
		else {
			data[id].distance = 'Cannot detect';
			console.log(res.error_message);
		}
		$('#' + data[id].id + ' .text').text(data[id].distance);
	}).fail(function(xhr) {
		console.log(xhr);
	});
}

function getLocation() {
	navigator.geolocation.getCurrentPosition(function(position) {
		map_container.setView([position.coords.latitude, position.coords.longitude], 16);
		var center = position.coords.latitude + ',' + position.coords.longitude;
		for (var i in data) {
			// var data[i] = data[i];
			getDistance(center, i);
		}
	});
}
