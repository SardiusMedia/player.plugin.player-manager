/* eslint-disable */

var playerManager = {
  _sources:{
    video:[],
    audio:[]
  },
  _currentSrc:null,
  endTimeout:null,
  ready: function ready(fn, doc, addEvent) {
    doc = document, addEvent = 'addEventListener';
    doc[addEvent] ? doc[addEvent]('DOMContentLoaded', fn) : window.attachEvent('onload', fn);
    
    return this
  },
  debounce: function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  aspectRatio: function(args) {
    var ratio = [
      args.maxWidth / args.srcWidth,
      args.maxHeight / args.srcHeight
    ];
    ratio = Math.min(ratio[0], ratio[1]);
    return {
      width: args.srcWidth * ratio,
      height: args.srcHeight * ratio
    };
  },
  getVideoSize: function() {
    var videoSize = { height: 1, width: 1};
    var sourceList =    this._sources.video;
    var currentSrc = window.__player__.self.src();

    Array.prototype.slice.call(sourceList).forEach(function (source, index) {
      if ((__player__.hls) ? index == 0 : source.src === currentSrc) {
        videoSize.height = source.height
        videoSize.width = source.width;
      }
    });

    return videoSize;
  },
  setSources : function (sources){
     console.log("set srouces", sources)
    if(typeof sources == "object" ){
      console.log("source object found")
      this._sources = sources;
     
    }
    else{
       console.log("source object not found")
      this._sources = {
        audio:[],
        video:[],
      };
      var sourceList = document.getElementsByTagName('source');
      var t = this;
      
      Array.prototype.slice.call(sourceList).forEach(function (source, index) {
        playerManager._sources.video.push({
          id: index,
          selected: source.getAttribute('data-active'),
          label: source.getAttribute('data-label'),
          src: source.src,
          type: source.type
        });
      });
    }

    var player = window.__player__.self;
    if(!player){

      setTimeout(function(){
        playerManager.setVideoSources(sources)
      },5)
      return
    }
    console.log("menuData")
    player.trigger('menudataready', {
      menuData: this._sources,
      onChange: function () {
        playerManager.playSrc(this);
      }
    });

    return this

  },
  getSources: function() {
    return playerManager._sources;
  },
  setVideoSize: function (options) {
 /*   var video = document.body.firstElementChild || document.body.children[0];
    var ratio = this.aspectRatio({
      maxWidth: window.innerWidth,
      maxHeight: window.innerHeight,
      srcHeight: ((options) ? options.height : window.__player__.dimensions.height),
      srcWidth: ((options) ? options.width : window.__player__.dimensions.width)
    });

    video.style.height = ratio.height + 'px';
    video.style.width = ratio.width + 'px';
    window.__player__.dimensions.height = ratio.height;
    window.__player__.dimensions.width = ratio.width;*/
    return this
  },

  show: function() {
    var loadingItems = document.getElementsByClassName('js--loading');

    Array.prototype.slice.call(loadingItems).forEach(function (item) {
      item.className = item.className.replace(/\bjs--loading\b/, '');
    });
    return this
  },
  setActiveItem: function(index) {
    this._sources;
    
    for(var i=0; i<this._sources.video.length; i++){
      this._sources.video[i].selected = false;
    }

    if(this._sources.video[index]) {
      this._sources.video[index].selected = true;
    }

    return this
  },
  playAuto:function(){
   
    var bestDim = {
      index:0,
      dim:-1
    }

    for(var i=0; i<this._sources.video.length; i++){
      var source = this._sources.video[i];
      var curDim = Math.abs( (source.width*source.height)-(window.innerWidth*window.innerHeight));
      if(curDim < bestDim.dim || bestDim.dim == -1){
         bestDim.index = i;
         bestDim.dim = curDim
      }
    }
    playerManager.playSrc(this._sources.video[bestDim.index])
    return this
  },
  playUrl:function(){
     console.log("setSourc url")
    return this
  },
  playSrc: function(selection, auto) {
    if(typeof auto == "undefined"){
      auto = true;
    }

    var player = window.__player__.self;
    var currentTime = player.currentTime();
    console.log("setSource {type: "+selection.type+", src: "+selection.src+"}")
    window.clearTimeout(this.endTimeout)
    player.src({ type: selection.type, src: selection.src });
    if (!window.__player__.hls) {
      player.currentTime(currentTime);
    }
    if(auto){
      player.play();
    }

    if(selection.start && selection.start > 0){
      console.log("Starting At", selection.start)
      var start = selection.start;
      
      if(selection.startTime){
        start = start - ((Date.now()-selection.startTime)/1000)
      }

      player.currentTime(start)
    }

    if(selection.end && selection.end > 0){
      console.log("Starting At", selection.start)
      var end = selection.end;
      
      if(selection.endTime){
        end = end - ((Date.now()-selection.endTime)/1000)
      }

      console.log("END VIDEO IN:"+end)
    }


    this.setActiveItem(selection.id)
    this.setSources(this._sources)
    this.setVideoSize(this.getVideoSize());
    player.trigger('mediachange', { source: selection.label });
    return this
  }
  
};