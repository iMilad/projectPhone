$( document ).ready( function() {
  document.addEventListener("deviceready", onDeviceReady, false);
});

var serverURL = '127.0.0.1:20001/t3/';

// device APIs are available
function onDeviceReady() {
  console.log( 'Device ready' );

  navigator.geolocation.getCurrentPosition(function(pos){
    alert( pos.coords.latitude + ' / ' + pos.coords.longitude );
  });

  // Get all the projects
  $.ajax({
  		url:serverURL+'project',
  		type:'GET',
  		success:function(data) {
        try {
          data = JSON.parse( data );
        } catch(err) {
          console.log("Error to get");
        }

        var project = data.project;
        for ( var i in project ) {
          $( '<option value="'+project[i].id+'">' ).html( project[i].name ).appendTo( '.projectList' );
        }
  		},
      error:function(err) {
        alert( 'ERROR' + err );
      }
  	});

    $( '#login' ).on( 'click', function(e) {
        e.preventDefault();
        projectList();
    });
}

$( document ).on('submit','form',function(e) {
  e.preventDefault();
});

var point;

var projectList = function() {
    $( '#code' ).removeClass( 'err' );
    $( '.error' ).hide();
    var code = $('.code').val();
    var project = $('.projectList').val();

    if ( code !== '' && project !== '' ) {

      $.ajax({
          url:serverURL+'project/'+project+'/getpoint',
          data:{"password":code},
          type:'POST',
          success:function(data) {
            try {
              data = JSON.parse(data);
            } catch(err) {}

            if (data == 'Unauthorized') {
              $('#code').addClass('err');
              $('.error').show();
              return;
            }

            if (data.point.length === 0) {
              alert( 'No points in project' );

            } else {
              $('#screen2').show();
              $('#screen1').hide();
              $( '#projectName' ).html( $('.projectList option:selected').html() );
              point =  data.point;
              pointLoad();
            }

          },
          error:function(){
            //When the code is wrong
            $( '#code' ).addClass( 'err' );
            $( '.error' ).show();
          }
        });
      } else {
          alert( 'Choose Project or give the code.' );
      }
};

var pointLoad = function() {
  for ( var i in point ) {
    $( '<option value="'+i+'">' ).html( 'Latitude: ' +point[i].lat+ ' - ' + 'Longitude: ' + point[i].lng ).appendTo( '.pointList' );
  }
};

var selectedPoint;

$( document ).on( 'change', '.pointList', function() {

  // SELECT point...
  if ( $('.pointList').val() === '' ) { $('#checker').hide(); selectedPoint = false; return; }
  $('#checker').show();
  selectedPoint = point[ $('.pointList').val() ];
  console.log( selectedPoint );
  checkDistance();
});


var checkDistance = function() {
  if ( !selectedPoint ) return;
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
};


$('#back').on ( 'click', function() {
  document.location.reload();
});

// Current Position
var onSuccess = function(position) {
  var d = distanceInKm(position.coords.latitude,position.coords.longitude,selectedPoint.lat,selectedPoint.lng );
  d = d*1000;

  if ( d < $('#distance').val()*1  ) {
    $('.check').css({'background-color':'green'});
  } else {
    $('.check').css({'background-color':'red'});
  }

  setTimeout( checkDistance, 1000*10 );
};

function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}


// Calculate Distance
function distanceInKm(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
      c(lat1 * p) * c(lat2 * p) *
      (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
