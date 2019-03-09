class Slider{
    constructor(elementID, value, ...valueList){
        this._value = value || 0;
        this._valueList = valueList || [];
        this.mousePressed = false;
        var self = this;
        this.availWidth = window.screen.availWidth;
        setInterval(()=>{
            $(".slider-range:visible").each(function(){
                var availWidth = window.screen.availWidth;
                if(self.element != this){
                    self.element = this;
                    self.reconstruct();
                    return;
                }
                if(this.availWidth != availWidth){
                    this.availWidth = availWidth;
                    self.reconstruct();
                }
            });
        }, 300);
        $(document).bind("touchend",(event) => this.touchEnd(event));
        $(document).bind("touchcancel",(event) => this.touchEnd(event));
        
    }
    reconstruct(){
        $(this.element).parent().unbind("mouseup").bind("mouseup",(event) => this.mouseUp(event));
        $(this.element).parent().unbind("mousedown").bind("mousedown",(event) => this.mouseDown(event));
        $(this.element).parent().unbind("mousemove").bind("mousemove",(event) => this.mouseMove(event));
        $(this.element).parent().unbind("touchmove").bind("touchmove",(event) => this.touchMove(event));
        $(this.element).parent().unbind("touchend").bind("touchend",(event) => this.touchEnd(event));
        $(this.element).parent().unbind("touchcancel").bind("touchcancel",(event) => this.touchEnd(event));
        
        $(this.element).parent().find(".slider-numbers").html("");
        var size = ($(this.element).width() / this._valueList.length);
        size = parseInt(size);
        this.halfSize = size / 2;
        this.positions = [];
        for(var i in this._valueList){
            this.positions.push(size * (parseInt(i) +1));
            $(this.element).parent().find(".slider-numbers").append(`<span style="width:${size}px">${this._valueList[i]}</span>`);
        }
        this.moveByValue(this.value);
    }
    mouseDown(event){
        this.mousePressed = true;
    }
    mouseUp(event){
        this.mousePressed = false;
        var x = event.pageX - $(this.element).offset().left;
        this.move(x);
    }
    touchEnd(event){
        if( event.originalEvent.touches[0]){
            var x = event.originalEvent.touches[0].pageX - $(this.element).offset().left;
            this.move(x);
        }
    }
   
    mouseMove(event){
        if(this.mousePressed){
            var x = event.pageX - $(this.element).offset().left;
            if(x > $(this.element).width()){
                x = $(this.element).width();
            }
            if(x < 0){
                x = 0;
            }
            $(this.element).find(".slider-completed-background").attr("style", `width:${x}px;`);
            $(this.element).find(".slider-pointer").attr("style", `left:${x}px;`);
        }
    }
    touchMove(event){
        if( event.originalEvent.touches[0]){
            var x = event.originalEvent.touches[0].pageX - $(this.element).offset().left;
            if(x > $(this.element).width()){
                x = $(this.element).width();
            }
            if(x < 0){
                x = 0;
            }
            $(this.element).find(".slider-completed-background").attr("style", `width:${x}px;`);
            $(this.element).find(".slider-pointer").attr("style", `left:${x}px;`);
        }
    }
  


    move(x){
        var index = -1;
        for(var i in this.positions){
            if(x <= this.positions[i]){
                index = parseInt(i);
                break;
            }
        }
        this.moveByIndex(index, true);
    }
    
    moveByValue(value){
        var index = this._valueList.indexOf(value);
        this.moveByIndex(index || 0, false);
    }
    moveByIndex(index, triggerEvents){
        if(index >= this.positions.length){
            index = this.positions.length - 1;
        }
        if(index < 0){
           index  = 0;
        }
        var value = this.positions[index];
        var size = 0;
        if(index > 0){
            size = value - this.halfSize;
        }
        if(index == this.positions.length -1){
            size = value;
        }
       $(this.element).find(".slider-completed-background").attr("style", `width:${size}px;`);
       $(this.element).find(".slider-pointer").attr("style", `left:${size-13}px;`);

       if(typeof this.callback == "function" && triggerEvents){
            this.callback(this._valueList[index]);
        }
    }

    onChange(callback){
        this.callback = callback;
    }
    set value(value){
        this._value = value;
        this.moveByValue(value);
    }
    get value(){
        return this._value;
    }
    set valueList(value){
        this._valueList = value;
        this.reconstruct();
    }
    get valueList(){
        return this._valueList;
    }
}
export default Slider;