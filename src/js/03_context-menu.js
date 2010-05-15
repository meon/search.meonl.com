(function($){
    jQuery.fn.contextMenu = function(options){
        var defaults = {
            menuClass: 'contextMenu',
            offsetX  : 4,
            offsetY  : 4,
            speed    : 'fast'
        };
        var options   = $.extend(defaults, options);
        var menuClass = '.' + options.menuClass;
        return this.each(function(){
            $(this).click(function(e){
                var menu    = $(menuClass);
                var offsetX = e.pageX + options.offsetX;
                var offsetY = e.pageY + options.offsetY;
                if(menu.css('display') == "none"){
                    menu.show(options.speed);
                    menu.css('display','block');
                    menu.css('top',offsetY);
                    menu.css('left',offsetX);
                }
                else {
                    menu.hide(options.speed);
                }
                return false;
            });
            $(menuClass).hover(function(){}, function(){$(menuClass).hide(options.speed);})
        });
    };
})(jQuery);

