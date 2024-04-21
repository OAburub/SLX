class StorylineXObject{
    constructor(object){
        this.getStorylineObject = function(){return object};
        if (object.currView){
            this.getElement = function(){return object.currView.el};
        }
        if (object.attributes){
            this.get = object.get;
        }
    }
}
class Scene extends StorylineXObject{
    constructor(scene){
        super(scene);
    }
}
class Slide extends StorylineXObject{
    constructor(slide, name){
        super(slide);
        this.name = name;
        if (slide.currView){
            slide.currView.el.addEventListener("mousemove", event =>{
                try{
                    console.hideWarnings();
                    GetPlayer().SetVar("mouse_pos_x", event.offsetX * DS.scaler.windowScale);
                    GetPlayer().SetVar("mouse_pos_y", event.offsetY * DS.scaler.windowScale);
                    console.unhideWarnings();
                }catch{}
            });
            slide.currView.el.addEventListener("mouseup", event =>{
                StorylineX.triggerEvent("mouseup_" + name);
            })
        }
    }
}
class SlideLayer extends StorylineXObject{
    constructor(layer, index){
        super(layer);
        this.index = index;
        this.getObjects = function(){return layer.objectIndex.map(e => new SlideObject(e))}
        this.getObjectByID = function(id){return new SlideObject(layer.attributes.objects._byId[id])}
        this.getObjectsAtPos = function(x, y){return layer.objectIndex.filter(e => {
            let pointer = e;
            let xPos = 0;
            let yPos = 0;
            while(pointer.get("id") != layer.get("id")){
                xPos += pointer.xPos();
                yPos += pointer.yPos();
                pointer = pointer.parent;
            }
            return xPos <= x && xPos + e.width() > x && yPos <= y && yPos + e.height() > y
        }).map(e => new SlideObject(e))}
    }
}
class SlideObject extends StorylineXObject{
    constructor(object){
        super(object)
        this.hide = object.hide;
        this.show = object.show;
        this.moveTo = object.moveTo;
        this.Id = object.get("id");
        this.slideTo = function(x, y, s){
            object.currView.el.style.transition = "transform " + String(s) + "s";
            object.moveTo(x, y);
            setTimeout(()=>{object.currView.el.style.transition = ""}, s * 1000);
        }
        object.currView.el.addEventListener("mouseup", event =>{
            StorylineX.triggerEvent("mouseup_object_" + object.get("id"));
        })
    }
}

let StorylineX = {};

DS.presentation.scenes().slice(2).forEach(scene => {
    StorylineX[scene.attributes.lmsId] = new Scene(scene);
    scene.slides().models.forEach(slide => {
        let name = slide.attributes.title.replace(" ", "_");
        while (name in StorylineX[scene.attributes.lmsId]){
            let match = name.match(/_(\d+)$/);
            name = match? name.replace(/_\d+$/, "_" + String(parseInt(match[1]) + 1).padStart(3, '0')) : name + "_001";
        }
        StorylineX[scene.attributes.lmsId][name] = new Slide(slide, name);
        let i = 0;
        slide.slideLayers().models.forEach(layer => {
            StorylineX[scene.attributes.lmsId][name]["layer_" + String(parseInt(i)).padStart(2, "0")] = new SlideLayer(layer, i);
            i += 1;
        })
    });
});
StorylineX.triggerEvent = function(string){
    try{
        console.hideWarnings();
        GetPlayer().SetVar("Event", string);
        setTimeout(() => {GetPlayer().SetVar("Event", "");}, 1);    
        console.unhideWarnings();
    }catch{}
}
StorylineX.wait = function(s){
    setTimeout(() => {this.triggerEvent("waited_" + String(s) + "_seconds");}, s * 1000)
}
console.hideWarnings = function(){
    console.oldWarn = console.warn;
    console.warn = new function(){};
}
console.unhideWarnings = function(){
    if (console.oldWarn) console.warn = console.oldWarn;
}

window.StorylineX = StorylineX;