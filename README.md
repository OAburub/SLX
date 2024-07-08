# SLX
SLX, Short for StorylineX, is a JavaScript library that adds more functionality to Articulate's Storyline360
## How to install 
1- Go to the first slide in the project, and create a new trigger.
2- In "When" select "Timeline starts" and the slide.
3- In "Action" select "Execute JavaScript".
4- Click on "JavaScript", and paste the code from StorylineX.js
### Adding variables 
A lot of functions will not be available to use unless you add their respective variables. Before you start using them, you must add these variables to your project from storyline.
#### Event Variable 
Before you use any triggers, you have to add a variable called `Event` to the project. To listen to Storyline Library events:
1- Add a new trigger where you want it.
2- In "When" select "Variable changes" and select the `Event` variable
3- In "Conditions" add the condition `If Event = <event>` where `<event>` is the string of the event you want to check for. (eg. `waited_3_seconds`)

## Global Functionality 
Storyline Library has a lot of capabilities. This section talks about capabilities which do not relate to any specific Storyline object.
All of these capabilities will be accessible via JavaScript under an object named `StorylineX`
### Triggers 
The following triggers or events are global triggers:
#### Wait Event 
_Event String:_`waited_<seconds>_seconds`
If you call `StorylineX.wait(x)` in a JavaScript block, Storyline will trigger the wait event after that amount of seconds passes.
As an example, if you call `StorylineX.wait(1);`, After 1 second the event `waited_1_seconds` will trigger.

### JavaScript Functions 
It is impossible to add actions directly to storyline. However, you can add an "Execute JavaScript" action and write a single (or multiple) lines, effectively defining your own custom action. All the following functions are available under the `StorylineX` object.
#### `wait(<seconds>)`
Waits for a `<seconds>` amount of seconds, then calls the `waited_<seconds>_seconds` event, where x is the amount it waited.
#### `StorylineX.triggerEvent(<event_string>)`
Triggers the event string. This is used if you want to use JavaScript to define your own custom events.
#### `getCurrentScene()`
returns the current open scene. See "Scenes" below.
#### `getCurrentSlide()`
returns the current open slide. See "Slides" below.
### Variables 
To access these new variables, you must add them to your project first, after that they will be automatically updated. You can read them as you would any other storyline variable, like using the default storyline method. `GetPlayer().GetVar("<variable name>")`

#### Mouse Position Variables 
Using the `mouse_pos_x` and `mouse_pos_y` variables, you can access the position of the mouse in your project. 

## Object Hierarchy 
The previous triggers, actions, and variables were global, meaning they did not relate to any specific storyline object. There are other object-specific functionality, but we must know how to access the objects from JavaScript first.

Objects in Storyline are stored in the following hierarchy:
Scene > Slide > Layer > Object
So, to reach an object, you must reach the scene it's in, the slide it's in, and the layer it's in.

## Scenes 
Scenes are stored directly inside the global `StorylineX` object, under the names `Scene<number>`.
For example, `StorylineX.Scene1` will give you the first scene.
### JavaScript Functions 
Scenes do not have custom triggers, actions, or variables relating to them, and they are mainly used to access slides inside of them. However, these objects have a few functions inside of them that might prove useful to advanced developers.
#### `getStorylineObject()` 
Returns the internal storyline object which stores the scene.
#### `get(<key>)` 
Takes in a string representing the desired attribute's name, and returns the value of the attribute. Attributes are data stored and used by SCORM, and has plenty of useful information. Equivalent to `getStorylineObject().get(<key>)` or `getStorylineObject().attributes[<key>]`. See "Attributes"

## Slides 
Slides are stored inside every scene, under their names configured in storyline. If there are multiple slides under the same name, a number will be added to the second one. If the name of a slide contains a space, it is changed into an underscore.
For example, If you have a slide titled "Starting Slide" under the 3rd scene, you would access it like `StorylineX.Scene3.Starting_Slide`
If you have another slide with the same name, you can access it by `StorylineX.Scene3.Starting_Slide_001`. The added number will always be 3 digits long.
### Triggers 
#### Mouse Up Event 
_Event String:_ `mouse_up_<slide>`
Called when the mouse is released while hovering over the slide.
`<slide>` is replaced with the slide's name, similar to the name you use to access it.
### JavaScript Functions 
#### `getStorylineObject()` 
Returns the internal storyline object which stores the slide.
#### `get(<key>)` 
Takes in a string representing the desired attribute's name, and returns the value of the attribute. Attributes are data stored and used by SCORM, and has plenty of useful information. Equivalent to `getStorylineObject().get(<key>)` or `getStorylineObject().attributes[<key>]`
#### `getElement()` 
Returns the HTML element containing the slide. Useful for changing HTML attributes and CSS styles. If this function returns `undefined`, the element you are looking for does not have an HTML element attached to it.
#### `nextSlide()`
Returns the next slide in the scene.
#### `prevSlide()`
Returns the previous slide in the scene
## Slide Layers 
Slide layers are stored inside each slide under the names `layer_<number>` with the number of the layer from bottom to top.
The added number will always be 2 digits long
For example. accessing the base layer of the last example slide is done by `StorylineX.Scene3.Starting_Slide_001.layer_01`;
### JavaScript Functions 
Slide layers in this library are only used to get objects. Unfortunately you can't get objects by name, and getting objects by index/number is possible but confusing. So, multiple methods are provided to get the objects you require.
#### `getObjects()` 
Returns an array of all objects in a layer. You can then index this to get the object in order, usually from bottom to top. Be aware there are multiple hidden objects that storyline uses, and this is why the order is confusing at times.
Example: `StorylineX.Scene3.Starting_Slide_001_layer_01.getObjects()[0]` will (usually) return the first object you places in a layer.
#### `getObjectByID(<id>)` 
This is the best method to get an object, but requires using the Inspect feature from Storyline's preview.
Every object in Storyline has its own ID. To find out this ID, you must:
1 - Preview your Slide, reaching a state where the object is visible.
2 - Click on "Inspect"
3 - Click on the select button in the top left corner of the inspect window.
4 - Click on the object, and it should direct you to the HTML tag which contains part of the element
5 - Navigate to the parent of that element, and its parent, until you reach a `div` tag which has `class="slide-object ..."`
6 - The same div will have a `data_model_id="<id>"`. This is the Id you want.

Now you can get the Slide object by passing the value of `data_model_id` into `getObjectByID` and you will get the object you are looking for.
#### `getObjectsAtPos(<x>, <y>)` 
Similarly to `getObjects()` This method returns multiple objects. It gets the x and y position you specify, and returns a list of all of the slide objects which intersect that position.
#### `getStorylineObject()` 
Returns the internal storyline object which stores the layer.
#### `get(<key>)` 
Takes in a string representing the desired attribute's name, and returns the value of the attribute. Attributes are data stored and used by SCORM, and has plenty of useful information. Equivalent to `getStorylineObject().get(<key>)` or `getStorylineObject().attributes[<key>]`
#### `getElement()` 
Returns the HTML element containing the layer. Useful for changing HTML attributes and CSS styles. If this function returns `undefined`, the element you are looking for does not have an HTML element attached to it.
### JavaScript Fields 
#### `index` 
A field which stores the index of the layer inside a slide.
## Slide Objects 
Most of the functionality in this library is tied to slide objects. Once you have accessed the slide objects you want, you can use multiple functions and tools.
Slide Objects are stored inside slide layers. Unforunately you can't get them by name, but you can get them by order of placement. This might not always be accurate since hidden objects used by storylines, as well as usage of the master slide, and the recommended method is to use `getObjectByID()` from the slidelayer.
Nevertheless, they are stored under `obj_<number>` where the number is always 2 digits long, and starts from 00.
For example, you would write `StorylineX.Scene3.Starting_Slide_001.layer_01.obj_03`
### Triggers 
#### Mouse Up Event 
_Event String:_ `mouse_up_object_<id>`
Similarly to the mouse up even in the slide, this triggers when the user releases the mouse button (or finished clicking it) while the mouse is hovering over the object. It takes in the ID of the object. More info on Object IDs in the Slide Layers -> JavaScript Functions section of this document.
### JavaScript Functions 
#### `hide()` 
Calling the hide function on an object will hide it, but keep its state (if it has multiple).
#### `show()` 
Shows the object, returning it to its original state before `.hide()` was called. 
#### `moveTo(x, y)`
Changes the object's position, putting it in the specified position. Takes  the x and y positions.
#### `slideTo(x, y, seconds)` 
Moves the object smoothly to the specified position, similar to a line path animation. Takes the x and y positions, and the desired length of the animation.
#### `getStorylineObject()` 
Returns the internal storyline object which stores the slide object
#### `get(<key>)` 
Takes in a string representing the desired attribute's name, and returns the value of the attribute. Attributes are data stored and used by SCORM, and has plenty of useful information. Equivalent to `getStorylineObject().get(<key>)` or `getStorylineObject().attributes[<key>]`
#### `getElement()` 
Returns the HTML element containing the object. Useful for changing HTML attributes and CSS styles. If this function returns `undefined`, the element you are looking for does not have an HTML element attached to it.
### JavaScript Fields 
#### `Id` 
Returns the ID of the object.
## Attributes
Storyline stores data about its objects, scenes, slides, etc. These datapoints are called attributes, and they are available through the "get" function. Different objects have different attributes, and trying to get a non-existent attribute will return `undefined`. This list is not conclusive, so to get a full list of attributes, you can call `getStorylineObject().attributes` in DevTools (aka the inspection window).
#### `get("id")`  <sub>_applies to: all_</sub>
returns the Internal storyline Id
#### `get("kind")`  <sub>_applies to: all_</sub>
returns what kind of object it is. (e.g. "slide", "scene", "stategroup", "vectorshape"...)
#### `get("width")`  <sub>_applies to: slides, slide objects_</sub>
returns the width of the object.
#### `get("height")`  <sub>_applies to: slides, slide objects_</sub>
returns the height of the object.
#### `get("title")`  <sub>_applies to: slides_</sub>
returns the title of the slide.
#### `get("xPos")`  <sub>_applies to: slide objects_</sub>
returns the X position of the object.
#### `get("yPos")`  <sub>_applies to: slide objects_</sub>
returns the Y position of the object.