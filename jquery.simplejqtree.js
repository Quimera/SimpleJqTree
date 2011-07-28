(function($) {

    //helper function
    function attr_instancer(attr, toinstance){
        var result = {};
        $.each(attr, function(){
            result[this] = toinstance[attr[this]];
        });
              
        return result;
    }
    /**
     *  @constructor
     *  @param jqElement item, The root element for the tree
     *  @param {Object} conf, the conf dictionary 
     */
    function SimpleJqTree( item, conf ) {
    
        var self = this, 
            trigger = item.add(self),
            json_attr = conf.json_attr;
        
        item.addClass('tree');
        //methods
        $.extend(self, {
            /**
             * Converts and enhances a basic <ul> tree with the elements needed
             * by simplejqtree
             * @param jqElement tree, some top node in a ul tree
             */
            markup: function(tree){
                var $tree = tree,
                    placeholder = '<img class="dummy" alt="icon" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==">',
                    branches = $tree.find('li').prepend(placeholder);
                self.items = $tree.find('a').prepend($(placeholder).addClass('icon'));

                branches.each(function() {
                    var container = $(this).find('> ul').addClass('container');

                    if (container[0]) {
                        $(this).addClass('folderish')
                                        .children('img').addClass('arrow');
                    }
                });
            },
            
            /*
             * Converts a json input into a <ul> tree
             * @param json, a json object
             * @return tree, the ul tree
             */
            build_from_JSON: function(json) {
                var tree = $('<ul class="root container"><ul/>'),
                    stack = [];

                stack.push($(json));
                
                //Depth First Search
                while(stack[0]){
                    currentnode = stack.shift();
                    
                    $.each(currentnode, function(i, node){
                        //lets fletch the json attrs
                        attr = attr_instancer(json_attr, node);
                                            
                        //node markup
                        li = $('<li><a href="#">' + this.title + '</a></li>');
                        li.find('> a').addClass(node.metatype)
                                      .attr(attr);
                        tree.append(li);
                        
                        if (node.children){
                            //has children, then is a container.
                            tree = tree.find('li:last').append('<ul/>')
                                                       .find('> ul');
                            stack.push(node.children);
                        } else {
                            if (node.folderish){
                                tree.find('li:last').append('<ul/>')
                                                    .find('> ul')
                                                    .addClass('container');
                            }
                        }
                    });
                }
                
                tree = tree.hasClass('root') ? tree : tree.parents('.root');
                return tree;
            },

            /*
             * Manage the actions to do when an element of the tree is "clicked"
             * @param e, an event handler
             */
            click: function(e){
                var $this = $(e.currentTarget),
                    container = $this.siblings('.container'),
                    branch = $this.parent('.folderish');
                
                //bind the trigger event for close and open
                //and manage the ajax handler
                if (container[0]) {
                    if (container.html() === '' && conf.ajax_handler) {
                        //ajax call
                        self.ajax_call($this, branch);
                    } else {
                        self.slide(container);
                    }
                } else {
                    conf.action_handler($this);
                }
            },

            /*
             * Hides and shows an element, uses the current state of 
             * the objective to apply the effect.
             * @param container, a html element to hide/show
             */
            slide: function(container) {
                var branch = container.parent('.folderish');
                if (container.css('display') == 'none') {
                    container.slideDown('fast', function() {
                        branch.addClass('opened');
                    });
                } else {
                    container.slideUp('fast', function() {
                        branch.removeClass('opened');
                    });
                }
            },
            
            /*
             * Takes the ajax_handler function and extends a default set to do
             * a custom ajax call. The results are going to be passed again to
             * the simplejqtree plugin
             * @param trigger
             * @param branch
             */
            ajax_call: function(trigger, branch){
                //lets make an instantiation of the ajax_handler function if exists
                if ($.isFunction(conf.ajax_handler.data) || conf.ajax_handler.data_back) {
                    conf.ajax_handler.data_back = conf.ajax_handler.data_back ? conf.ajax_handler.data_back : conf.ajax_handler.data;
                    conf.ajax_handler.data = conf.ajax_handler.data_back(trigger);
                }
                
                var ajax_extended = $.extend(conf.ajax_handler, {
                    'dataType': 'json',
                    'success': function(data) {
                        var result = self.build_from_JSON(data);
                        $(branch).find('> ul').remove();
                        branch.append(result);
                        result.simplejqtree(conf);
                        self.slide(result);
                    }
                });

                $.ajax(ajax_extended);            
            }
            
        });

        //adjust markup
        self.markup(item);
        
        //events setup
        self.items.each(function(){
            var $this = $(this);
            
            $this.bind('click.simplejqtree', function(event) {
                //TODO we can mantain a list of nodes in memory, then access those nodes
                //using an index, in that way we can save some instantiations and
                //jquery traversing

                self.click(event);         
                return event.preventDefault();
            });
            
            //little arrows should launch the click event
            $this.siblings('.arrow').click(function() {
                $this.trigger('click.simplejqtree');
            });
            
        });
    }

    // jQuery plugin implementation
    $.fn.simplejqtree = function(options) {

        // already instanced, return the data object
        var el = this.data("simplejqtree");
        if (el) { return el; }

        //default settings, maybe its a good idea move this to a general conf
        var settings = {
            'ajax_handler': {}, //the ajax method used to do the ajax call
            'action_handler': {}, //the action to trigger when a non-folderish item is "clicked"
            'json_attr':{
                'id':'id',
                'href':'href',
                'rel':'rel'
            }
        };

        if (options) {
            $.extend(settings, options);
        }
        
        return this.each(function() {
            el = new SimpleJqTree($(this), settings);
            $(this).data("simplejqtree", el);
        });
    };
})(jQuery);
