var s,
    g,
    stars,
    bars,
    dotUnit = 15,
    progress,
    duration,
    fadeout = 6.8,
    uniqueEvents = [],
    prevEvent = [],
    currentEvent,
    tally = 0;
    index = 0;
    count = 0,
    totals = 0,
    accentColor = 'darkred';

docReady(function(){
  Snap.load('media/BlankMap-World6.svg', function ( loadedFragment ) {
      onSVGLoaded(loadedFragment);
  });
  s = Snap('#world');
  //g = s.group();

});

function onSVGLoaded( data ){ 
  s.append( data );
  g = s.g();

  var map = Snap('#world6'),
      bb = map.getBBox(),
      vb = map.attr('viewBox');
  g.add(map);
  //s.attr('viewBox', vb);

  g.attr({
    'transform': 'matrix(1,0,0,1,' + vb.x + ',' + vb.y + ')'
  });

  initDrag();
  labelAxis();


  changeColors();
  addLocations();
  //animateTravel();
}

function changeColors(){
  var land = g.selectAll('.st0, .st1, .st2, .st3').attr({
    fill: '#cccccc'
  })
}

function initDrag(){
   g.attr({
    transform: 's1.5,1.5,-370,-250', 
    cursor: '-webkit-grab'
  });
  g.mousedown(function(){
    g.attr({
      cursor: '-webkit-grabbing'
    })
  })
  g.mouseup(function(){
    g.attr({
      cursor: '-webkit-grab'
    })
  })
  //g.hover( hoverover, hoverout );
  //g.text(300,100, 'hover over me');

  var us = g.select('#us');
  g.drag(move, start, stop );
}

var move = function(dx,dy) {
  this.attr({
      transform: this.data('origTransform') + (this.data('origTransform') ? "T" : "t") + [dx, dy]
  });
}

var start = function() {
  this.data('origTransform', this.transform().local );
}
var stop = function() {
  console.log('finished dragging');
}

var hoverover = function() { g.animate({ transform: 's2r45,150,150' }, 1000, mina.bounce ) };
var hoverout = function() { g.animate({ transform: 's1r0,150,150' }, 1000, mina.bounce ) };

function addLocations(){
  var radius = 4.5,
      l = data.length; // var data is defined in media/data.js
      

  starsLocations = [];
  stars = g.g().addClass('stars'); // creates a group element

  for (var i=0; i<l; i++){

    var date = data[i].startDate,
        locL = locations.length,
        starStops = [],
        startX,
        startY,
        posX,
        posY,
        endX,
        endY,
        star;

    // iterate over each element in the array
    for (var j=0; j<locL; j++){

      //check for empty start and end locations
      if (data[i].from == '-'){
        data[i].from = data[i].location;
      }
      if (data[i].to == '-'){
        data[i].to = data[i].location;
      }

      // look for the entry with a matching starting `location` value
      if (locations[j].location == data[i].from){
         startX = locations[j].x;
         startY = locations[j].y;
      }
      // look for the entry with a matching destination `location` value
      if (locations[j].location == data[i].location){
         posX = locations[j].x;
         posY = locations[j].y;
      }
      // look for the entry with a matching ending `location` value
      if (locations[j].location == data[i].to){
         endX = locations[j].x;
         endY = locations[j].y;
      }
    }

    if (!startX) {startX = posX;}
    if (!startY) {startY = posY;}
    if (!endX) {endX = posX;}
    if (!endY) {endY = posY;}

    starStops.push([startX, startY], [posX, posY], [endX, endY]);


    //dot = g.circle(posX, posY, radius);
    star = g.path('M 0.000 15.000,L 23.511 32.361,L 14.266 4.635,L 38.042 -12.361,L 8.817 -12.135,L 0.000 -40.000,L -8.817 -12.135,L -38.042 -12.361,L -14.266 4.635,L -23.511 32.361,L 0.000 15.000');

    star.attr({
      transform: 's.15,.15,' + startX*1.18 + ',' + startY*1.18, 
      id: 'e-' + i,
      'data-event': data[i].event,
      'data-location': data[i].location,
      'data-sd': data[i].startDate,
      'data-ed': data[i].endDate,
      class: 'event',
      fill: '#00a99d',
      opacity: 0
    });

    // Adds the use element to our group
    stars.add(star);
    starsLocations.push(starStops);
  }

  shootStar(0);

}

function updateInfoBox(i){
  var box = document.getElementById('info-box'),
      html = '';

  html += 'Event: <span>' + data[i].event + '</span><br />';
  html += 'Location: <span>' + data[i].location + '</span><br />';
  html += 'Info: <span><a href="' + data[i].website + '" target="_blank">' + data[i].website + '</a></span><br />';
  html += 'Date: <span>' + data[i].startDate + '</span><br />';

  box.innerHTML = html;
}

function shootStar(i){
  var thisStar = stars[i],
      destMatrix = new Snap.Matrix(),
      returnMatrix = new Snap.Matrix();
  if (starsLocations[i]){
    var locations = starsLocations[i],
        destX = locations[1][0],
        destY = locations[1][1],
        returnX = locations[2][0],
        returnY = locations[2][1];

    destMatrix.translate(destX,destY);
    destMatrix.scale(.15, .15);
    // show star
    thisStar.animate({
      opacity: 1
    }, 500, mina.easeinout);
    // move star to destination/location position
    thisStar.animate({
      transform: destMatrix
    }, 1000, mina.easeinout, function(){

      updateInfoBox(i);

      returnMatrix.translate(returnX,returnY);
      returnMatrix.scale(.15, .15);

      var name = thisStar.attr('data-location');
      var clones = s.selectAll('.clone[data-location="' + name + '"]');
      // if a clone doesn't already exist, create one
      if (clones.length == 0){
        var clone = thisStar.clone();
        clone.attr({
          class: 'clone'
        }).hover(function(){
          this.attr({
            fill: '#222222',
            cursor: 'pointer'
          });
        }, function(){      
          this.attr({
            fill: '#00a99d',
            cursor: '-webkit-grab'
          });
        });
        stars.add(clone);
      };

      setTimeout(function(){
        // move star to return position
        thisStar.animate({
          transform: returnMatrix
        }, 1000, mina.easeinout, function(){
          // hide star
          thisStar.attr({
            opacity: 0
          });
          //repeat for next location
          i++;
          shootStar(i);
        });
      }, 2000);
    });
  }
}


function bigButtons(){
  //play button stuff
  var playMatrix = new Snap.Matrix();
  playMatrix.scale(.4,.4);            // play with scaling before and after the rotate
  playMatrix.translate(660, 210);

  var playbg = s.rect(0,0,180,183).transform(playMatrix).attr({
    fill: '#444444'
  });
  var play = s.polyline([45,40,140,90,45,140]).transform(playMatrix).attr({
    fill: '#fff'
  });

  var playgroup = s.group();
  playgroup.add(playbg, play);
  playgroup.attr({
    class: 'playgroup',
    cursor: 'pointer',
    opacity: .9
  });
  playgroup.hover(function(){
    playgroup.animate({
      opacity: 1
    }, 250, mina.easeinout)
  }, function(){
    playgroup.animate({
      opacity: .9
    }, 250, mina.easeinout)
  });


  playgroup.click(function(){
    var scale = 0;
    playgroup.animate({
      //transform: miniMatrix
      opacity:0
    }, 250, mina.easeinout, function(){
      this.remove();
    });
    document.getElementById('playBtn').click();
  })
}

function labelAxis(){

  // creates a group element
  bars = s.g().addClass('bars');

  duration = data.length;

  for (var i=0, l=data.length; i<l; i++){
    var date = data[i].startDate,
        total = data[i].event,
        location = data[i].location,
        b2s = i,///2.01, //beats to seconds
        percent = b2s/duration,
        posX = s.attr('viewBox').width * percent + 10, //plus 10 to visually center timeline
        posY = s.attr('viewBox').height-3;

    var incident = s.rect(posX, posY, 3, 3);
    incident.attr({
      fill: '#aaaaaa',
      class: 'bar'
    }).data({
      'date': date,
      'location': location,
      'total': total
    }).click(function(){
      tooltip(this, posY);
    }).hover(function(){
      tooltip(this, posY);
    }, function(){
      s.select('#ttip-data').remove();
    });




    if ( (i == 0) || (i == l-1) ){
      var splitDate = date.split('-'),
          //label = parseInt(splitDate[0]) + '/' + splitDate[2],
          //label = splitDate[2],
          label = date,
          t1;
      if (i == l-1){
        t1 = s.text(posX-38, posY, label); //minus 15 due to extra time at end of audio track
      } else {
        t1 = s.text(posX, posY, label);
      }
      t1.attr({
        fill: '#666666',
        'font-size': 8,
        'transform': 'matrix(1,0,0,1,140,160)'
      });
    } 

    // Adds the use element to our group
    bars.add(incident);
    bars.attr('transform', 'matrix(1,0,0,1,140,170)');
  }
}


function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
}


function progressBar(audio){
  var acurrent = audio.currentTime,
      length = uniqueEvents.length,
      percent = acurrent/(duration - fadeout),
      maxWidth = s.select('#xaxis').attr('width'),
      newWidth = (s.attr('viewBox').width - dotUnit/2) * percent + 1;

  if (newWidth <= maxWidth) {
    progress.animate({
      'width': newWidth
    }, 300);
  }
}


function addEvents(audio){
  var acurrent = audio.currentTime,
      length = uniqueEvents.length;

  for (var i = 0; i < length; i++) {
    var beat = uniqueEvents[i][1];
        next = 0;

    if (uniqueEvents[i+1]){
      next = uniqueEvents[i+1][1];
    }

    if ( (acurrent >= beat-.25) || (acurrent >= beat+.25) && (acurrent < next) ) {
      currentEvent = uniqueEvents[i];
      index = i;
    } 
  }

  if (currentEvent[0] == prevEvent[0]) {
    // same event
    var html = 'Last incident: <span>' + currentEvent[0] + '</span><br />';
    html += 'Location: <span>' + currentEvent[3] + '</span><br />';
    html += 'Fatalities: <span>' + currentEvent[2] + '</span>';
    document.getElementById('info-box').innerHTML = html;
  } else {
    // new event
    animateDots(currentEvent);
    var bar = s.selectAll('rect.bar')[index],
        clone = bar.clone(),
        speed = (duration/bar.getBBox().width)*10;

    clone.before(bar)
    .attr({
      'fill': accentColor,
      'width': 0,
      'height': 0,
      'class': 'clone'
    })
    .animate({ 
      'width': bar.getBBox().width,
      'height': bar.getBBox().height
    }, 1500, mina.linear)
    .click(function(){
      tooltip(bar, bar.attr('y')-dotUnit/2);
    })
    .hover(function(){
      tooltip(bar, bar.attr('y')-dotUnit/2);
    }, function(){
      s.select('#ttip-data').remove();
    });
  }

  if ( (acurrent > uniqueEvents[length - 1][1]-.25) && (acurrent < (uniqueEvents[length - 1][1]) ) ){
    animateDots(uniqueEvents[length-1]);
  }

  prevEvent = currentEvent;

}


function restart(){
  document.getElementById('ms-timeline').innerHTML = '';
  var audio = document.getElementById('track');
  if(audio.ended){
    rewind(audio);
  } else {
    rewind(audio); 
  }
}
function rewind(audio){
  resetGlobals();
  audio.pause();
  audio.currentTime = 0;
  initGraphic();
  audioData(audio);
  audio.play();
  document.getElementById('pauseBtn').style.display = 'inline';
  document.getElementById('playBtn').style.display = 'none';
}
function resetGlobals(){
  s.selectAll('.bars').remove();
  s.selectAll('.dots').remove();
  s.selectAll('rect').remove();
  s.selectAll('text').remove();
  dotUnit = 15;
  dots = [];
  bars = [];
  progress = '';
  duration = 226.063688;
  uniqueEvents = [];
  prevEvent = [];
  currentEvent = [];
  tally = 0;
  index = 0;
  count = 0;
  totals = 0;
}