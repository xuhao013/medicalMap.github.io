var data1, data, state
//get no repeated Hospital name dataset
$.getJSON(" result.json", function (x) {
    data1 = x
    for (var i = 0; i < data1.length; i++) {
        for (var j = i + 1; j < data1.length;) {
            if (data1[i].NAME == data1[j].NAME) {//判断哪个字段信息重复
                data1.splice(j, 1);//去除重复的对象；
            } else {
                j++;
            }
        }
    }
});

//get a list of US states
$.getJSON(" result.json", function (x) {
    state = x
    for (var i = 0; i < state.length; i++) {
        for (var j = i + 1; j < state.length;) {
            if (state[i].state == state[j].state) {//判断哪个字段信息重复
                state.splice(j, 1);//去除重复的对象；
            } else {
                j++;
            }
        }
    }
});

//get all data
$.getJSON(" result.json", function (x) {
    data = x
});


$(document).ready(function () {
    queryList();
});

let map, infoWindow;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: data1[1].Y, lng: data1[1].X },
        zoom: 6,
    });
    infoWindow = new google.maps.InfoWindow();

    //find current location
    const locationButton = document.getElementById('findCurrentPlace');
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });

    //find all hospitals
    const findAllHos = document.getElementById("findAllHos")
    findAllHos.addEventListener("click", () => {
        //get state
        var state = document.getElementById('stateSelection').value;
        var drg = document.getElementById('drgSelection').value;
        var distance = document.getElementById('distanceRange').value;
        var money = document.getElementById('expenseRange').value;
        var datatemp = findAllHosData(state, drg, distance, money);
        var locations = []
        for(var i =0;i<datatemp.length;i++){
            var pos = { lat: datatemp[i].Y, lng: datatemp[i].X };
            locations.push(pos)
        }

        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 7,
            center: { lat: locations[0].lat, lng: locations[0].lng },
          });
        infoWindow = new google.maps.InfoWindow({
            content: "",
            disableAutoPan: true,
        });
        
        // Create an array of alphabetical characters used to label the markers.
        const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        // Add some markers to the map.
        const markers = locations.map((position, i) => {
            const label = labels[i % labels.length];
            const marker = new google.maps.Marker({
                position,
                label,
            });

            // markers can only be keyboard focusable when they have click listeners
            // open info window when marker is clicked
            marker.addListener("click", () => {
                var contentString = findMarkByPos(position,datatemp)
                infowindow = new google.maps.InfoWindow({
                    content: contentString,
                });
                infowindow.open({
                    anchor: marker,
                    map,
                    shouldFocus: false,
                });
            });
            return marker;
        });

        // Add a marker clusterer to manage the markers.
        const markerCluster = new markerClusterer.MarkerClusterer({ map, markers });

    })

    //find a hospital by name
    const findOneHos = document.getElementById("findOneHos")
    findOneHos.addEventListener("click", () => {
        var hospitalName = getDataListName()
        var hospInfo = findHos(hospitalName)
        const uluru = { lat: hospInfo.Y, lng: hospInfo.X };
        map.setCenter(uluru);
        var contentString = getAllHospitalInf(hospInfo)
        const infowindow = new google.maps.InfoWindow({
            content: contentString,
        });
        const marker = new google.maps.Marker({
            position: uluru,
            map: map,
        });
        infowindow.open({
            anchor: marker,
            map,
            shouldFocus: false,
        });
        marker.addListener("click", () => {
            infowindow.open({
                anchor: marker,
                map,
                shouldFocus: false,
            });
        });
    })
}
window.initMap = initMap;

function findMarkByPos(posTem,datatemp){
    for(var i =0;i< datatemp.length;i++){
        var pos = { lat: datatemp[i].Y, lng: datatemp[i].X };
        if(posTem.lat == pos.lat && posTem.lng == pos.lng){
            var inf = getAllHospitalInf(datatemp[i])
            return inf
        }
    }
}

function findAllHosData(state, drg, distance, money) {
    var data_findAll = []
    for (var i = 0; i < data.length; i++) {
        if (data[i].state == state && data[i].DRG == drg) {
            data_findAll.push(data[i])
        }
    }
    return data_findAll

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

function getDataListName() {
    var name = $('#findOneHosInput').val();
    return name;
}

// change range value
function distrangeChange() {
    var value = document.getElementById("distanceRange").value
    document.getElementById("distanceSpan").innerHTML = value
}

function exprangeChange() {
    var value = document.getElementById("expenseRange").value
    document.getElementById("expenseSpan").innerHTML = value
}

//get all hospital information
function getAllHospitalInf(data) {
    const contentString =
        '<div id="content">' +
        '<div id="siteNotice">' +
        "</div>" +
        '<h1 id="firstHeading" class="firstHeading">' + data.NAME + '</h1>' +
        '<div id="bodyContent">' +
        '<p><b>City: </b>' + data.city + ', <b>Adress: </b>' + data.address + ', <b>Zip: </b>' + data.zip + '</p>' +
        '<p><b>DESC: </b>' + data.NAICS_DESC + '</p>' +
        '<p><b>Average Covered Charges: </b>' + data.AverageCoveredCharges + '</p>' +
        '<p><b>Average Total Payments: </b>' + data.AverageTotalPayments + '</p>' +
        '<p><b>Average Medicare Payments: </b>' + data.AverageMedicarePayments + '</p>' +
        '<p>TEL: ' + data.TELEPHONE + ',  <a href=' + data.WEBSITE + '>' + data.WEBSITE + '</a></p>' +
        "</div>" +
        "</div>";
    return contentString
}

//find hospital by name
function findHos(name) {
    var dataset = data1;
    for (var i = 0; i < dataset.length; i++) {
        if (name == dataset[i].NAME) {
            return dataset[i];
        }
    }
}

function queryList() {
    var add_options;
    for (var i = 0; i < data1.length; i++) {
        add_options += '<option data-id="' + data1[i].NAME + '" value="' + data1[i].NAME + '">' + data1[i].NAME + '</option>';
    }
    $("datalist#batch_list").append(add_options);

    var add_state_options;
    for (var i = 0; i < state.length; i++) {
        add_state_options += '<option value="' + state[i].state + '">' + state[i].state + '</option>';
    }
    $("select#stateSelection").append(add_state_options);

}



