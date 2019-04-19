function Unit(type, life, speed, level) {
    this.mesh = BABYLON.MeshBuilder.CreateBox(type, {size: 2, height: 8}, scene);
    this.mesh.material = new BABYLON.StandardMaterial("selectcolor", scene);
    this.mesh.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    this.mesh.material.specularColor = BABYLON.Color3.Black();
    this.position = this.mesh.position;
    this.skills = [];
    this.experience = 0;
    this.level = level;
    this.life = life;
    this.speed = speed;
    this.mesh.unit = this;
}

Unit.prototype.addSkill = function (skill) {
    this.skills.push(skill);
}

Unit.prototype.move = function (target) {
    var direction = target.subtract(this.position);
    if (direction.length() > 2) {
        this.mesh.lookAt(target);
        direction.normalize().scaleInPlace(this.speed);
        this.mesh.moveWithCollisions(direction);
    }
}

Unit.prototype.attack = function (skill, target) {
    var distance = target.position.subtract(this.position).length();
    if (distance < this.skills[skill].range){
        this.mesh.lookAt(target.position);
        this.skills[skill].use(this, target);
    }
}

function Skill(isProjectile, rate, projNumber, damage, speed, range) {
    this.isProjectile = isProjectile;
    this.skillLastUsed = Date.now();
    this.rateOfFire = rate;
    this.projNumber = projNumber;
    this.damage = damage;
    this.speed = speed;
    this.range = range;
}

Skill.prototype.use = function (user, target) {
    var now = Date.now();
    if (now - this.skillLastUsed > this.rateOfFire) {
        if (this.isProjectile) {
            var direction = target.position.subtract(user.position).scaleInPlace(this.speed);
            var shot = BABYLON.Mesh.CreateSphere("shot", 1, 1, scene);
            shot.position = user.position.clone();
            shot.direction = direction.clone();
            shot.direction.normalize();
            shot.speed = this.speed;
            shot.damage = this.damage;
            proj.push(shot);
            for(var i = 1; i < this.projNumber; i++){
              var angle = 0;
              if (i % 2){
                angle = -i * Math.PI / 64;
              }
              else {
                angle = (i - 1) * Math.PI / 64;
              }
              var matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, angle);
              var shot = BABYLON.Mesh.CreateSphere("shot", 1, 1, scene);
              shot.position = user.position.clone();
              shot.direction = BABYLON.Vector3.TransformCoordinates(direction, matrix);
              shot.direction.normalize();
              shot.speed = this.speed;
              shot.damage = this.damage;
              proj.push(shot);
            }
        } else {
            target.life -= this.damage;
            if (target.life <= 0 && target.mesh.name != "hero") {
                target.mesh.dispose();
                target.isDead = true;
                user.experience++;
            }
        }
        this.skillLastUsed = now;
    }
}


