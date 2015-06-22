




var Stack, currentTrackId, noCount = 0, authToken, uris = [], track, title, currentArtist;


    function bindings() { 
        $('.searchScreen').keyup(function(e){
            if(e.keyCode == 13)
            {
               artistSearch($('.searchBox input').val())
            }
        });

        $('.search').on('click', function(e){
               artistSearch($('.searchBox input').val())
        });

        $('.results .btn.save').on('click', function(){
            $('.buildScreen .info').hide();
            $('.saveScreen').show();
        })

        $('.btn.share').on('click', function(){
            window.open('http://www.twitter.com/share?url='+encodeURIComponent(window.location.origin + '/'+window.location.hash)+'&text=A '+ currentArtist +' vibe&hashtags=spotlst','twitsharer','toolbar=0,status=0,width=626,height=436');
        })

        $('.btn.restart').on('click', function(){
            location.reload(); 
        })



        $('.saveScreen .btn').on('click', function(){
            track.pause()
                if ($('.saveScreen input').val() == ""){
                    title = "Spotlst.com Playlist"
                } else {
                    title = $('.saveScreen input').val();
                }
            savePlaylist();
        })

        $('.card').on('touchstart', function(){
            $(this).addClass('tip');
        })
        $('.card').on('touchend', function(){
            $(this).removeClass('tip');
        })
                   
    }


    

     function artistSearch(artist) { 
        var url = 'https://api.spotify.com/v1/search?q='+artist+'&type=artist'
        $.get( url, function( data ) {
            $('.searchResults ul').html('');
            if(data.artists.items.length > 0){
                $(data.artists.items).each(function(i, artist ) {
                    if (artist.images.length > 0){
                        var image = artist.images[0].url;
                    } else {
                        image = "";
                    }
                    if(artist.name!=""){
                        $('.searchResults ul').append("<li style='background-image:url("+image+")' onclick=\"showBuildPage('"+artist.id+"')\" class=\"grad\"><h2>"+artist.name+"</h2></li>")
                    }
                });
            } else {
                $('.searchResults ul').append("<li><h2>NO RESULTS</h2></li>")
            }
        });
     }


    $(window).ready(function(){  

        var w= $(window).width();
        $('.cover').height(w);
        $('.app').width(w);  
        // $('.view').width(w);

        track = new Audio();

        bindings();

        stack = window.gajus.Swing.Stack({
        throwOutConfidence: function (offset, element) {
            return Math.min(Math.abs(offset) / (element.offsetWidth/3), 1);
            }
        });


        stack.on('throwout', function (e) {
            if (e.throwDirection == -1){
                //no

                if(noCount < 5){
                    noCount ++;
                    getRelatedArtists(currentArtistId)
                } else {
                    var artist = firstReults.artists[Math.floor(Math.random()*firstReults.artists.length)];
                    getRelatedArtists(artist.id)
                }
       
                

            } else if (e.throwDirection == 1){
                noCount = 0;
                //yes
                if($(".results .btn").is(':visible') == false){
                    $('.results .btn').show();
                }
                addTrackToPlaylist(currentTrackId, $('.meta h2').html(), $('.meta h3').html());
                uris.push('spotify:track:'+currentTrackId);
                getRelatedArtists(currentArtistId)
                $('.btn-cont').show();
 
            }


            
        });

        if(window.location.hash) {
            showBuildPagePre(window.location.hash.substring(1));
        }
    })

    function yes(){
               noCount = 0;
                //yes
                if($(".results .btn").is(':visible') == false){
                    $('.results .btn').show();
                }
                addTrackToPlaylist(currentTrackId, $('.meta h2').html(), $('.meta h3').html());
                uris.push('spotify:track:'+currentTrackId);
                getRelatedArtists(currentArtistId)
                $('.btn-cont').show();
    }

    function no(){

                if(noCount < 5){
                    noCount ++;
                    getRelatedArtists(currentArtistId)
                } else {
                    var artist = firstReults.artists[Math.floor(Math.random()*firstReults.artists.length)];
                    getRelatedArtists(artist.id)
                }
    }


 function showBuildPage(artistId){
    window.history.pushState("", "", "/#"+artistId);
    track.play();
    $('.searchScreen').hide();
    $('.buildScreen').show();
    getRelatedArtists(artistId);

    cards = [].slice.call(document.querySelectorAll('.card'));

    cards.forEach(function (targetElement) {
        stack.createCard(targetElement);
    });


 }

  function showBuildPagePre(artistId){
    window.history.pushState("", "", "/#"+artistId);
    track.play();
    $('.searchScreen').hide();
    $('.buildScreen').show();
    getRelatedArtists(artistId);

    cards = [].slice.call(document.querySelectorAll('.card'));

    cards.forEach(function (targetElement) {
        stack.createCard(targetElement);
    });
 }


 var inital = true;
 var firstReults;

 var currentArtists;
 var currentArtistId;

function getRelatedArtists(artistId){
   var url = 'https://api.spotify.com/v1/artists/'+artistId+'/related-artists'
    $.get( url, function( data ) {
        if (inital == true){
            firstReults = data;
            inital = false;
        }
        currentArtists = data;
        var artist = data.artists[Math.floor(Math.random()*4)];
        getTrackInfo(getOneArtistsTopTracks(artist.id))
        currentArtistId = artist.id;
    });
}

function getOneArtistsTopTracks(artistId){
    var url = 'https://api.spotify.com/v1/artists/'+artistId+'/top-tracks?country=GB'
    var trackId = null;
    $.ajax({
        url: url,
        type: 'get',
        async: false,
        success: function(data) {
            var track = data.tracks[Math.floor(Math.random()*data.tracks.length)];
            trackId =  track.id;
        } 
     });
    window.history.pushState("", "", "/#"+artistId);
     return trackId;
}

function getTrackInfo(trackId){
    var url = "https://api.spotify.com/v1/tracks/"+trackId;
    $.get( url, function( data ) {
      setUpCard(data)
    });
}


function setUpCard(data){
    currentTrackId = data.id;
    if (data.album.images.length > 0){
        var image = data.album.images[0].url;
    } else {
        image = "";
    }

    var imageObj = new Image();
    imageObj.src = image;
    imageObj.onload = function(){
        $('.card .cover').css({'background-image' : 'url('+this.src+')'})
        $('.card h2').html(data.artists[0].name)
        $('.card h3').html(data.name)
        track.src = data.preview_url;
        track.play();
        
        stack.getCard(cards[0]).throwIn(150, -500);  
    };

    currentArtist = data.artists[0].name;
}



function addTrackToPlaylist(id, artist, title){
    $('.results ul').prepend('<li class="'+currentTrackId+'"><h2>'+artist+'</h2><h3>'+title+'</h3><span class="del" onclick="delTrack(\''+currentTrackId+'\')"><i class="fa fa-times"></i></span></li>')
}

function savePlaylist(){

    track.pause()

    var ref = window.open( "https://accounts.spotify.com/authorize?client_id=62660cbc9c6d4e17937f8be3d36e075f&redirect_uri=http://spotlst.com/auth.html&scope=playlist-modify-private+playlist-modify-public&response_type=token", "_blank",'location=yes');
    ref.addEventListener('loadstart', function(e) {
        if (e.url.indexOf("access_token") >= 0){
            var first = e.url.split("access_token=").pop();
            var auth = first.substr(0, first.indexOf('&token')); 
            console.log(auth);
            message(auth);
            ref.close();
        }
    });
}


function message(token){
    auth = token;
    var url = 'https://api.spotify.com/v1/me'

        $.ajax({
         url: url,
         beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer '+token);},
         type: "GET",
         success: function(data) {
          createPlaylist(data.id)
        }
      });
}

function createPlaylist(userId){
    $.ajax({
         url: "https://api.spotify.com/v1/users/"+userId+"/playlists",
          headers: {
               'Authorization':'Bearer '+auth,
                'Content-Type':"application/json"
            },
         type: "POST",
         data: "{\"name\":\""+title+"\"}",
         success: function(response) {
            addTracksToPlaylist(userId, response.id)
        }
      });
}

function addTracksToPlaylist(userId, playlistId){
    var tracks = uris.join(",");

    $.ajax({
         url: "https://api.spotify.com/v1/users/"+userId+"/playlists/"+playlistId+"/tracks?uris="+tracks,
          headers: {
               'Authorization':'Bearer '+auth,
                'Content-Type':"application/json"
            },
         type: "POST",
         success: function(response) {
            console.log(response)
        }
      });

    $('.saveScreen h2').show();
    $('.saveScreen .btn').html('Make another playlist');
    $('.saveScreen .btn').unbind();
    $('.saveScreen input').hide();
    $('.savescreen .info').hide();
    $('.saveScreen .btn').on('click', function(){
        location.reload(); 
    })
    
}


function delTrack(uri){;
    var item = 'spotify:track:'+ uri;
    uris.splice( $.inArray(item, uris), 1 );
    $('.'+uri).remove();
}


