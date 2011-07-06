(function( $ ){

  $.fn.simplejqtree = function( options ) {  

    var settings = {
      'location'         : 'top',
      'background-color' : 'blue'
    };

    return this.each(function() {        
      if ( options ) { 
        $.extend( settings, options );
      }

      //lets format the tree
      tree_elements = $.fn.simplejqtree.formatMarkup(this);
      $.fn.simplejqtree.eventsSetup( tree_elements );

    });

  };
  
  //Public functions
  $.fn.simplejqtree.formatMarkup = function( tree ) {
  
    var empty_image = '<img class="dummy" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==">';
    var items = $('a', tree).prepend($(empty_image).addClass('icon'));
    var branches = $('li', tree).prepend(empty_image);
    
    branches.each(function(){
      var container = $('> ul', $(this)).addClass('container');
      
      if (container[0]) {
        $(this).addClass('folderish').children('img').addClass('arrow');
      }
      
    });
    
    $(tree).addClass('tree');
    
    return items;
  };
  
  $.fn.simplejqtree.eventsSetup = function( items ) {
    items.click(
      function(event){
        event.preventDefault();      
        var container = $(this).siblings('.container');
        var branch = $(this).parent('.folderish');
        
        if (container.css('display') == 'none'){
          container.slideDown('fast', function(){
            branch.addClass('opened');          
          });
          
        } else {
          container.slideUp('fast', function(){
            branch.removeClass('opened');                    
          });
        } 
      }
    );
  };
  
  $.fn.simplejqtree.buildFromJSON = function (json) {
    //
  };
})( jQuery );
