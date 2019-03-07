# ThreeJS + WebVR Boilerplate


This is a boilerplate to get your WebXR/VR project up and running quickly. It uses only ES6 modules, no globals, and
the only dependency is a recent ThreeJS.

## Important note

Use v1 if you are following the instructions from the VR video series

Use v2 if you are creating a new project.

## How to use this boilerplate

* in your new project install the boilerplate with `npm install --save webxr-boilerplate`
* this will automatically install ThreeJS as well
* copy `node_modules/webxr-boilerplate/v2/index.html` to `./index.html`
* customize `initContent()` in `index.html` with whatever you want.
* customize the `app.init().then()` promise in `index.html` with whatever you want.
* check out the [examples](./examples/) too.


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

```javascript
cube.addEventListener(POINTER_CLICK, (e)=>{
    console.log("clicked on cube at ", e.point)
})
```

Note that all of these events fire *on an object* that intersects the ray from the pointer.  You will not get events from
the pointer itself.  This means you will not receive events if the scene is empty. To get events as the user moves
the pointer around, regardless of what the pointer is pointing at, create an invisible sphere around the user/camera and listen for 
events on that.


## examples

### click on a cube

```javascript
cube.addEventListener(POINTER_CLICK, (e) => {
    console.log("clicked on the cube at", e.point
}) 
```

### find out *where* on a plane the pointer is pointing in UV space

```javascript
plane.addEventListener(POINTER_MOVE, (e) => {
    console.log("location is ", e.intersection.uv)
})
```

### disable pointer while playing a game but show during a dialog

```javascript
if(dialog.visible) {
    pointer.enable()
} else {
    pointer.disable()
}
```

## get the position and orientation of the controller

```javascript
pointer.controller1.position
pointer.controller1.orientation
```

## attach a wand GLTF to the controller

```javascript
pointer.controller1.add(wandgltf.scene)
```

# VR Stats

The `VRStats` class gives you stats *within* VR. 

```javascript
//create stats viewer
const stats = new VRStats(app)
// place stats inside camera so it's fixed position
app.camera.add(stats)
// add camera to scene so we can see it
app.scene.add(app.camera)
```

# Raycasting

The `Pointer` uses a copy of the standard ThreeJS Raycaster class which has been modified to support filtering.

By default the Pointer will let you click on anything in the scene. To mark only certain objects as clickable set
the `intersectionFilter` option.

By default the Pointer will scan through the *entire scene*. To prune branches of the scene graph set the `recurseFilter`
option.

```javascript
new Pointer(app, {
    
    //Pointer searches everything in the scene by default
    //override this to match just certain things
    intersectionFilter: ((o) => o.userData.clickable),
    
    //eliminate from raycasting recursion to make it faster
    recurseFilter: (o) => {
        if(o.userData && o.userData.skipRaycast === true) return false
        return true
    }
})
```

# Progress Bar

The progress bar is tied to the ThreeJS `DEFAULT_LOADER_MANAGER`. If you aren't loading anything, meaning no textures or 
fonts or sounds, then the progress events will never fire and it will never dismiss the overlay. In this 
case simply delete the overlay. Since you don't really need it.


# Background Audio

For spatialized audio clips that are short, like sound effects, you should use the standard ThreeJS Audio class.
For longer audio clips that are not spatialized, like background music, it is more efficient to use an HTML `<audio>`
element instead.  The `BackgroundAudioLoader` does this. It will get the app up and running faster by streaming
the audio file instead of downloading and decompressing the entire thing before starting the app.


```javascript
// Load positional audio, like sound effects. Entire buffer
// will be loaded before complete
const audioListener = new AudioListener()
app.camera.add(audioListener)
const effect = new Audio(audioListener)
const audioLoader = new AudioLoader()
audioLoader.load('./raygun.mp3',(buffer) => {
    effect.setBuffer(buffer)
    effect.setVolume(0.75)
})


//load background audio (non-positional), like music.
// this is important for large MP3s that could block the app from loading
//BackgroundAudioLoader will use <audio> elements and can play before
//the entire audio is loaded

// example music is from
// http://freemusicarchive.org/music/BoxCat_Games/Nameless_the_Hackers_RPG_Soundtrack/BoxCat_Games_-_Nameless-_the_Hackers_RPG_Soundtrack_-_10_Epic_Song
let music
const musicLoader = new BackgroundAudioLoader(app.loadingManager)
musicLoader.load("./music.mp3",(audio)=> music = audio)
```



# Todos

* a way to customize the ray object easily
* handle the nothing to load case
* support gaze cursor for zero-button cases



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

```javascript
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
