(function () {
  var scr,
    ctx,
    pointer,
    drag,
    boxes,
    dropc = 0,
    objects = [],
    contacts = [],
    contactsI = 0,
    numIterations,
    kTimeStep,
    kGravity,
    kFriction,
    mostSeparated = [0, 0, 0, 0, 0],
    mostPenetrating = [0, 0, 0, 0, 0];
  var Rectangle = function (img, x, y, w, h, invMass, angularVel, angle) {
    this.img = img;
    this.w = w;
    this.h = h;
    this.vel = [0, 0];
    this.pos = [x, y];
    this.angularVel = angularVel || 0;
    this.invMass = invMass || 0;
    this.angle = angle || 0;
    this.matrix = [0, 0, 0, 0, 0, 0];
    this.matrixNextFrame = [0, 0, 0, 0, 0, 0];
    this.motionBounds = [0, 0, 0, 0, 0, 0];
    this.localSpacePoints = [
      [w / 2, -h / 2],
      [-w / 2, -h / 2],
      [-w / 2, h / 2],
      [w / 2, h / 2]
    ];
    this.localSpaceNormals = [];
    this.vCount = this.localSpacePoints.length;
    for (var i = 0; i < this.vCount; i++) {
      var a = this.localSpacePoints[i];
      var b = this.localSpacePoints[(i + 1) % this.vCount];
      var x = b[0] - a[0];
      var y = b[1] - a[1];
      var len = Math.sqrt(x * x + y * y);
      this.localSpaceNormals[i] = [-y / len, x / len];
    }
    this.worldSpaceNormals = [];
    this.worldSpacePoints = [];
    for (var i = 0; i < this.vCount; i++) {
      this.worldSpaceNormals[i] = [0, 0];
      this.worldSpacePoints[i] = [0, 0];
    }
    this.invI = invMass > 0 ? 1 / (((1 / invMass) * (w * w + h * h)) / 6) : 0;
    this.c1 = [0, 0];
    this.c0 = [0, 0];
  };
  Rectangle.prototype.featurePairJudgement = function (that, fpc) {
    var closest,
      closestI,
      closestD,
      wsN,
      v,
      d,
      dx,
      dy,
      lsp,
      wsp,
      mfp0,
      mfp1,
      dist,
      centreDist;
    for (var edge = 0; edge < this.vCount; edge++) {
      wsN = this.worldSpaceNormals[edge];
      dx = -wsN[0];
      dy = -wsN[1];
      v = [
        dx * that.matrix[0] + dy * that.matrix[1],
        dx * that.matrix[2] + dy * that.matrix[3]
      ];
      closestI = -1;
      closestD = -1e6;
      for (var i = 0; i < that.vCount; i++) {
        lsp = that.localSpacePoints[i];
        d = v[0] * lsp[0] + v[1] * lsp[1];
        if (d > closestD) {
          closestD = d;
          closestI = i;
        }
      }
      closest = that.worldSpacePoints[closestI];
      wsp = this.worldSpacePoints[edge];
      mfp0 = [closest[0] - wsp[0], closest[1] - wsp[1]];
      wsp = this.worldSpacePoints[(edge + 1) % this.vCount];
      mfp1 = [closest[0] - wsp[0], closest[1] - wsp[1]];
      dist = mfp0[0] * wsN[0] + mfp0[1] * wsN[1];
      dx = closest[0] - this.pos[0];
      dx = closest[1] - this.pos[1];
      centreDist = dx * dx + dy * dy;
      if (dist > 0) {
        this.projectPointOntoEdge([0, 0], mfp0, mfp1, 0);
        dist = this.c0[0] * this.c0[0] + this.c0[1] * this.c0[1];
        if (dist < mostSeparated[0]) {
          mostSeparated = [dist, closestI, edge, fpc, centreDist];
        } else if (dist == mostSeparated[0] && fpc == mostSeparated[3]) {
          if (centreDist < mostSeparated[4]) {
            mostSeparated = [dist, closestI, edge, fpc, centreDist];
          }
        }
      } else {
        if (dist > mostPenetrating[0]) {
          mostPenetrating = [dist, closestI, edge, fpc, centreDist];
        } else if (dist == mostPenetrating[0] && fpc == mostPenetrating[3]) {
          if (centreDist < mostPenetrating[4]) {
            mostPenetrating = [dist, closestI, edge, fpc, centreDist];
          }
        }
      }
    }
  };
  Rectangle.prototype.projectPointOntoEdge = function (p, e0, e1, i) {
    var v = [p[0] - e0[0], p[1] - e0[1]];
    var e = [e1[0] - e0[0], e1[1] - e0[1]];
    var t = (e[0] * v[0] + e[1] * v[1]) / (e[0] * e[0] + e[1] * e[1]);
    if (t > 1) t = 1;
    if (t < 0) t = 0;
    if (i) this.c1 = [e0[0] + e[0] * t, e0[1] + e[1] * t];
    else this.c0 = [e0[0] + e[0] * t, e0[1] + e[1] * t];
  };
  var Contact = function () {
    this.a = {};
    this.b = {};
    this.normal = [0, 0];
    this.ra = [0, 0];
    this.rb = [0, 0];
    this.dist = 0;
    this.impulseN = 0;
    this.impulseT = 0;
    this.invDenom = 0;
    this.invDenomTan = 0;
  };
  Contact.prototype.set = function (A, B, i, wsN) {
    var pa, pb;
    this.a = A;
    this.b = B;
    this.normal = wsN;
    if (i) {
      pa = A.c1;
      pb = B.c1;
    } else {
      pa = A.c0;
      pb = B.c0;
    }
    this.dist = (pb[0] - pa[0]) * wsN[0] + (pb[1] - pa[1]) * wsN[1];
    this.impulseN = 0;
    this.impulseT = 0;
    this.ra = [-(pa[1] - A.pos[1]), pa[0] - A.pos[0]];
    this.rb = [-(pb[1] - B.pos[1]), pb[0] - B.pos[0]];
    var ran = this.ra[0] * wsN[0] + this.ra[1] * wsN[1];
    var rbn = this.rb[0] * wsN[0] + this.rb[1] * wsN[1];
    this.invDenom =
      1 / (A.invMass + B.invMass + ran * ran * A.invI + rbn * rbn * B.invI);
    ran = this.ra[0] * -wsN[1] + this.ra[1] * wsN[0];
    rbn = this.rb[0] * -wsN[1] + this.rb[1] * wsN[0];
    this.invDenomTan =
      1 / (A.invMass + B.invMass + ran * ran * A.invI + rbn * rbn * B.invI);
  };
  var generateMotionAABB = function () {
    for (var i = 0, rb; (rb = objects[i++]); ) {
      var x,
        min = [1e6, 1e6],
        max = [-1e6, -1e6],
        m0 = rb.matrix,
        m1 = rb.matrixNextFrame;
      for (var j = 0; j < rb.vCount; j++) {
        var lp = rb.localSpacePoints[j],
          ln = rb.localSpaceNormals[j];
        for (var u = 0; u < 2; u++) {
          x = m0[u] * lp[0] + m0[2 + u] * lp[1] + m0[4 + u];
          rb.worldSpacePoints[j][u] = x;
          if (x < min[u]) min[u] = x;
          if (x > max[u]) max[u] = x;
          x = m1[u] * lp[0] + m1[2 + u] * lp[1] + m1[4 + u];
          if (x < min[u]) min[u] = x;
          if (x > max[u]) max[u] = x;
          x = m0[u] * ln[0] + m0[2 + u] * ln[1];
          rb.worldSpaceNormals[j][u] = x;
        }
      }
      rb.motionBounds = [
        (min[0] + max[0]) * 0.5,
        (min[1] + max[1]) * 0.5,
        (max[0] - min[0]) * 0.5,
        (max[1] - min[1]) * 0.5
      ];
    }
  };
  var integrate = function () {
    for (var i = 0, rb; (rb = objects[i++]); ) {
      if (rb.drag) {
        rb.vel[0] = (pointer.X - rb.pos[0]) * 10;
        rb.vel[1] = (pointer.Y - rb.pos[1]) * 10;
      } else {
        rb.vel[0] *= 0.98;
        if (rb.invMass > 0) rb.vel[1] += kGravity;
      }
      rb.pos = [
        rb.pos[0] + rb.vel[0] * kTimeStep,
        rb.pos[1] + rb.vel[1] * kTimeStep
      ];
      rb.angle += rb.angularVel * kTimeStep;
      var c = Math.cos(rb.angle),
        s = Math.sin(rb.angle);
      rb.matrix = [c, s, -s, c, rb.pos[0], rb.pos[1]];
      var angle = rb.angle + rb.angularVel * kTimeStep;
      var c = Math.cos(angle),
        s = Math.sin(angle);
      rb.matrixNextFrame = [
        c,
        s,
        -s,
        c,
        rb.pos[0] + rb.vel[0] * kTimeStep,
        rb.pos[1] + rb.vel[1] * kTimeStep
      ];
    }
  };
  var collide = function () {
    var face,
      vertex,
      fp,
      vertexRect,
      faceRect,
      wsN,
      worldV0,
      worldV1,
      wsV0,
      wsV1,
      va,
      vb,
      vc,
      na,
      nc,
      len,
      f;
    contactsI = 0;
    for (var i = 0, l = objects.length; i < l - 1; i++) {
      var A = objects[i];
      for (var j = i + 1; j < l; j++) {
        var B = objects[j];
        if (A.invMass != 0 || B.invMass != 0) {
          var AMB = A.motionBounds,
            BMB = B.motionBounds;
          if (
            Math.abs(BMB[0] - AMB[0]) - (AMB[2] + BMB[2]) < 0 &&
            Math.abs(BMB[1] - AMB[1]) - (AMB[3] + BMB[3]) < 0
          ) {
            mostSeparated = [1e9, -1, -1, 0, 1e9];
            mostPenetrating = [-1e9, -1, -1, 0, 1e9];
            A.featurePairJudgement(B, 2);
            B.featurePairJudgement(A, 1);
            if (mostSeparated[0] > 0 && mostSeparated[3] != 0) {
              face = mostSeparated[2];
              vertex = mostSeparated[1];
              fp = mostSeparated[3];
            } else if (mostPenetrating[0] <= 0) {
              face = mostPenetrating[2];
              vertex = mostPenetrating[1];
              fp = mostPenetrating[3];
            }
            if (fp == 1) {
              vertexRect = A;
              faceRect = B;
            } else {
              vertexRect = B;
              faceRect = A;
            }
            f = faceRect.worldSpaceNormals[face];
            wsN = [f[0], f[1]];
            va =
              vertexRect.worldSpacePoints[
                (vertex - 1 + vertexRect.vCount) % vertexRect.vCount
              ];
            vb = vertexRect.worldSpacePoints[vertex];
            vc = vertexRect.worldSpacePoints[(vertex + 1) % vertexRect.vCount];
            na = [-(vb[1] - va[1]), vb[0] - va[0]];
            len = Math.sqrt(na[0] * na[0] + na[1] * na[1]);
            na[0] /= len;
            na[1] /= len;
            nc = [-(vc[1] - vb[1]), vc[0] - vb[0]];
            len = Math.sqrt(nc[0] * nc[0] + nc[1] * nc[1]);
            nc[0] /= len;
            nc[1] /= len;
            if (
              na[0] * wsN[0] + na[1] * wsN[1] <
              nc[0] * wsN[0] + nc[1] * wsN[1]
            ) {
              worldV0 = va;
              worldV1 = vb;
            } else {
              worldV0 = vb;
              worldV1 = vc;
            }
            wsV0 = faceRect.worldSpacePoints[face];
            wsV1 = faceRect.worldSpacePoints[(face + 1) % faceRect.vCount];
            if (fp === 1) {
              A.projectPointOntoEdge(wsV0, worldV0, worldV1, 0);
              A.projectPointOntoEdge(wsV1, worldV0, worldV1, 1);
              B.projectPointOntoEdge(worldV1, wsV0, wsV1, 0);
              B.projectPointOntoEdge(worldV0, wsV0, wsV1, 1);
              wsN[0] = -wsN[0];
              wsN[1] = -wsN[1];
            } else {
              A.projectPointOntoEdge(worldV1, wsV0, wsV1, 0);
              A.projectPointOntoEdge(worldV0, wsV0, wsV1, 1);
              B.projectPointOntoEdge(wsV0, worldV0, worldV1, 0);
              B.projectPointOntoEdge(wsV1, worldV0, worldV1, 1);
            }
            if (!contacts[contactsI]) contacts[contactsI] = new Contact();
            contacts[contactsI++].set(A, B, 0, wsN);
            if (!contacts[contactsI]) contacts[contactsI] = new Contact();
            contacts[contactsI++].set(A, B, 1, wsN);
          }
        }
      }
    }
  };
  var solve = function () {
    for (var j = 0; j < numIterations; j++) {
      for (var i = 0; i < contactsI; i++) {
        var con = contacts[i],
          a = con.a,
          b = con.b,
          ra = con.ra,
          rb = con.rb,
          normal = con.normal;
        var dv = [
          b.vel[0] + rb[0] * b.angularVel - (a.vel[0] + ra[0] * a.angularVel),
          b.vel[1] + rb[1] * b.angularVel - (a.vel[1] + ra[1] * a.angularVel)
        ];
        var remove =
          dv[0] * normal[0] + dv[1] * normal[1] + con.dist / kTimeStep;
        if (remove < 0) {
          var mag = remove * con.invDenom,
            newImpulse = Math.min(mag + con.impulseN, 0),
            change = newImpulse - con.impulseN,
            x = normal[0] * change,
            y = normal[1] * change;
          a.vel[0] += x * a.invMass;
          a.vel[1] += y * a.invMass;
          b.vel[0] -= x * b.invMass;
          b.vel[1] -= y * b.invMass;
          a.angularVel += (x * ra[0] + y * ra[1]) * a.invI;
          b.angularVel -= (x * rb[0] + y * rb[1]) * b.invI;
          con.impulseN = newImpulse;
          var absMag = Math.abs(con.impulseN) * kFriction;
          var tanV = dv[0] * -normal[1] + dv[1] * normal[0];
          newImpulse = Math.min(
            Math.max(tanV * con.invDenomTan + con.impulseT, -absMag),
            absMag
          );
          var change = newImpulse - con.impulseT;
          (x = -normal[1] * change), (y = normal[0] * change);
          a.vel[0] += x * a.invMass;
          a.vel[1] += y * a.invMass;
          b.vel[0] -= x * b.invMass;
          b.vel[1] -= y * b.invMass;
          a.angularVel += (x * ra[0] + y * ra[1]) * a.invI;
          b.angularVel -= (x * rb[0] + y * rb[1]) * b.invI;
          con.impulseT = newImpulse;
        }
      }
    }
  };
  var draw = function () {
    for (var i = 0, rb; (rb = objects[i++]); ) {
      if (rb.img) {
        ctx.save();
        ctx.translate(rb.pos[0], rb.pos[1]);
        ctx.rotate(rb.angle);
        ctx.drawImage(rb.img, -rb.w * 0.5, -rb.h * 0.5, rb.w, rb.h);
        ctx.restore();
        if (pointer.isDown && !drag && rb.invMass) {
          ctx.beginPath();
          for (var j = 0; j < rb.vCount; j++) {
            var a = rb.worldSpacePoints[j];
            ctx.lineTo(a[0], a[1]);
          }
          ctx.closePath();
          if (ctx.isPointInPath(pointer.X, pointer.Y)) {
            rb.drag = true;
            drag = true;
          }
        }
      }
    }
  };
  var clean = function () {
    ctx.clearRect(0, 0, scr.width, scr.height);
    for (var i = 0, rb; (rb = objects[i++]); ) {
      if (rb.pos[1] > scr.height) {
        i--;
        objects.splice(i, 1);
      }
    }
    if (objects.length < 6 - dropc) drop();
  };
  var newBox = function (x, y) {
    if (!x)
      var x = pointer.X,
        y = 0;
    var img = boxes[Math.floor(Math.random() * boxes.length)];
    objects.push(
      new Rectangle(
        img,
        x,
        y - img.height * 2,
        img.width,
        img.height,
        img.width * img.height,
        Math.random() * 3 - 1.5
      )
    );
  };
  var resize = function () {
    for (var i = 0, rb; (rb = objects[i++]); ) {
      if (!rb.invMass) {
        i--;
        objects.splice(i, 1);
      }
    }
    var img = document.getElementById('blade');
    objects.push(
      new Rectangle(
        img,
        scr.width * 0.9,
        scr.height * 0.9,
        img.width,
        img.height,
        0,
        1,
        Math.PI / 2
      )
    );
    objects.push(
      new Rectangle(
        img,
        scr.width * 0.9,
        scr.height * 0.9,
        img.width,
        img.height,
        0,
        1,
        0
      )
    );
    objects.push(
      new Rectangle(
        img,
        scr.width * 0.1,
        scr.height * 0.9,
        img.width,
        img.height,
        0,
        -1,
        Math.PI / 2
      )
    );
    objects.push(
      new Rectangle(
        img,
        scr.width * 0.1,
        scr.height * 0.9,
        img.width,
        img.height,
        0,
        -1,
        0
      )
    );
    objects.push(
      new Rectangle(
        false,
        scr.width * 0.5,
        scr.height,
        scr.width * 0.7,
        4,
        0,
        0
      )
    );
  };
  var drop = function () {
    for (var i = 0; i < 10; i++) {
      dropc++;
      setTimeout(function () {
        dropc--;
        newBox(128 + Math.random() * (scr.width - 256), -Math.random() * 1000);
      }, i * 600);
    }
  };
  var init = function () {
    scr = new ge1doot.Screen({
      container: 'screen',
      resize: function () {
        resize();
      }
    });
    ctx = scr.ctx;
    scr.resize();
    boxes = document.getElementById('textures').getElementsByTagName('img');
    pointer = new ge1doot.Pointer({
      down: function () {
        newBox();
      },
      up: function () {
        for (var i = 0, rb; (rb = objects[i++]); ) rb.drag = false;
        drag = false;
      }
    });
    numIterations = 10;
    kTimeStep = 1 / 60;
    kGravity = 25;
    kFriction = 0.3;
    run();
  };
  var run = function () {
    clean();
    collide();
    solve();
    integrate();
    generateMotionAABB();
    draw();
    requestAnimFrame(run);
  };
  return {
    load: function () {
      window.addEventListener(
        'load',
        function () {
          init();
        },
        false
      );
    }
  };
})().load();
