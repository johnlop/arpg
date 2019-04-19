// Get the canvas element from our HTML below
var canvas = document.querySelector("#renderCanvas");

// Load the BABYLON 3D engine
var engine = new BABYLON.Engine(canvas, true);

var camera, light, pointer, ground, advancedTexture;
var mousePressed = false;
var hero;
var proj = [];
var ennemies = [];
var text1, text2;
var skillLastUsed;
var selectedEnnemy;

function createScene() {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(1, 1, 1);
    scene.checkCollisions = true;
    scene.collisionsEnabled = true;

    light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 12, 0), scene);
    light.intensity = 1;

    camera = new BABYLON.ArcRotateCamera("Camera", 1, 0.8, 80, new BABYLON.Vector3(0, 0, 0), scene);

    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    ground = BABYLON.Mesh.CreateGround("ground", 1500, 1500, 2, scene);
    ground.material = new BABYLON.StandardMaterial("groundmat", scene);
    ground.material.diffuseTexture = new BABYLON.Texture("Resources/ground.jpg", scene);
    ground.material.diffuseTexture.uScale = 24;
    ground.material.diffuseTexture.vScale = 24;
    ground.material.specularColor = BABYLON.Color3.Black();

    hero = new Unit("hero", 100, 0.7, 1);
    hero.addSkill(new Skill(true, 1000, 1, 10, 1.5, 200));
    hero.addSkill(new Skill(true, 50, 1, 1, 2, 200));
    hero.addSkill(new Skill(true, 800, 7, 2, 2, 200));
    hero.addSkill(new Skill(false, 800, 0, 5, 0, 6));
    camera.lockedTarget = hero.mesh;

    for (var i = 0; i < 100; i++) {
        var ennemy = new Unit("foe", 10, 0.2, 1);
        ennemy.addSkill(new Skill(false, 1000, 0, 1, 0, 6));
        ennemy.position.x = Math.random() * 1000 - 500;
        ennemy.position.z = Math.random() * 1000 - 500;
        ennemy.position.y = 2;
        ennemies.push(ennemy);
    }
    
    text1 = new BABYLON.GUI.TextBlock();
    text1.text = "xp: " + hero.experience;
    text1.color = "white";
    text1.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text1.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    text1.fontSize = 16;
    text1.paddingBottom = "5px";
    text1.paddingLeft = "5px";
    advancedTexture.addControl(text1);
    
    text2 = new BABYLON.GUI.TextBlock();
    text2.text = "xp: " + hero.experience;
    text2.color = "white";
    text2.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    text2.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    text2.fontSize = 16;
    text2.paddingTop = "5px";
    text2.paddingRight = "5px";
    advancedTexture.addControl(text2);

    return scene;
}

var scene = createScene();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {

    if (mousePressed) {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit) {
            pointer = pickResult.pickedPoint;
        }
    }

    if (pointer) {
        hero.move(pointer);
        light.position.x = hero.position.x;
        light.position.z = hero.position.z;
    }

    for (var j = ennemies.length - 1; j >= 0; j--) {
      if (!ennemies[j].isDead){
        if (hero.position.subtract(ennemies[j].position).length() < 200){
          //ennemies[j].move(hero.position);
          ennemies[j].attack(0, hero);
        }
      }
    }

    for (var i = proj.length - 1; i >= 0; i--) {
        if (proj[i].direction) {
            proj[i].position.addInPlace(proj[i].direction);
            
            for (var j = ennemies.length - 1; j >= 0; j--) {
              if (!ennemies[j].isDead){
                  if (proj[i].intersectsMesh(ennemies[j].mesh, false)) {
                      ennemies[j].life -= proj[i].damage;
                      if (ennemies[j].life <= 0) {
                          ennemies[j].mesh.dispose();
                          ennemies[j].isDead = true;
                          hero.experience++;
                      }
                      proj[i].dispose();
                      proj.splice(i, 1);
                      break;
                  }
              }
            }
        }
    }

    text1.text = "xp: " + hero.experience + " \ " + hero.life;
    text2.text = engine.getFps().toFixed() + "fps";

    scene.render();
});


canvas.addEventListener("click", function () {
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    if (pickResult.hit){
      if (selectedEnnemy){
        selectedEnnemy.mesh.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        selectedEnnemy = null;
      }
      if (pickResult.pickedMesh.name == "foe"){
        selectedEnnemy = pickResult.pickedMesh.unit;
        selectedEnnemy.mesh.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        pointer = pickResult.pickedPoint;
      }
    }
});

ground.actionManager = new BABYLON.ActionManager(scene);
ground.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger,
        function () {
            mousePressed = true;
        }));
ground.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger,
        function () {
            mousePressed = false;
        }));


scene.actionManager = new BABYLON.ActionManager(scene);
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: "a"},
        function () {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            pickResult.position = pickResult.pickedPoint;
            hero.attack(0, pickResult);
        }));
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: "q"},
        function () {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            pickResult.position = pickResult.pickedPoint;
            hero.attack(0, pickResult);
        }));
        
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: "z"},
        function () {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            pickResult.position = pickResult.pickedPoint;
            hero.attack(1, pickResult);
        }));
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: "w"},
        function () {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            pickResult.position = pickResult.pickedPoint;
            hero.attack(1, pickResult);
        }));
        
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: "e"},
        function () {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            pickResult.position = pickResult.pickedPoint;
            hero.attack(2, pickResult);
        }));
        
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: "r"},
        function () {
            if (selectedEnnemy){
              hero.attack(3, selectedEnnemy);
            }
        }));


// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

