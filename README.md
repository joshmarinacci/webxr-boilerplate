# ThreeJS + WebVR Boilerplate

## Note to viewers of my ThreeJS video series

The video series used an older version of the boilerplate that has since been deleted. You can pretty much use
the new stuff the same as the old, you'll just need to modify your imports because it uses ES6 modules now. If you
really want to use the old stuff check out the previous version [here](https://github.com/joshmarinacci/webxr-boilerplate/releases/tag/v1)




## How to use this boilerplate

* in your new project install the boilerplate with `npm install --save webxr-boilerplate`
* this will automatically install ThreeJS as well
* copy `node_modules/webxr-boilerplate/src/index.html` to `./index.html`
* customize `initContent()` in `index.html` with whatever you want.



# Notes

The `Pointer` class unifies mouse, touch and vr controller events into special POINTER events.
It does not yet handle cardboard / gaze input, but that is coming.  To remove it just don't initialize it. To capture
the events add listeners for them:

* `POINTER_ENTER`: fires when a ray cast from the pointer enters an object in the scene
* `POINTER_PRESS`: fires when the pointer is pressed down and a ray cast from the pointer intersects an object in the scene
* `POINTER_RELEASE`: fires when the pointer is pressed down and a ray cast from the pointer intersects an object in the scene
* `POINTER_EXIT`: fires when a ray cast from the pointer exits an object in the scene
* `POINTER_CLICK`: fires when the mouse/finger/vr controller is released and a ray cast
enters an object in the scene.
* `POINTER_MOVE`: fires whenever the mouse, controller, or finger moves.

To listen for clicking on a cube do:

```
cube.addEventListener(POINTER_CLICK, (e)=>{
    console.log("clicked on cube at ", e.point)
})
```

Note that all of these events fire *on an object* that intersects the ray from the pointer.  You will not get events from
the pointer itself.  This means you will not receive events if the scene is empty. To get events as the user moves
the pointer around, regardless of what the pointer is pointing at, create an invisible sphere around the user/camera and listen for 
events on that.

The `VRStats` class gives you stats *within* VR.  To remove it just don't initialize it.

The progress bar is tied to the default loader. If you aren't loading anything, meaning no textures or 
fonts or sounds, then the progress events will never fire and it will never dismiss the overlay. In this 
case simply delete the overlay. 


# Todos

* __fixed__ clicking does not work inside of VR
* a way to customize the ray object easily
* handle the nothing to load case
* __fixed__ support touch events
* support gaze cursor for zero-button cases




===========

# Notes for v2

* It shouldn't take over the screen until you enter VR. It should be possible to have a regular page with a threejs 
rectangle in it that you can put content around, scroll, etc. And it should have a way to put a button on top or next
to it to enter vr. this part should be fully controllable by the page. probably provide a container to the boilerplate.
* Use only ES6 modules. Makes life far easier.
* no globals. scene, camera, renderer, etc. should be passed to the callback or be available on the boilerplate object.
* most code should be in a separate file, not in the html file. so it's easy to ignore.
* redesign the way events work to let you customize what areas need to be scanned

## bonus

* should optionally have a way to suck an existing canvas into a WebVR scene. Then just worry about input and background.
* a way to load background audio that doesn't trigger decoder issues. perhaps a new loader impl that delegates to audio element.
* hooks for when we add post processing

## new input design

Right now the input can be slow because we scan the whole screen on every frame, or at least every time the input
device changes. Ex: the Jingle Smash game is slow when you point down because it scans the whole scene looking for something
with userinput:true, and the ground doesn't receive input. Thus it scans the entire scene.

### ideas
 
* provide a list of objects to recursively scan.  *downside* the objects may change throughout the lifetime of the application. You'd end up providing group objects that these things will live in, instead.
* set a boolean on objects which contain input enabled objects. only those will be scanned
* set a boolean on objects to skip scanning. these will never be scanned.
* indicate if you really need move events (ex: hover effects), otherwise just get clicked / down / up events.
* set a scan root. a special case of one of the above?
 

## example code

``` javascript
import WebXRBoilerplate, Three, GLTFLoader, etc.
const app = new WebXRBoilerPlate({
    container: $("#myapp")
})
app.init().then((app) => {
    
    const stats = new VRStats()
    app.camera.add(stats) 
    
    app.pointer = new Pointer({
        intersectionFilter: ((o) => o.userData.clickable),
        enableLaser:true,
    })
    

    const cube = new Mesh(new BoxGeometry(),new Material())
    app.scene.add(cube)
    
    app.onRender(()=> cube.rotation.y += 0.1)
    on(cube,POINTER_PRESS,()=> cube.material.color.set(0xff0000)
    on(cube,POINTER_RELEASE,()=> cube.material.color.set(0xffffff)
    
    const audioListener = new THREE.AudioListener()
    app.camera.add(audioListener)
    effects = new THREE.Audio(audioListener)
    const audioLoader = new THREE.AudioLoader()
    audioLoader.load('./effects.mp3',(buffer) => {
        effects.setBuffer(buffer)
        effects.setVolume(0.75)
    })
    

    const bgAudioLoader = new BackgroundAudioLoader()
    const music = new BackgroundAudio(bgAudioLoader)

    on(app,LOADED,()=>{
        hide the loading progress bar
        $("#loading-progress").style.display = 'none'
    })
    on(app,VR_DETECTED,()=>{
        show the enter VR button
        on($("#enter-button"),'click',()=> {
            app.enterVR())
            music.play()
        })
    });
})
```
