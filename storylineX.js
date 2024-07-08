class StorylineXObject{
    constructor(object){
        this.getStorylineObject = function(){return object};
        if (object.currView){
            this.getElement = function(){return object.currView.el};
        }
        if (object.attributes){
            this.get = function(t){return object.get(t)}
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
        this.listenToMouseEvents = function(){
            if (slide.currView){
                slide.currView.el.addEventListener("mousemove", event =>{
                    event.stopPropagation()
                    try{
                        console.hideWarnings();
                        let x = event.clientX - slide.currView.el.getBoundingClientRect().x
                        let y = event.clientY - slide.currView.el.getBoundingClientRect().y
                        GetPlayer().SetVar("mouse_pos_x", x / DS.scaler.windowScale);
                        GetPlayer().SetVar("mouse_pos_y", y / DS.scaler.windowScale);
                        console.unhideWarnings();
                    }catch(e){
                    }
                });
                slide.currView.el.addEventListener("mouseup", event =>{
                    event.stopPropagation()
                    StorylineX.triggerEvent("mouse_up_" + name);
                })
            }
        }
        this.nextSlide = function(){return slide.collection.models[slide.slideNumberInScene()]}
        this.prevSlide = function(){return slide.collection.models[slide.slideNumberInScene() - 2]}
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
        this.hide = function(){object.hide()};
        this.show = function(){object.show()};
        this.moveTo = function(x, y){object.currView.moveTo(x, y)};
        this.Id = object.get("id");
        this.slideTo = function(x, y, s){
            object.currView.el.style.transition = "transform " + String(s) + "s";
            object.currView.moveTo(x, y);
            setTimeout(()=>{object.currView.el.style.transition = ""}, s * 1000);
        }
        this.listenToMouseEvents = function() {
            object.currView.el.addEventListener("mouseup", event =>{
                event.stopPropagation()
                StorylineX.triggerEvent("mouse_up_object_" + object.get("id"));
            })
        }
    }
}

let StorylineX = {};

DS.presentation.scenes().slice(2).forEach(scene => {
    StorylineX[scene.attributes.lmsId] = new Scene(scene);
    scene.slides().models.forEach(slide => {
        let name = slide.attributes.title.replaceAll(" ", "_");
        while (name in StorylineX[scene.attributes.lmsId]){
            let match = name.match(/_(\d+)$/);
            name = match? name.replaceAll(/_\d+$/g, "_" + String(parseInt(match[1]) + 1).padStart(3, '0')) : name + "_001";
        }
        StorylineX[scene.attributes.lmsId][name] = new Slide(slide, name);
        let i = 0;
        slide.slideLayers().models.forEach(layer => {
            StorylineX[scene.attributes.lmsId][name]["layer_" + String(parseInt(i)).padStart(2, "0")] = new SlideLayer(layer, i);
            i += 1;
        })
    });
});
DS.pubSub.on(DS.events.slide.READY, function(...args) {
    let slide = StorylineX.getCurrentSlide()
    slide.listenToMouseEvents()
    let i = 0;
    slide.get("slideLayers").models.forEach(layer => {
        slide["layer_" + String(parseInt(i)).padStart(2, "0")] = new SlideLayer(layer, i);
        let j = 0;
        layer.objectIndex.forEach(object => {
            slide["layer_" + String(parseInt(i)).padStart(2, "0")]["obj_" + String(parseInt(j)).padStart(2, "0")] = new SlideObject(object);
            j += 1
        })
        i += 1;
    })
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
StorylineX.getCurrentScene = function(){
    return new Scene(DS.windowManager.getCurrentWindowSlide().getScene());
}
StorylineX.getCurrentSlide = function(){
    scene = StorylineX[StorylineX.getCurrentScene().get("lmsId")]
    for (slide in scene){
        if (scene[slide].get && scene[slide].get('id') == DS.windowManager.getCurrentWindowSlide().get('id')){
            return scene[slide];
        } 
    } 
    return undefined;
}
console.hideWarnings = function(){
    console.oldWarn = console.warn;
    console.warn = new function(){};
}
console.unhideWarnings = function(){
    if (console.oldWarn) console.warn = console.oldWarn;
}

window.StorylineX = StorylineX;