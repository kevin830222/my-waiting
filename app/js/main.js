/*===================================
=            Leaflet Map            =
===================================*/

const ACCESS_TOKEN = 'pk.eyJ1IjoiamFja3loc3UiLCJhIjoiY2lpdmprMjh5MDAzOXUza21zazg1OHN6YSJ9.fUbM8w0ecKf_UcHi1XKmGw';
const ATTR = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
var URL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + ACCESS_TOKEN;

// var marker_color = ['#9a9a9a', '#2cd8b6', '#ef7203', '#a15af8', '#e11b0c', '#ff6b93', '#30c9ef', '#ebbd5b', '#1bb05d', '#54d62c', '#0f7ce2'];

var custom_icon = (function() {
	var LeafIcon = L.Icon.extend({
		options: {
			iconSize: [40, 40],
			iconAnchor: [20, 40],
		}
	});
	var list = [];
	for (var i = 0; i < 4; i++) {
		list.push(new LeafIcon({
			iconUrl: 'public/img/' + i + '.png'
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
var count = {};

function reportDetail(id) {
	var output = '<h3>' + 'Plate: ' + data[id].plate + '<br>';
	output += '<br>' + 'Address:<br>' + data[id].address + '<br>';
	output += '<br>' + 'Times: ' + count[data[id].plate] + '<br><br></h3>';
	output += '<button class="btn btn-block btn-danger" onclick="data[\'' + id + '\']._self.set(\'State\', \'Accepted\');data[\'' + id + '\']._self.save();window.location.href=\'.\';">Accept</button>';
	return output;
}

function showReport(id) {
	var rep = data[id];

	var marker_index = count[rep.plate] - 1;
	if (marker_index < 0) marker_index = 0;
	else if (marker_index > 3) marker_index = 3;

	L.marker(rep.latlng, {
			icon: custom_icon[marker_index]
		})
		.addTo(map_container)
		.bindPopup(reportDetail(id));

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
	$('i.left').click(function() {
		var id = $(this).parents('li').attr('id');
		data[id].pic_index = (data[id].pic_index + data[id].pics.length + 1) % data[id].pics.length;
		$(this).parent().find('img').attr({
			'src': data[id].pics[data[id].pic_index]._url
		});
	});
	$('i.right').click(function() {
		var id = $(this).parents('li').attr('id');
		data[id].pic_index = (data[id].pic_index + data[id].pics.length - 1) % data[id].pics.length;
		$(this).parent().find('img').attr({
			'src': data[id].pics[data[id].pic_index]._url
		});
	});
}



/*=============================
=            Parse            =
=============================*/

Parse.initialize('zsM7jMlv5rSBynZReBXIvUWNgwx0hmpqXrHodpO7', 'gvjbH0CIqIUxfqj5sFjHthTwIhQ8FN4lNlKCVsh1');


var Report = Parse.Object.extend('Report');
var query = new Parse.Query(Report);

query.equalTo('State', 'Pending');
query.find({
	success: function(res) {
		// console.log(JSON.stringify(res));
		for (var i in res) {
			var id = res[i].id;
			if (!data[id]) {
				var location = res[i].get('Location');

				data[id] = {
					_self: res[i],
					id: id,
					latlng: [location._latitude, location._longitude],
					lp: res[i].get('LicensePlatePicture')._url,
					plate: res[i].get('LicensePlate'),
					pics: res[i].get('Pictures'),
					pic_index: 0,
					address: res[i].get('Address')
				};

				console.log(data[id].plate);

				if (count[data[id].plate]) count[data[id].plate]++;
				else count[data[id].plate] = 1;
				showReport(id);
			}
		}
		getLocation();
	},
	error: function(error) {
		console.log("Error: " + error.code + " " + error.message);
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
		console.log(data[id].distance);
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
