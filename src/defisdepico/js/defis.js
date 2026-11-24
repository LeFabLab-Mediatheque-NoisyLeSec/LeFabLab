/* Les 7 défis. Chaque défi décrit son décor, son déroulement et son score ; le moteur s'occupe du reste. `this` est la scène. */
(function () {
  "use strict";
  var PICO = window.PICO = window.PICO || {};
  var W = 1280, H = 720, ENCRE = "#1c3b33", ENCRE_N = 0x1c3b33;
  var R = Phaser.Math, A = Phaser.Utils.Array;

  function degrade(sc, cle, arrets, w, h) {
    if (sc.textures.exists(cle)) return;
    var t = sc.textures.createCanvas(cle, w || W, h || H), c = t.getContext(), g = c.createLinearGradient(0, 0, 0, h || H);
    arrets.forEach(function (a) { g.addColorStop(a[0], a[1]); });
    c.fillStyle = g; c.fillRect(0, 0, w || W, h || H); t.refresh();
  }
  function soleil(sc, x, y, r) {
    var c = sc.add.container(x, y);
    var rayons = sc.add.graphics();
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6;
      rayons.fillStyle(0xffc531).lineStyle(4, 0xb07800);
      var p = [{ x: Math.cos(a - .12) * (r + 6), y: Math.sin(a - .12) * (r + 6) }, { x: Math.cos(a) * (r + 26), y: Math.sin(a) * (r + 26) }, { x: Math.cos(a + .12) * (r + 6), y: Math.sin(a + .12) * (r + 6) }];
      rayons.fillPoints(p, true); rayons.strokePoints(p, true);
    }
    var disque = sc.add.graphics().fillStyle(0xffd34d, .35).fillCircle(0, 0, r + 30).fillStyle(0xffc531).fillCircle(0, 0, r).lineStyle(5, 0xb07800).strokeCircle(0, 0, r);
    c.add([disque, rayons]);
    sc.tweens.add({ targets: rayons, angle: 360, duration: 24000, repeat: -1 });
    return c;
  }
  function nuages(sc, n, yMin, yMax, prof) {
    var l = [];
    for (var i = 0; i < n; i++) {
      var g = sc.add.graphics().setDepth(prof || 1);
      g.fillStyle(0xffffff).lineStyle(4, ENCRE_N, .9);
      g.fillCircle(0, 0, 22); g.fillCircle(28, -12, 28); g.fillCircle(58, 0, 22); g.fillRoundedRect(-20, 0, 98, 22, 11);
      g.x = R.Between(0, W); g.y = R.Between(yMin, yMax); g.vit = R.Between(8, 22);
      l.push(g);
    }
    return l;
  }
  function bougerNuages(l, dt) { l.forEach(function (n) { n.x += n.vit * dt; if (n.x > W + 120) n.x = -140; }); }
  function humeur(sc, img, cle, ms) {
    img.setTexture(cle);
    if (img.tH) img.tH.remove();
    img.tH = sc.time.delayedCall(ms || 700, function () { img.setTexture(img.base); });
  }

  var D = PICO.DEFIS = {};

  /* =========================================================== 1. TRI */
  var BACS = [
    { cle: "jaune", nom: "Jaune", long: "la poubelle jaune" },
    { cle: "verre", nom: "Verre", long: "le bac à verre" },
    { cle: "compost", nom: "Compost", long: "le compost" },
    { cle: "ordures", nom: "Ordures", long: "les ordures ménagères" }
  ];
  var OBJETS_TRI = [
    ["bouteille", "Bouteille en plastique", 0], ["canette", "Canette", 0], ["sac", "Sac plastique", 0], ["gobelet", "Gobelet en carton", 0], ["brique", "Brique de jus", 0], ["journal", "Journal", 0], ["carton", "Carton", 0],
    ["bouteille_verre", "Bouteille en verre", 1], ["bocal", "Pot de confiture", 1],
    ["banane", "Peau de banane", 2], ["trognon", "Trognon de pomme", 2], ["oeufs", "Coquilles d'œufs", 2], ["feuille", "Feuilles mortes", 2],
    ["brosse", "Brosse à dents", 3], ["eponge", "Éponge usée", 3], ["crayon", "Crayon usé", 3]
  ];
  D.tri = {
    nom: "Le tapis du tri", ico: "bac_jaune", chrono: true, bd: 60, seuils: [8, 14, 20], uniteSeuil: "points",
    desc: "Les déchets arrivent sur le tapis : vite, la bonne poubelle !", cmd: "Clic ou touches 1 à 4",
    regle: "Le déchet sous la flèche est le prochain. Clique sur sa poubelle (ou touches 1, 2, 3, 4) avant qu'il tombe du tapis !",
    exemples: [["canette", "Jaune", "#d99500", 84], ["bocal", "Verre", "#1d6a43", 84], ["banane", "Compost", "#6b4422", 84], ["brosse", "Ordures", "#4c5964", 84]],
    savais: ["Le métal d'une canette se recycle à l'infini : on peut en refaire des canettes ou des vélos.", "En France, chaque habitant jette environ 550 kg de déchets par an.", "Depuis 2023, en France, tous les emballages vont dans la poubelle jaune, même les pots de yaourt."],
    decor: function (g) {
      var sc = this;
      degrade(this, "fond_tri", [[0, "#b9e3d8"], [.6, "#93c9bb"], [.6, "#7fb3a6"], [1, "#6a9d90"]]);
      this.add.image(0, 0, "fond_tri").setOrigin(0);
      var mur = this.add.graphics().lineStyle(3, 0xffffff, .22);
      for (var y = 40; y < 420; y += 44) { mur.lineBetween(0, y, W, y); for (var x = (y / 44 % 2) * 60; x < W; x += 120) mur.lineBetween(x, y, x, y + 44); }
      var fen = this.add.graphics();
      fen.fillStyle(0x8fd6f0).fillRoundedRect(860, 26, 240, 140, 12).lineStyle(6, ENCRE_N).strokeRoundedRect(860, 26, 240, 140, 12);
      fen.fillStyle(0xffffff).fillCircle(930, 80, 18).fillCircle(956, 72, 22).fillCircle(982, 82, 16);
      fen.lineStyle(6, ENCRE_N).lineBetween(980, 26, 980, 166).lineBetween(860, 96, 1100, 96);
      [[330, 130, 120, 9000], [430, 186, 74, -6000], [1200, 420, 90, -8000]].forEach(function (e) {
        var gr = sc.img(e[0], e[1], "engrenage", e[2]).setAlpha(.9);
        sc.tweens.add({ targets: gr, angle: e[3] > 0 ? 360 : -360, duration: Math.abs(e[3]), repeat: -1 });
      });
      this.panneau(W / 2 - 170, 22, 340, 60, 0xfffdf6, 14);
      this.texte(W / 2, 52, "Centre de tri", 32, "#36a35a");
      // tapis roulant
      if (!this.textures.exists("bande")) {
        var b = this.make.graphics({ add: false });
        b.fillStyle(0x2f3b45).fillRect(0, 0, 80, 120).fillStyle(0x3d4a55).fillRect(0, 0, 80, 10).fillStyle(0x45525d).fillRect(70, 0, 8, 120);
        b.generateTexture("bande", 80, 120); b.destroy();
        var r = this.make.graphics({ add: false });
        r.fillStyle(0x9aa6b0).fillCircle(22, 22, 20).lineStyle(4, ENCRE_N).strokeCircle(22, 22, 20).lineStyle(4, 0x5a6570).lineBetween(8, 22, 36, 22).lineBetween(22, 8, 22, 36);
        r.generateTexture("rouleau", 44, 44); r.destroy();
      }
      var cadre = this.add.graphics();
      cadre.fillStyle(0x4c5964).fillRect(0, 226, W, 150).lineStyle(5, ENCRE_N).strokeRect(-5, 226, W + 10, 150);
      [140, 520, 900, 1180].forEach(function (x) { cadre.fillStyle(0x5a6570).fillRect(x - 12, 376, 24, 70).lineStyle(4, ENCRE_N).strokeRect(x - 12, 376, 24, 70); });
      g.bande = this.add.tileSprite(0, 236, W, 120, "bande").setOrigin(0);
      this.add.rectangle(0, 226, W, 10, 0xffc531).setOrigin(0);
      g.rouleaux = [];
      for (var rx = 30; rx < W; rx += 64) g.rouleaux.push(this.add.image(rx, 368, "rouleau"));
      var fin = this.add.graphics().setDepth(6);
      for (var s = 0; s < 6; s++) fin.fillStyle(s % 2 ? 0xffffff : 0xff6142).fillRect(W - 26, 216 + s * 26, 26, 26);
      fin.lineStyle(4, ENCRE_N).strokeRect(W - 26, 216, 26, 156);
      g.pico = this.img(76, 176, "pico", 120).setDepth(5); g.pico.base = "pico";
      // poubelles
      g.bacs = [];
      BACS.forEach(function (bk, i) {
        var x = 220 + i * 280, y = 590, c = sc.add.container(x, y).setDepth(10);
        var ombre = sc.add.ellipse(0, 78, 140, 22, 0x0b2a24, .25);
        var corps = sc.img(0, 0, "bac_" + bk.cle, 150), s2 = corps.scale;
        var couv = sc.add.image(-64 * s2, -54 * s2, "couv_" + bk.cle).setOrigin(.1, .8).setScale(s2);
        var badge = sc.add.graphics().fillStyle(0xfffdf6).fillCircle(56, -58, 18).lineStyle(4, ENCRE_N).strokeCircle(56, -58, 18);
        var num = sc.texte(56, -57, String(i + 1), 22, ENCRE, { strokeThickness: 0 });
        var lab = sc.texte(0, 102, bk.nom, 30);
        c.add([ombre, corps, couv, badge, num, lab]);
        c.setSize(200, 250).setInteractive({ useHandCursor: true });
        c.on("pointerover", function () { sc.tweens.add({ targets: c, scale: 1.06, duration: 120, ease: "Back.easeOut" }); });
        c.on("pointerout", function () { sc.tweens.add({ targets: c, scale: 1, duration: 120 }); });
        c.on("pointerdown", function () { D.tri.trier.call(sc, i); });
        c.couv = couv; g.bacs.push(c);
      });
      g.fleche = this.add.triangle(0, 0, 0, 0, 36, 0, 18, 26, 0xffc531).setStrokeStyle(4, ENCRE_N).setDepth(8).setVisible(false);
      g.items = []; g.dernier = null;
    },
    start: function (g) {
      var sc = this;
      this.repeter(function () {
        var o = A.GetRandom(OBJETS_TRI); if (o === g.dernier) o = A.GetRandom(OBJETS_TRI); g.dernier = o;
        var c = sc.add.container(-80, 290).setDepth(7);
        var im = sc.img(0, -8, o[0], 88);
        var lb = sc.add.text(0, 46, o[1], { fontFamily: '"Andika", Verdana, sans-serif', fontStyle: "bold", fontSize: "15px", color: ENCRE, backgroundColor: "#fffdf6", padding: { x: 6, y: 2 } }).setOrigin(.5);
        c.add([im, lb]); c.o = o; c.im = im;
        g.items.push(c);
      }, function () { return Math.max(1050, 2500 - sc.acc() * 20) / sc.v; });
    },
    update: function (dt, t, g) {
      var vit = (W / 7.2) * this.v * (1 + this.acc() / 110);
      g.bande.tilePositionX -= vit * dt;
      g.rouleaux.forEach(function (r) { r.angle += vit * dt * 1.3; });
      g.items.forEach(function (c, i) { c.x += vit * dt; c.im.y = -8 + (i === 0 ? Math.sin(t * 10) * 4 : 0); });
      var p = g.items[0];
      if (p) { g.fleche.setVisible(true).setPosition(p.x, 206 + Math.sin(t * 8) * 5); } else g.fleche.setVisible(false);
      if (p && p.x > W - 80) {
        g.items.shift();
        this.tweens.add({ targets: p, x: p.x + 80, y: 760, angle: 160, duration: 600, ease: "Quad.easeIn", onComplete: function () { p.destroy(); } });
        this.toast("Raté ! « " + p.o[1] + " » allait dans " + BACS[p.o[2]].long + ".", 0xffd9cf);
        this.son("tombe", .6);
      }
    },
    trier: function (k) {
      var g = this.g, sc = this;
      if (this.mode !== "jeu") return;
      var it = g.items[0]; if (!it) return;
      var bac = g.bacs[k];
      if (it.o[2] === k) {
        g.items.shift();
        this.son("couvercle", .5);
        this.tweens.add({ targets: bac.couv, angle: -40, duration: 140, yoyo: true, hold: 220, ease: "Back.easeOut" });
        var x0 = it.x, y0 = it.y, prog = { u: 0 };
        this.tweens.add({
          targets: prog, u: 1, duration: 420, ease: "Quad.easeIn",
          onUpdate: function () { var u = prog.u; it.x = x0 + (bac.x - x0) * u; it.y = y0 + (bac.y - 60 - y0) * u - Math.sin(u * Math.PI) * 120; it.angle = u * 300; it.setScale(1 - u * .55); },
          onComplete: function () {
            it.destroy();
            sc.points(1, bac.x, bac.y - 90);
            sc.tweens.add({ targets: bac, scaleY: .9, scaleX: 1.08, duration: 90, yoyo: true });
          }
        });
        humeur(this, g.pico, "pico_joie", 600);
      } else {
        this.points(-1, bac.x, bac.y - 90);
        this.tweens.add({ targets: bac, x: bac.x + 10, duration: 50, yoyo: true, repeat: 3 });
        this.toast("Non ! « " + it.o[1] + " » va dans " + BACS[it.o[2]].long + ".", 0xffd9cf);
        humeur(this, g.pico, "pico_oups", 900);
      }
    },
    touche: function (e, bas) { if (bas && /^[1-4]$/.test(e.key)) D.tri.trier.call(this, Number(e.key) - 1); }
  };

  /* =========================================================== 2. PÊCHE */
  var SURF = 128;
  var DECHETS_MER = ["bouteille", "canette", "sac", "gobelet", "pneu", "chaussure", "ballon", "brique"];
  var POISSONS = ["fish_blue", "fish_brown", "fish_green", "fish_orange", "fish_pink", "fish_red", "fish_grey_long_a"];
  D.peche = {
    nom: "La pêche propre", ico: "fish_orange", chrono: true, bd: 45, seuils: [12, 20, 28], uniteSeuil: "déchets", hudY: 196,
    desc: "Pico repêche les déchets de la mer… sans embêter les poissons !", cmd: "Cliquer vite",
    regle: "La mer est pleine de déchets ! Clique dessus pour que Pico les repêche. Attention à ne pas toucher les poissons.",
    exemples: [["canette", "+1", "#36a35a", 90, "Clique sur les déchets"], ["fish_orange", "−2", "#ff6142", 100, "Laisse nager les poissons"]],
    unite: function (s) { return s + (s > 1 ? " déchets" : " déchet"); },
    savais: ["Un sac en plastique peut mettre plusieurs centaines d'années à disparaître dans la mer.", "Une tortue de mer peut avaler un sac plastique en le prenant pour une méduse.", "Un déchet jeté par terre finit souvent dans une rivière, puis dans la mer.", "Un ballon de baudruche lâché dans le ciel finit souvent en morceaux dans l'océan."],
    decor: function (g) {
      var sc = this;
      degrade(this, "fond_mer_ciel", [[0, "#ffe7a3"], [1, "#c4eefa"]], W, SURF + 10);
      degrade(this, "fond_mer_eau", [[0, "#5fd0ee"], [.45, "#2b9fd2"], [1, "#155f93"]], W, H - SURF);
      this.add.image(0, 0, "fond_mer_ciel").setOrigin(0);
      this.add.image(0, SURF, "fond_mer_eau").setOrigin(0);
      soleil(this, 990, 48, 30).setScale(.9);
      g.nuages = nuages(this, 3, 30, 70, 1);
      for (var r = 0; r < 5; r++) {
        var rg = this.add.graphics().setDepth(2).setBlendMode(Phaser.BlendModes.ADD), x0 = 120 + r * 260;
        rg.fillStyle(0xffffff, .07).fillPoints([{ x: x0, y: SURF }, { x: x0 + 70, y: SURF }, { x: x0 + 260, y: H }, { x: x0 + 110, y: H }], true);
        this.tweens.add({ targets: rg, alpha: { from: .4, to: 1 }, duration: 2200 + r * 400, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: r * 300 });
      }
      var arr = this.add.container(0, 0).setDepth(3);
      var bgs = ["background_seaweed_a", "background_seaweed_b", "background_seaweed_c", "background_seaweed_d", "background_seaweed_e", "background_rock_a", "background_rock_b"];
      for (var i = 0; i < 16; i++) arr.add(this.add.image(i * 86 + R.Between(-20, 20), H - 86, bgs[i % bgs.length]).setOrigin(.5, 1).setScale(R.FloatBetween(.9, 1.5)).setAlpha(.55));
      this.tweens.add({ targets: arr, x: { from: -10, to: 10 }, duration: 5000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.add.particles(0, 0, "bubble_a", { x: { min: 0, max: W }, y: H + 10, speedY: { min: -90, max: -40 }, speedX: { min: -10, max: 10 }, scale: { min: .12, max: .3 }, alpha: { start: .8, end: .2 }, lifespan: 9000, frequency: 260, deathZone: { type: "onLeave", source: new Phaser.Geom.Rectangle(-50, SURF + 8, W + 100, H) } }).setDepth(4);
      var sables = ["terrain_sand_top_a", "terrain_sand_top_b", "terrain_sand_top_c", "terrain_sand_top_d", "terrain_sand_top_e", "terrain_sand_top_f"];
      for (var x = 0; x < W + 64; x += 64) this.add.image(x, H, sables[(x / 64) % 6]).setOrigin(0, 1).setScale(.5, .62).setDepth(7);
      var avant = ["seaweed_green_a", "seaweed_grass_a", "rock_a", "seaweed_pink_a", "seaweed_green_c", "seaweed_orange_a", "seaweed_green_b", "rock_b", "seaweed_pink_c", "seaweed_grass_b", "seaweed_orange_b", "seaweed_green_d", "seaweed_pink_b"];
      avant.forEach(function (k, a) {
        var sp = sc.add.image(40 + a * 98 + R.Between(-18, 18), H - 30, k).setOrigin(.5, 1).setDepth(k.indexOf("rock") === 0 ? 8 : (a % 3 === 0 ? 9 : 6)).setScale(R.FloatBetween(.75, 1.05));
        if (k.indexOf("rock") !== 0) sc.tweens.add({ targets: sp, angle: { from: -5, to: 5 }, duration: R.Between(1800, 2600), yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: a * 140 });
      });
      g.vague = this.add.graphics().setDepth(11);
      g.barque = this.add.container(W / 2, SURF - 6).setDepth(13);
      g.pico = this.img(-20, -34, "pico_assis", 118); g.pico.base = "pico_assis";
      g.barque.add([g.pico, this.img(0, 0, "barque", 206).setOrigin(.5, .32)]);
      g.cibleX = W / 2; g.canne = this.add.graphics().setDepth(14); g.ligne = null; g.ents = []; g.combo = 0;
      this.input.on("pointerdown", function (p, objs) { if (sc.mode === "jeu" && objs.length === 0) g.cibleX = p.x; });
      g.fxBulles = this.add.particles(0, 0, "bubble_b", { speed: { min: 60, max: 200 }, angle: { min: 200, max: 340 }, scale: { start: .35, end: .05 }, alpha: { start: 1, end: 0 }, lifespan: 700, gravityY: -200, emitting: false }).setDepth(29);
      g.fxSplash = this.add.particles(0, 0, "p_circle_05", { speed: { min: 180, max: 380 }, angle: { min: 230, max: 310 }, scale: { start: .14, end: .02 }, gravityY: 900, lifespan: 700, tint: 0xd8f6ff, emitting: false }).setDepth(30);
      g.fxTrainee = this.add.particles(0, 0, "bubble_c", { scale: { start: .2, end: 0 }, alpha: { start: .9, end: 0 }, lifespan: 450, frequency: 30, speed: 20, emitting: false }).setDepth(19);
      g.txtCombo = this.texte(W / 2, 250, "", 50, "#ffc531").setDepth(96).setAlpha(0);
    },
    anim: function (dt, t, g) {
      var v = g.vague; v.clear();
      var pts = [{ x: 0, y: SURF + 20 }];
      for (var x = 0; x <= W; x += 16) pts.push({ x: x, y: SURF + Math.sin(x / 70 + t * 2) * 5 + Math.sin(x / 31 - t * 3) * 2 });
      pts.push({ x: W, y: SURF + 20 });
      v.fillStyle(0x5fd0ee, 1).fillPoints(pts, true).lineStyle(5, 0xffffff, .9).beginPath(); v.moveTo(pts[1].x, pts[1].y);
      for (var i = 2; i < pts.length - 1; i++) v.lineTo(pts[i].x, pts[i].y);
      v.strokePath();
      bougerNuages(g.nuages, dt);
      var b = g.barque;
      b.x += (R.Clamp(g.cibleX, 160, W - 220) - b.x) * Math.min(1, dt * 1.6);
      b.y = SURF - 6 + Math.sin(t * 2) * 4; b.angle = Math.sin(t * 1.6) * 3;
      var c = g.canne; c.clear();
      var main = { x: b.x + 42, y: b.y - 30 }, bout = { x: b.x + 78, y: b.y - 112 };
      c.lineStyle(9, 0x4a2a12).lineBetween(main.x, main.y, bout.x, bout.y).lineStyle(5, 0xc9884b).lineBetween(main.x, main.y, bout.x, bout.y);
      var fin = g.ligne ? { x: g.ligne.x, y: g.ligne.y } : { x: bout.x + 18, y: SURF + 34 + Math.sin(t * 3) * 4 };
      c.lineStyle(2.5, 0xffffff, .95);
      new Phaser.Curves.QuadraticBezier(new R.Vector2(bout.x, bout.y), new R.Vector2((bout.x + fin.x) / 2 + 20, Math.max(bout.y, fin.y) - 10), new R.Vector2(fin.x, fin.y)).draw(c, 16);
      if (!g.ligne) c.fillStyle(0xe8463c).fillCircle(fin.x, fin.y - 4, 8).fillStyle(0xffffff).fillCircle(fin.x, fin.y + 3, 8).lineStyle(3, ENCRE_N).strokeCircle(fin.x, fin.y, 10);
      g.ents = g.ents.filter(function (e) {
        if (e.mort) return false;
        var sp = e.sp; sp.x += e.vx * dt; sp.y = e.y0 + Math.sin(t * 2 + e.ph) * e.amp;
        if (e.animal) { sp.scaleY = e.ech * (1 + Math.sin(t * 12 + e.ph) * .04); sp.angle = Math.sin(t * 2 + e.ph) * 6 * (e.vx > 0 ? 1 : -1); }
        else sp.angle += e.rot * dt;
        if (sp.x < -140 || sp.x > W + 140) { sp.destroy(); return false; }
        return true;
      });
    },
    start: function (g) {
      var sc = this;
      this.repeter(function () { D.peche.apparaitre.call(sc, g); }, function () { return Math.max(380, 820 - sc.acc() * 6) / sc.v; });
    },
    apparaitre: function (g) {
      var sc = this, animal = Math.random() < .36, dir = Math.random() < .5 ? 1 : -1, y = R.Between(SURF + 90, H - 170);
      var cle = animal ? A.GetRandom(POISSONS) : A.GetRandom(DECHETS_MER);
      var sp = this.add.image(dir > 0 ? -80 : W + 80, y, cle).setDepth(5);
      var ech = animal ? R.FloatBetween(.75, 1.05) : R.FloatBetween(.62, .8) * 120 / sp.width * 1;
      if (!animal) ech = R.FloatBetween(76, 96) / sp.width;
      sp.setScale(ech); if (animal) sp.setFlipX(dir < 0);
      var e = { sp: sp, animal: animal, vx: R.Between(70, 150) * (1 + this.acc() / 90) * dir * this.v, y0: y, ph: Math.random() * 6, amp: R.Between(6, 16), rot: R.FloatBetween(-40, 40), ech: ech, mort: false };
      sp.setInteractive(new Phaser.Geom.Circle(sp.width / 2, sp.height / 2, Math.max(sp.width, sp.height) * .5), Phaser.Geom.Circle.Contains);
      if (!animal) sp.input.cursor = "pointer";
      sp.on("pointerdown", function () { D.peche.toucher.call(sc, e, g); });
      g.ents.push(e);
    },
    toucher: function (e, g) {
      var sc = this;
      if (this.mode !== "jeu" || e.mort) return;
      if (e.animal) {
        g.combo = 0;
        this.points(-2, e.sp.x, e.sp.y - 40, true); this.son("erreur", .7); this.son("choc", .5);
        e.sp.setTintFill(0xff6142); this.time.delayedCall(120, function () { e.sp.clearTint(); });
        e.vx = (e.vx > 0 ? 1 : -1) * 620;
        this.toast("Oups ! Laisse nager les poissons !", 0xffd9cf);
        humeur(this, g.pico, "pico_assis_oups", 900);
        return;
      }
      e.mort = true; e.sp.disableInteractive();
      this.son("plop", .8, R.FloatBetween(.95, 1.15));
      this.fxAnneau.explode(1, e.sp.x, e.sp.y); g.fxBulles.explode(10, e.sp.x, e.sp.y);
      this.tweens.add({ targets: e.sp, scaleX: e.ech * 1.3, scaleY: e.ech * .75, duration: 80, yoyo: true });
      var dep = { x: e.sp.x, y: e.sp.y }, prog = { t: 0 };
      g.ligne = e.sp; g.fxTrainee.startFollow(e.sp); g.fxTrainee.start();
      this.tweens.add({
        targets: prog, t: 1, duration: 520, delay: 90, ease: "Cubic.easeIn",
        onUpdate: function () {
          var b = g.barque, fin = { x: b.x + 84, y: b.y - 92 }, cx = (dep.x + fin.x) / 2, cy = Math.min(dep.y, fin.y) - 60, u = prog.t, v = 1 - u;
          e.sp.x = v * v * dep.x + 2 * v * u * cx + u * u * fin.x; e.sp.y = v * v * dep.y + 2 * v * u * cy + u * u * fin.y;
          e.sp.angle += 14; e.sp.setScale(e.ech * (1 - u * .45));
          if (u > .55 && !e.sorti) { e.sorti = true; g.fxSplash.explode(14, e.sp.x, SURF + 4); sc.son("splash", .5); }
        },
        onComplete: function () {
          g.fxTrainee.stop(); g.fxTrainee.stopFollow(); if (g.ligne === e.sp) g.ligne = null;
          var x = e.sp.x, y = e.sp.y; e.sp.destroy();
          if (sc.mode !== "jeu") return;
          g.combo++;
          var gain = g.combo % 5 === 0 ? 2 : 1;
          sc.points(gain, x, y - 30, true); sc.son("attrape", .55, 1 + Math.min(g.combo, 8) * .04);
          if (gain === 2) {
            sc.son("combo", .7);
            g.txtCombo.setText("Série de " + g.combo + " !  +1 bonus").setAlpha(1).setScale(.3);
            sc.tweens.killTweensOf(g.txtCombo);
            sc.tweens.add({ targets: g.txtCombo, scale: 1, duration: 380, ease: "Back.easeOut" });
            sc.tweens.add({ targets: g.txtCombo, alpha: 0, duration: 400, delay: 1100 });
            sc.fxEtoiles.explode(30, W / 2, 260);
          }
          humeur(sc, g.pico, "pico_assis_joie", 650);
          sc.tweens.add({ targets: g.barque, scaleY: .88, scaleX: 1.08, duration: 90, yoyo: true });
        }
      });
    },
    fin: function (g) { var sc = this; g.ents.forEach(function (e) { if (!e.mort) sc.tweens.add({ targets: e.sp, alpha: 0, duration: 400 }); }); g.ents = []; }
  };

  /* =========================================================== 3. GASPI */
  var PIECES = [
    ["Chambre", "lampe", "Lumière allumée"], ["Cuisine", "robinet", "Robinet qui coule"], ["Salon", "tele", "Télé allumée"],
    ["Bureau", "ordi", "Ordi allumé"], ["Salon", "fenetre", "Fenêtre ouverte et chauffage"], ["Salle de bain", "douche", "Douche qui coule"],
    ["Entrée", "chargeur", "Chargeur branché"], ["Cuisine", "frigo", "Frigo ouvert"], ["Chambre", "console", "Console allumée"]
  ];
  var MURS = [0xffe0c4, 0xd8eef8, 0xdff2d2, 0xebe5fb, 0xdff2d2, 0xe2f6f2, 0xfbe4ee, 0xd8eef8, 0xffe0c4];
  var MOTIFS = [0xffcfa3, 0x9fd0ea, 0xbfe3ab, 0xc7b8f0, 0xbfe3ab, 0xb8e6dd, 0xf2a9c6, 0x9fd0ea, 0xffcfa3];
  D.gaspi = {
    nom: "La chasse au gaspi", ico: "app_lampe_on", chrono: true, bd: 45, seuils: [14, 23, 31], uniteSeuil: "éteints",
    desc: "Dans la maison, tout s'allume ! Éteins avant le gaspillage.", cmd: "Cliquer vite",
    regle: "Quand un appareil s'allume et brille, clique sur la pièce pour l'éteindre. Trop lent ? C'est du gaspillage !",
    exemples: [["app_lampe_on", "+1", "#36a35a", 96, "Éteins vite"], ["app_robinet_on", "+1", "#36a35a", 96, "Ferme le robinet"], ["app_tele_on", "+1", "#36a35a", 96, "Éteins la télé"]],
    unite: function (s) { return s + (s > 1 ? " éteints" : " éteint"); },
    savais: ["Baisser le chauffage d'un seul degré économise environ 7 % d'énergie.", "Un robinet qui coule pendant le brossage des dents gaspille une dizaine de litres d'eau.", "Un appareil en veille consomme encore de l'électricité. On peut l'éteindre complètement."],
    decor: function (g) {
      var sc = this;
      degrade(this, "fond_gaspi", [[0, "#7fcdee"], [.85, "#d6f1fa"]]);
      this.add.image(0, 0, "fond_gaspi").setOrigin(0);
      soleil(this, 1110, 210, 34);
      g.nuages = nuages(this, 3, 120, 260, 1);
      var sol = this.add.graphics().setDepth(2);
      sol.fillStyle(0x5fb262).fillRect(0, 640, W, 80).lineStyle(5, ENCRE_N).lineBetween(0, 640, W, 640);
      sol.fillStyle(0xc9a36a).fillRect(560, 640, 160, 80);
      var m = this.add.graphics().setDepth(3);
      m.fillStyle(0x8d3b2b).fillRect(860, 104, 50, 90).lineStyle(5, ENCRE_N).strokeRect(860, 104, 50, 90);
      this.add.particles(885, 100, "p_circle_05", { speedY: { min: -50, max: -30 }, speedX: { min: 5, max: 25 }, scale: { start: .12, end: .5 }, alpha: { start: .7, end: 0 }, lifespan: 2600, frequency: 450, tint: 0xffffff }).setDepth(2);
      var toit = [{ x: 250, y: 222 }, { x: W / 2, y: 108 }, { x: 1030, y: 222 }];
      m.fillStyle(0xe8553a).fillPoints(toit, true).lineStyle(6, ENCRE_N).strokePoints(toit, true);
      m.lineStyle(3, 0x9a3a1c, .6).lineBetween(400, 166, 880, 166).lineBetween(330, 196, 950, 196).lineBetween(500, 140, 780, 140);
      m.fillStyle(0xf6d8a8).fillRect(290, 222, 700, 418).lineStyle(6, ENCRE_N).strokeRect(290, 222, 700, 418);
      var pw = 216, ph = 124, gx = 12;
      g.pieces = [];
      PIECES.forEach(function (pc, i) {
        var cx = 290 + 14 + (i % 3) * (pw + gx), cy = 222 + 14 + Math.floor(i / 3) * (ph + gx);
        var f = sc.add.graphics().setDepth(4);
        f.fillStyle(MURS[i]).fillRect(cx, cy, pw, ph);
        f.fillStyle(MOTIFS[i], .9);
        if (i % 3 === 0) for (var x = cx + 6; x < cx + pw; x += 22) f.fillRect(x, cy, 8, ph);
        else if (i % 3 === 1) for (var yy = cy + 10; yy < cy + ph - 12; yy += 18) for (var xx = cx + 10 + (yy / 18 % 2) * 9; xx < cx + pw - 6; xx += 18) f.fillCircle(xx, yy, 3);
        else for (var d = -ph; d < pw; d += 20) f.lineStyle(5, MOTIFS[i], .8).lineBetween(Math.max(cx, cx + d), cy + Math.max(0, -d), Math.min(cx + pw, cx + d + ph), cy + Math.min(ph, pw - d));
        f.fillStyle(0xa8743f).fillRect(cx, cy + ph - 12, pw, 12);
        f.lineStyle(5, ENCRE_N).strokeRect(cx, cy, pw, ph);
        var lueur = sc.add.image(cx + pw / 2, cy + ph / 2, "p_light_03").setDepth(5).setTint(0xffe066).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(1.1);
        var ap = sc.img(cx + pw / 2, cy + ph / 2 + 4, "app_" + pc[1], 86).setDepth(6);
        var lb = sc.add.text(cx + 8, cy + 6, pc[0], { fontFamily: '"Andika", Verdana, sans-serif', fontStyle: "bold", fontSize: "15px", color: "#4a6a60" }).setDepth(6);
        var flash = sc.add.rectangle(cx, cy, pw, ph, 0x36a35a).setOrigin(0).setAlpha(0).setDepth(7);
        var z = sc.add.zone(cx, cy, pw, ph).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(8);
        var p = { i: i, nom: pc[1], msg: pc[2], ap: ap, lueur: lueur, flash: flash, on: false, t: null, x: cx + pw / 2, y: cy + ph / 2 };
        z.on("pointerdown", function () { D.gaspi.eteindre.call(sc, p); });
        g.pieces.push(p);
      });
      g.pico = this.img(1140, 590, "pico", 150).setDepth(6); g.pico.base = "pico";
      g.gaspi = 0;
    },
    anim: function (dt, t, g) { bougerNuages(g.nuages, dt); },
    allumer: function (p) {
      var sc = this; p.on = true;
      p.ap.setTexture("app_" + p.nom + "_on");
      this.tweens.add({ targets: p.lueur, alpha: { from: .5, to: .95 }, duration: 260, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: p.ap, angle: { from: -6, to: 6 }, duration: 120, yoyo: true, repeat: -1 });
      this.son("ding", .25, R.FloatBetween(.9, 1.2));
      p.t = this.time.delayedCall(Math.max(1700, 3300 - this.acc() * 25) / this.v, function () {
        if (!p.on || sc.mode !== "jeu") return;
        D.gaspi.remettre.call(sc, p);
        sc.g.gaspi++;
        p.flash.setFillStyle(0xff6142).setAlpha(.6); sc.tweens.add({ targets: p.flash, alpha: 0, duration: 600 });
        sc.flotter(p.x, p.y - 20, "Gaspillé !", "#ff6142", 30);
        sc.son("faux", .35);
      });
    },
    remettre: function (p) {
      p.on = false; if (p.t) p.t.remove();
      this.tweens.killTweensOf(p.lueur); this.tweens.killTweensOf(p.ap);
      p.lueur.setAlpha(0); p.ap.setAngle(0).setTexture("app_" + p.nom);
    },
    eteindre: function (p) {
      if (this.mode !== "jeu" || !p.on) return;
      D.gaspi.remettre.call(this, p);
      this.son("interrupteur", .7);
      this.points(1, p.x, p.y - 10, true); this.son("bon", .4, 1.1);
      p.flash.setFillStyle(0x36a35a).setAlpha(.5); this.tweens.add({ targets: p.flash, alpha: 0, duration: 400 });
      this.tweens.add({ targets: p.ap, scale: p.ap.scale * 1.2, duration: 90, yoyo: true });
      humeur(this, this.g.pico, "pico_joie", 500);
    },
    start: function (g) {
      var sc = this;
      this.repeter(function () {
        var libres = g.pieces.filter(function (p) { return !p.on; });
        if (libres.length) D.gaspi.allumer.call(sc, A.GetRandom(libres));
      }, function () { return Math.max(480, 1200 - sc.acc() * 12) / sc.v; });
    },
    fin: function (g) { var sc = this; g.pieces.forEach(function (p) { if (p.on) D.gaspi.remettre.call(sc, p); }); }
  };

  /* =========================================================== 4. PANIER */
  var SAISON = ["pomme", "poire", "potiron", "carotte", "chataigne", "raisin"];
  var HORS = [["fraise", "Les fraises, c'est au printemps !"], ["cerise", "Les cerises, c'est en juin !"], ["pasteque", "La pastèque, c'est l'été !"], ["ananas", "L'ananas pousse dans les pays chauds."], ["tomate", "Les tomates, c'est l'été !"]];
  D.panier = {
    nom: "Le panier d'automne", ico: "potiron", chrono: true, bd: 45, seuils: [10, 17, 24], uniteSeuil: "fruits",
    desc: "Pico attrape les fruits et légumes de saison qui tombent.", cmd: "Souris, doigt ou flèches",
    regle: "Déplace Pico et son panier avec la souris, le doigt ou les flèches. Attrape ce qui pousse en automne, évite le reste !",
    exemples: [["pomme", "+1", "#36a35a", 80, "Pomme"], ["potiron", "+1", "#36a35a", 80, "Potiron"], ["fraise", "−1", "#ff6142", 80, "Fraise (printemps)"], ["pasteque", "−1", "#ff6142", 80, "Pastèque (été)"]],
    unite: function (s) { return s + (s > 1 ? " points" : " point"); },
    savais: ["Un fruit de saison pousse près de chez nous, sans serre chauffée ni avion.", "En automne, on récolte les pommes, les poires, les potirons, les châtaignes et le raisin.", "Manger de saison, c'est souvent meilleur et moins cher."],
    decor: function (g) {
      var sc = this;
      degrade(this, "fond_verger", [[0, "#7fcdee"], [.7, "#e3f6fb"]]);
      this.add.image(0, 0, "fond_verger").setOrigin(0);
      soleil(this, 1060, 190, 36);
      g.nuages = nuages(this, 4, 130, 280, 1);
      var c = this.add.graphics().setDepth(2);
      var loin = [{ x: 0, y: 470 }]; for (var x = 0; x <= W; x += 40) loin.push({ x: x, y: 470 - Math.sin(x / 210) * 50 - 20 }); loin.push({ x: W, y: H }, { x: 0, y: H });
      c.fillStyle(0xa6d98a).fillPoints(loin, true).lineStyle(5, ENCRE_N).strokePoints(loin.slice(0, -2), false);
      function arbre(x, y, r, fruit) {
        c.fillStyle(0x7a5230).fillRect(x - 8, y, 16, r * 1.2).lineStyle(4, ENCRE_N).strokeRect(x - 8, y, 16, r * 1.2);
        c.fillStyle(0x36a35a).fillCircle(x, y - r * .3, r).lineStyle(5, ENCRE_N).strokeCircle(x, y - r * .3, r);
        c.fillStyle(0x4fbd70).fillCircle(x - r * .4, y - r * .6, r * .45);
        for (var i = 0; i < 4; i++) c.fillStyle(fruit).fillCircle(x + R.Between(-r * .6, r * .6), y - r * .3 + R.Between(-r * .5, r * .4), 7).lineStyle(2, ENCRE_N).strokeCircle(x + 0, y, 0);
      }
      arbre(120, 400, 64, 0xe8463c); arbre(380, 420, 46, 0xffc531); arbre(880, 410, 52, 0xe8463c); arbre(1180, 390, 70, 0xff8a1f);
      var pres = [{ x: 0, y: 620 }]; for (var x2 = 0; x2 <= W; x2 += 40) pres.push({ x: x2, y: 610 + Math.sin(x2 / 120) * 10 }); pres.push({ x: W, y: H }, { x: 0, y: H });
      c.fillStyle(0x5fb262).fillPoints(pres, true).lineStyle(5, ENCRE_N).strokePoints(pres.slice(0, -2), false);
      c.lineStyle(4, 0x2a7a3a);
      for (var t = 0; t < 14; t++) { var tx = 40 + t * 92, ty = 680 + (t % 3) * 10; c.lineBetween(tx, ty, tx - 6, ty - 16).lineBetween(tx + 6, ty, tx + 6, ty - 18).lineBetween(tx + 12, ty, tx + 18, ty - 14); }
      g.porteur = this.add.container(W / 2, H - 92).setDepth(20);
      g.pico = this.img(-6, -62, "pico_assis", 130); g.pico.base = "pico_assis";
      g.panier = this.img(0, 0, "panier", 170);
      g.porteur.add([g.pico, g.panier]);
      g.cible = null; g.gauche = false; g.droite = false; g.items = [];
      this.input.on("pointermove", function (p) { g.cible = p.x; });
      this.input.on("pointerdown", function (p) { g.cible = p.x; });
    },
    anim: function (dt, t, g) { bougerNuages(g.nuages, dt); },
    start: function (g) {
      var sc = this;
      this.repeter(function () {
        var bon = Math.random() < .56, o = bon ? [A.GetRandom(SAISON), ""] : A.GetRandom(HORS);
        var sp = sc.img(R.Between(40, W - 40), -50, o[0], 76).setDepth(15);
        g.items.push({ sp: sp, bon: bon, msg: o[1], v: R.Between(150, 210) * sc.v * (1 + sc.acc() / 100), rot: R.FloatBetween(-120, 120) });
      }, function () { return Math.max(420, 900 - sc.acc() * 7) / sc.v; });
    },
    update: function (dt, t, g) {
      var sc = this, p = g.porteur;
      if (g.gauche || g.droite) { g.cible = null; p.x += (g.droite ? 1 : -1) * 640 * dt; }
      else if (g.cible != null) p.x += (g.cible - p.x) * Math.min(1, dt * 14);
      p.x = R.Clamp(p.x, 80, W - 80);
      var bord = p.y - 40;
      g.items = g.items.filter(function (it) {
        it.sp.y += it.v * dt; it.sp.angle += it.rot * dt;
        if (it.sp.y > bord - 20 && it.sp.y < bord + 30 && Math.abs(it.sp.x - p.x) < 78) {
          if (it.bon) {
            sc.points(1, p.x, bord - 30, true); sc.son("feuille", .7, R.FloatBetween(.9, 1.2));
            sc.tweens.add({ targets: it.sp, x: p.x + R.Between(-30, 30), y: bord + 10, scale: it.sp.scale * .6, alpha: 0, duration: 160, onComplete: function () { it.sp.destroy(); } });
            sc.tweens.add({ targets: g.panier, scaleY: g.panier.scale * .85, duration: 80, yoyo: true });
            humeur(sc, g.pico, "pico_assis_joie", 500);
          } else {
            sc.points(-1, p.x, bord - 30, true); sc.son("faux", .6); sc.toast(it.msg, 0xffd9cf);
            sc.tweens.add({ targets: it.sp, x: it.sp.x + (it.sp.x > p.x ? 220 : -220), y: it.sp.y - 160, angle: 400, alpha: 0, duration: 600, ease: "Quad.easeOut", onComplete: function () { it.sp.destroy(); } });
            humeur(sc, g.pico, "pico_assis_oups", 800);
          }
          return false;
        }
        if (it.sp.y > H - 40) {
          sc.fxPoussiere.explode(6, it.sp.x, H - 30);
          sc.tweens.add({ targets: it.sp, y: it.sp.y - 30, alpha: 0, duration: 350, ease: "Quad.easeOut", onComplete: function () { it.sp.destroy(); } });
          return false;
        }
        return true;
      });
    },
    touche: function (e, bas, g) { if (e.key === "ArrowLeft") g.gauche = bas; if (e.key === "ArrowRight") g.droite = bas; },
    fin: function (g) { var sc = this; g.items.forEach(function (it) { sc.tweens.add({ targets: it.sp, alpha: 0, duration: 300 }); }); g.items = []; }
  };

  /* =========================================================== 5. VÉLO */
  var SOL = 652;
  D.velo = {
    nom: "À l'école à vélo", ico: "velo", chrono: true, bd: 45, seuils: [9, 16, 23], uniteSeuil: "points",
    desc: "Pico pédale jusqu'à l'école : ramasse les feuilles, saute les voitures.", cmd: "Clic ou Espace pour sauter",
    regle: "Clique ou appuie sur Espace pour faire sauter Pico. Ramasse les feuilles et saute par-dessus les voitures et les travaux !",
    exemples: [["feuille", "+1", "#36a35a", 70, "Ramasse les feuilles"], ["voiture", "−2", "#ff6142", 130, "Saute les voitures"], ["travaux", "−2", "#ff6142", 100, "Et les travaux"]],
    savais: ["À vélo ou à pied, on ne rejette aucune fumée : l'air reste plus propre pour tout le monde.", "Pour aller à l'école, marcher ou pédaler, c'est aussi bon pour la santé.", "Une voiture rejette du gaz carbonique, qui réchauffe la planète."],
    decor: function (g) {
      var sc = this;
      degrade(this, "fond_velo", [[0, "#ffd9a0"], [.5, "#a8e0f3"]]);
      this.add.image(0, 0, "fond_velo").setOrigin(0);
      soleil(this, 980, 150, 38);
      g.nuages = nuages(this, 3, 130, 230, 1);
      if (!this.textures.exists("montagnes")) {
        var m = this.make.graphics({ add: false });
        var pm = [{ x: 0, y: 240 }, { x: 90, y: 70 }, { x: 160, y: 170 }, { x: 260, y: 30 }, { x: 360, y: 190 }, { x: 430, y: 100 }, { x: 520, y: 240 }];
        m.fillStyle(0x94c3d8).fillPoints(pm, true).lineStyle(5, ENCRE_N).strokePoints(pm, false);
        m.fillStyle(0xfffdf6).fillPoints([{ x: 260, y: 30 }, { x: 290, y: 70 }, { x: 272, y: 64 }, { x: 256, y: 78 }, { x: 240, y: 62 }], true);
        m.fillStyle(0xfffdf6).fillPoints([{ x: 90, y: 70 }, { x: 112, y: 100 }, { x: 96, y: 94 }, { x: 80, y: 104 }, { x: 72, y: 92 }], true);
        m.generateTexture("montagnes", 520, 240); m.destroy();
        var c = this.make.graphics({ add: false });
        var pc = [{ x: 0, y: 180 }]; for (var x = 0; x <= 440; x += 20) pc.push({ x: x, y: 110 - Math.sin(x / 440 * Math.PI * 2) * 40 }); pc.push({ x: 440, y: 180 });
        c.fillStyle(0x7cc66a).fillPoints(pc, true).lineStyle(5, ENCRE_N).strokePoints(pc.slice(1, -1), false);
        [[100, 70, 26, 0x36a35a], [300, 100, 32, 0x1d8a4a], [380, 120, 20, 0x4fbd70]].forEach(function (a) {
          c.fillStyle(0x7a5230).fillRect(a[0] - 5, a[1], 10, 40).lineStyle(3, ENCRE_N).strokeRect(a[0] - 5, a[1], 10, 40);
          c.fillStyle(a[3]).fillCircle(a[0], a[1] - 4, a[2]).lineStyle(4, ENCRE_N).strokeCircle(a[0], a[1] - 4, a[2]);
        });
        c.generateTexture("collines", 440, 180); c.destroy();
        var r = this.make.graphics({ add: false });
        r.fillStyle(0x4c5964).fillRect(0, 0, 160, 120).fillStyle(0xfffdf6).fillRect(0, 56, 70, 8).fillStyle(0x434f5a).fillRect(0, 0, 160, 6);
        r.generateTexture("route", 160, 120); r.destroy();
        var b = this.make.graphics({ add: false });
        b.fillStyle(0xfffdf6).fillRect(0, 0, 40, 12).fillStyle(0xff6142).fillRect(40, 0, 40, 12);
        b.generateTexture("bordure", 80, 12); b.destroy();
      }
      g.mont = this.add.tileSprite(0, H - 430, W, 240, "montagnes").setOrigin(0).setDepth(2);
      g.coll = this.add.tileSprite(0, H - 300, W, 180, "collines").setOrigin(0).setDepth(3);
      this.add.rectangle(0, H - 130, W, 20, 0x5fb262).setOrigin(0).setDepth(3);
      g.bord = this.add.tileSprite(0, H - 122, W, 12, "bordure").setOrigin(0).setDepth(4);
      g.route = this.add.tileSprite(0, H - 110, W, 110, "route").setOrigin(0).setDepth(4);
      g.ombre = this.add.ellipse(210, SOL + 2, 120, 16, 0x000000, .3).setDepth(5);
      g.cyc = this.img(210, SOL, "velo", 160).setOrigin(.5, .97).setDepth(10);
      g.y = 0; g.vy = 0; g.inv = 0; g.objs = []; g.dernierObst = -9; g.decal = 0;
      g.fxPous = this.add.particles(0, 0, "p_circle_05", { speedX: { min: -160, max: -60 }, speedY: { min: -60, max: -10 }, scale: { start: .1, end: .3 }, alpha: { start: .6, end: 0 }, lifespan: 500, tint: 0xd9c9a8, emitting: false }).setDepth(9);
      g.sauter = function () {
        if (sc.mode !== "jeu" || g.y > 1) return;
        g.vy = 900; sc.son("saut", .5);
        sc.tweens.add({ targets: g.cyc, scaleY: g.cyc.scale * .82, scaleX: g.cyc.scale * 1.1, duration: 70, yoyo: true });
      };
      this.input.on("pointerdown", function () { g.sauter(); });
    },
    anim: function (dt, t, g) {
      bougerNuages(g.nuages, dt);
      var vit = this.mode === "jeu" ? (330 + this.acc() * 2.5) * this.v : (this.mode === "fin" ? 0 : 120);
      g.vitesse = vit;
      g.mont.tilePositionX += vit * .08 * dt; g.coll.tilePositionX += vit * .3 * dt; g.route.tilePositionX += vit * dt; g.bord.tilePositionX += vit * dt;
      if (g.y <= 0 && vit > 0) { g.cyc.y = SOL + Math.sin(t * 24) * 1.5; if (Math.random() < .5) g.fxPous.emitParticleAt(g.cyc.x - 60, SOL - 4); }
    },
    start: function (g) {
      var sc = this;
      this.repeter(function () {
        var obst = Math.random() < .45 && sc.ecoule - g.dernierObst > .8 / sc.v, o;
        if (obst) { g.dernierObst = sc.ecoule; var voiture = Math.random() < .55; o = { cle: voiture ? "voiture" : "travaux", h: 0, obst: true, voit: voiture }; }
        else o = { cle: "feuille", h: Math.random() < .5 ? 20 : 170, obst: false };
        o.sp = sc.img(W + 100, SOL - o.h, o.cle, o.obst ? (o.voit ? 150 : 110) : 58).setOrigin(.5, o.obst ? .97 : .5).setDepth(8);
        if (!o.obst) { o.sp.y = SOL - 30 - o.h; sc.tweens.add({ targets: o.sp, angle: { from: -15, to: 15 }, duration: 500, yoyo: true, repeat: -1 }); }
        g.objs.push(o);
      }, function () { return R.Between(700, 1200) / sc.v; });
    },
    update: function (dt, t, g) {
      var sc = this;
      var avant = g.y;
      g.vy -= 2300 * dt; g.y += g.vy * dt;
      if (g.y <= 0) { g.y = 0; g.vy = 0; if (avant > 30) { this.fxPoussiere.explode(10, g.cyc.x, SOL); this.son("bois", .3); this.tweens.add({ targets: g.cyc, scaleY: g.cyc.scale * .85, scaleX: g.cyc.scale * 1.08, duration: 80, yoyo: true }); } }
      if (g.y > 0) { g.cyc.y = SOL - g.y; g.cyc.angle = R.Clamp(-g.vy / 60, -12, 12); } else g.cyc.angle = 0;
      g.ombre.setScale(1 - Math.min(.5, g.y / 400)).setAlpha(.3 - Math.min(.2, g.y / 1000));
      if (g.inv > 0) { g.inv -= dt; g.cyc.setAlpha(Math.sin(t * 40) > 0 ? 1 : .35); } else g.cyc.setAlpha(1);
      var rc = new Phaser.Geom.Rectangle(g.cyc.x - 62, g.cyc.y - 130, 124, 120);
      g.objs = g.objs.filter(function (o) {
        o.sp.x -= (o.voit ? g.vitesse * 1.3 : g.vitesse) * dt;
        var b = o.sp.getBounds(); Phaser.Geom.Rectangle.Inflate(b, -14, -10);
        if (Phaser.Geom.Intersects.RectangleToRectangle(rc, b)) {
          if (!o.obst) { sc.points(1, o.sp.x, o.sp.y - 20, true); sc.son("feuille", .8, R.FloatBetween(1, 1.25)); o.sp.destroy(); return false; }
          if (g.inv <= 0) {
            g.inv = 1.2; sc.points(-2, g.cyc.x + 40, g.cyc.y - 150, true); sc.son("choc", .6); sc.son("faux", .4);
            sc.toast("Aïe ! Attention aux " + (o.voit ? "voitures" : "travaux") + " !", 0xffd9cf);
          }
        }
        if (o.sp.x < -160) { o.sp.destroy(); return false; }
        return true;
      });
    },
    touche: function (e, bas, g) { if (bas && (e.key === " " || e.key === "ArrowUp")) { if (e.preventDefault) e.preventDefault(); g.sauter(); } }
  };

  /* =========================================================== 6. MEMORY */
  var PAIRES = [
    [["pico", "Hérisson"], ["feuilles", "Tas de feuilles"], "Le hérisson dort tout l'hiver sous un tas de feuilles."],
    [["abeille", "Abeille"], ["fleurs", "Fleurs"], "L'abeille butine les fleurs et aide les fruits à pousser."],
    [["mesange", "Mésange"], ["nichoir", "Nichoir"], "La mésange fait son nid au printemps et mange les chenilles."],
    [["coccinelle", "Coccinelle"], ["hotel", "Hôtel à insectes"], "La coccinelle mange les pucerons : c'est l'amie du jardinier."],
    [["av_frog", "Grenouille"], ["mare", "Mare"], "La grenouille pond dans la mare, les têtards y grandissent."],
    [["ver", "Ver de terre"], ["compost", "Compost"], "Le ver de terre transforme les épluchures en bonne terre."]
  ];
  D.memory = {
    nom: "Le memory des abris", ico: "coccinelle", chrono: true, plusPetitMieux: true, uniteSeuil: "",
    desc: "Retrouve chaque animal et la maison qu'il préfère.", cmd: "Retourner les cartes",
    regle: "Retourne 2 cartes pour associer chaque animal à son abri, avant la fin du temps. Moins d'erreurs = plus d'étoiles !",
    exemples: [["abeille", "+", "#36a35a", 90, "Abeille"], ["fleurs", "=", "#36a35a", 90, "Fleurs"]],
    hud: function (g) { return (g.paires || 0) + "/6"; },
    unite: function (s, g) { var e = g.err || 0; return g.fini ? e + (e > 1 ? " erreurs" : " erreur") : (g.paires || 0) + " / 6 paires"; },
    valeurRecord: function (s, g) { return g.fini ? g.err : 100 - (g.paires || 0); },
    recTxt: function (v) { return v + (v > 1 ? " erreurs" : " erreur"); },
    etoiles: function (s, g) { if (!g.fini) return g.paires >= 4 ? 1 : 0; return g.err <= 3 ? 3 : g.err <= 7 ? 2 : 1; },
    savais: ["Un jardin un peu sauvage, avec des feuilles mortes et des fleurs, accueille beaucoup plus d'animaux.", "Un hôtel à insectes se fabrique avec des bouts de bois, des pommes de pin et des tiges creuses.", "Le hérisson hiberne environ de novembre à mars."],
    decor: function (g) {
      var sc = this;
      if (!this.textures.exists("liege")) {
        var t = this.textures.createCanvas("liege", 64, 64), c = t.getContext();
        c.fillStyle = "#c99158"; c.fillRect(0, 0, 64, 64);
        for (var i = 0; i < 40; i++) { c.fillStyle = Math.random() < .5 ? "#a86d3a" : "#ddb07a"; c.beginPath(); c.arc(Math.random() * 64, Math.random() * 64, Math.random() * 2.2 + .6, 0, 7); c.fill(); }
        t.refresh();
      }
      this.add.tileSprite(0, 0, W, H, "liege").setOrigin(0);
      var cadre = this.add.graphics();
      cadre.lineStyle(26, 0xa8743f).strokeRect(13, 13, W - 26, H - 26).lineStyle(5, ENCRE_N).strokeRect(0, 0, W, H).strokeRect(26, 26, W - 52, H - 52);
      g.pico = this.img(1180, 640, "pico", 120).setDepth(30); g.pico.base = "pico";
      var cartes = [];
      PAIRES.forEach(function (p, i) { cartes.push({ id: i, x: p[0], f: p[2] }); cartes.push({ id: i, x: p[1], f: p[2] }); });
      cartes = A.Shuffle(cartes);
      var cw = 186, ch = 160, gap = 22, x0 = (W - (4 * cw + 3 * gap)) / 2 + cw / 2, y0 = 136 + ch / 2;
      g.cartes = cartes.map(function (c, k) {
        var x = x0 + (k % 4) * (cw + gap), y = y0 + Math.floor(k / 4) * (ch + gap);
        var cont = sc.add.container(x, y).setDepth(10).setAngle(R.FloatBetween(-2.5, 2.5));
        var dos = sc.add.graphics();
        dos.fillStyle(0x0b2a24, .3).fillRoundedRect(-cw / 2 + 4, -ch / 2 + 8, cw, ch, 14);
        dos.fillStyle(0x36a35a).fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 14);
        for (var a = 0; a < 5; a++) for (var b = 0; b < 4; b++) dos.fillStyle(0x4fbd70).fillCircle(-cw / 2 + 20 + a * 37, -ch / 2 + 22 + b * 38, 9);
        dos.lineStyle(5, ENCRE_N).strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 14);
        var q = sc.texte(0, 4, "?", 72);
        var face = sc.add.container(0, 0).setVisible(false);
        var fg = sc.add.graphics();
        fg.fillStyle(0x0b2a24, .3).fillRoundedRect(-cw / 2 + 4, -ch / 2 + 8, cw, ch, 14);
        fg.fillStyle(0xfffdf6).fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 14).lineStyle(5, ENCRE_N).strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 14);
        var vert = sc.add.graphics().lineStyle(8, 0x36a35a).strokeRoundedRect(-cw / 2 + 6, -ch / 2 + 6, cw - 12, ch - 12, 10).setVisible(false);
        face.add([fg, vert, sc.img(0, -14, c.x[0], 100), sc.ecrit(0, 54, c.x[1], 18)]);
        var pin = sc.add.graphics().fillStyle(k % 2 ? 0xffc531 : 0xff6142).fillCircle(0, -ch / 2 + 2, 11).lineStyle(3, ENCRE_N).strokeCircle(0, -ch / 2 + 2, 11).fillStyle(0xffffff, .7).fillCircle(-3, -ch / 2 - 1, 3);
        cont.add([dos, q, face, pin]);
        cont.setSize(cw, ch).setInteractive({ useHandCursor: true });
        cont.on("pointerdown", function () { D.memory.retourner.call(sc, c); });
        cont.on("pointerover", function () { if (!c.ouverte) sc.tweens.add({ targets: cont, scale: 1.05, duration: 100 }); });
        cont.on("pointerout", function () { sc.tweens.add({ targets: cont, scale: 1, duration: 100 }); });
        c.cont = cont; c.dos = [dos, q]; c.face = face; c.vert = vert; c.ouverte = false;
        return c;
      });
      g.sel = []; g.paires = 0; g.err = 0; g.lock = true; g.fini = false;
    },
    montrer: function (c, oui, vite) {
      var sc = this; c.ouverte = oui;
      if (vite) { c.dos.forEach(function (o) { o.setVisible(!oui); }); c.face.setVisible(oui); return; }
      this.tweens.add({ targets: c.cont, scaleX: 0, duration: 110, ease: "Quad.easeIn", onComplete: function () {
        c.dos.forEach(function (o) { o.setVisible(!oui); }); c.face.setVisible(oui);
        sc.tweens.add({ targets: c.cont, scaleX: 1, duration: 140, ease: "Back.easeOut" });
      } });
    },
    retourner: function (c) {
      var sc = this, g = this.g;
      if (this.mode !== "jeu" || g.lock || c.trouve || c.ouverte) return;
      D.memory.montrer.call(this, c, true); g.sel.push(c); this.son("carte", .7);
      if (g.sel.length < 2) return;
      var x = g.sel[0], y = g.sel[1]; g.sel = [];
      if (x.id === y.id) {
        x.trouve = y.trouve = true; g.paires++; if (g.paires === 6) g.fini = true;
        this.time.delayedCall(260, function () {
          [x, y].forEach(function (k) { k.vert.setVisible(true); sc.tweens.add({ targets: k.cont, scale: 1.12, duration: 140, yoyo: true }); sc.fxEtoiles.explode(10, k.cont.x, k.cont.y); });
          sc.score = g.paires; sc.majScore(); sc.son("bon", .6, 1 + g.paires * .05);
          sc.toast(x.f, 0xd8f3d2);
          humeur(sc, g.pico, "pico_joie", 700);
          if (g.fini) sc.time.delayedCall(1100, function () { sc.finir(); });
        });
      } else {
        g.err++; g.lock = true;
        this.time.delayedCall(450, function () { sc.son("faux", .4); [x, y].forEach(function (k) { sc.tweens.add({ targets: k.cont, x: k.cont.x + 8, duration: 50, yoyo: true, repeat: 2 }); }); });
        this.time.delayedCall(1050, function () { D.memory.montrer.call(sc, x, false); D.memory.montrer.call(sc, y, false); g.lock = false; });
      }
    },
    start: function (g) {
      var sc = this, apercu = { doux: 3000, normal: 1500, turbo: 0 }[PICO.S.diff];
      if (apercu) {
        g.cartes.forEach(function (c) { D.memory.montrer.call(sc, c, true); });
        this.toast("Mémorise les cartes !", 0xd8f3d2);
        this.time.delayedCall(apercu, function () { g.cartes.forEach(function (c) { D.memory.montrer.call(sc, c, false); }); g.lock = false; });
      } else g.lock = false;
    }
  };

  /* =========================================================== 7. QUIZ */
  var QUIZ = [
    ["Une bouteille en verre peut être recyclée à l'infini.", true, "Le verre fondu redevient du verre, encore et encore."],
    ["Un chewing-gum jeté par terre disparaît en une semaine.", false, "Il met environ 5 ans à disparaître !"],
    ["Les abeilles aident les fruits à pousser.", true, "En butinant, elles transportent le pollen de fleur en fleur."],
    ["Le hérisson aide le jardinier en mangeant des limaces.", true, "Il mange limaces, escargots et insectes."],
    ["On peut jeter les piles usées dans la poubelle normale.", false, "Les piles sont dangereuses pour la nature : on les rapporte au magasin, dans un bac spécial."],
    ["Fermer le robinet en se brossant les dents économise de l'eau.", true, "On économise une dizaine de litres à chaque brossage."],
    ["La voiture pollue moins que le vélo.", false, "Le vélo ne rejette aucune fumée."],
    ["Les feuilles mortes peuvent aller dans le compost.", true, "Elles se transforment en terre riche pour le jardin."],
    ["Une tortue de mer peut avaler un sac plastique en le prenant pour une méduse.", true, "C'est pour ça qu'il ne faut jamais laisser de sac traîner."],
    ["Les vers de terre abîment la terre du jardin.", false, "Au contraire : ils creusent des galeries et rendent la terre meilleure."],
    ["En novembre, les fraises poussent dans les champs en France.", false, "Les fraises poussent au printemps et en été."],
    ["Éteindre la lumière en quittant une pièce ne sert à rien.", false, "Une lampe allumée dans une pièce vide gaspille de l'électricité."],
    ["Un papier de bonbon jeté dans la rue peut finir dans la mer.", true, "La pluie l'emporte dans les égouts, puis dans les rivières et la mer."],
    ["Les arbres fabriquent l'oxygène que nous respirons.", true, "Leurs feuilles rejettent de l'oxygène grâce à la lumière du soleil."],
    ["Le pot de confiture en verre va dans la poubelle jaune.", false, "Le verre va dans le bac à verre."],
    ["Réparer un objet, c'est un déchet en moins.", true, "Un objet réparé n'a pas besoin d'être jeté ni refabriqué."],
    ["Les vêtements trop petits doivent aller à la poubelle.", false, "On peut les donner ou les déposer dans une borne à vêtements."],
    ["L'eau douce qu'on peut boire est une toute petite partie de l'eau de la Terre.", true, "La plupart de l'eau de la Terre est salée, dans les océans."]
  ];
  D.quiz = {
    nom: "Vrai ou faux éclair", ico: "etoile", chrono: false, adapte: false, seuils: [5, 7, 9], uniteSeuil: "bonnes",
    desc: "10 questions sur la scène du théâtre. Qui répondra le plus vite ?", cmd: "Clic ou touches V et F",
    regle: "Lis la phrase, puis réponds VRAI ou FAUX (touches V et F) avant la fin de la barre.",
    exemples: [["pico_joie", "VRAI", "#36a35a", 110], ["pico_oups", "FAUX", "#ff6142", 110]],
    hud: function () { return this.score + "/10"; },
    unite: function (s) { return s + " / 10"; },
    recTxt: function (v) { return v + " / 10"; },
    statut: function (g) { return "Question " + Math.min(10, (g.i || 0) + 1) + " sur 10"; },
    savais: ["Les piles usagées se rapportent en magasin, dans un bac de collecte.", "Un chewing-gum met environ 5 ans à disparaître dans la nature.", "La plupart de l'eau de la Terre est salée : l'eau qu'on peut boire est précieuse."],
    decor: function (g) {
      var sc = this;
      degrade(this, "fond_quiz", [[0, "#40236a"], [1, "#1a0f33"]]);
      this.add.image(0, 0, "fond_quiz").setOrigin(0);
      [[180, 0, 640, 720], [1100, 0, 640, 720]].forEach(function (s, i) {
        var l = sc.add.graphics().setBlendMode(Phaser.BlendModes.ADD).setDepth(1);
        l.fillStyle(0xfff0b0, .12).fillPoints([{ x: s[0] - 20, y: 0 }, { x: s[0] + 20, y: 0 }, { x: s[2] + 200, y: s[3] }, { x: s[2] - 200, y: s[3] }], true);
        sc.tweens.add({ targets: l, alpha: { from: .5, to: 1 }, duration: 1600 + i * 500, yoyo: true, repeat: -1 });
      });
      var sol = this.add.graphics().setDepth(2);
      sol.fillStyle(0xa8743f).fillRect(0, 640, W, 80).lineStyle(5, ENCRE_N).lineBetween(0, 640, W, 640);
      for (var x = 0; x < W; x += 90) sol.lineStyle(3, 0x7d4f22).lineBetween(x, 640, x - 30, 720);
      var r = this.add.graphics().setDepth(20);
      [[0, 1], [W, -1]].forEach(function (cfg) {
        var x0 = cfg[0], s = cfg[1];
        for (var k = 0; k < 7; k++) {
          var xa = x0 + s * k * 22, xb = xa + s * 22;
          r.fillStyle(k % 2 ? 0xa82a26 : 0xd6403a).fillRect(Math.min(xa, xb), 0, 22, 690 - k * 26);
        }
        var bordX = x0 + s * 154;
        r.lineStyle(5, ENCRE_N).lineBetween(bordX, 0, bordX, 690 - 6 * 26);
        r.fillStyle(0xffc531).fillRoundedRect(Math.min(x0, x0 + s * 160) + (s > 0 ? 0 : 0), 430, 160, 16, 8).lineStyle(4, ENCRE_N).strokeRoundedRect(Math.min(x0, x0 + s * 160), 430, 160, 16, 8);
      });
      for (var c = 0; c < W; c += 64) { r.fillStyle(0xd6403a).fillCircle(c + 32, 0, 38).lineStyle(5, ENCRE_N).strokeCircle(c + 32, 0, 38); }
      g.pico = this.img(250, 620, "pico", 190).setOrigin(.5, 1).setDepth(10); g.pico.base = "pico";
      // carte de question suspendue
      var cq = this.add.container(W / 2, 250).setDepth(10);
      var fils = this.add.graphics().lineStyle(4, 0xfffdf6).lineBetween(-200, -230, -200, -120).lineBetween(200, -230, 200, -120);
      var fond = this.add.graphics();
      fond.fillStyle(0x0b0618, .4).fillRoundedRect(-330 + 6, -125 + 10, 660, 250, 22).fillStyle(0xfffdf6).fillRoundedRect(-330, -125, 660, 250, 22).lineStyle(6, ENCRE_N).strokeRoundedRect(-330, -125, 660, 250, 22);
      g.num = this.texte(0, -86, "", 26, "#ff6142", { strokeThickness: 0 });
      g.q = this.ecrit(0, 10, "Prépare-toi…", 32, ENCRE, 590);
      cq.add([fils, fond, g.num, g.q]); g.carte = cq;
      this.tweens.add({ targets: cq, angle: { from: -1.2, to: 1.2 }, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      g.barre = this.add.graphics().setDepth(10);
      g.bVrai = this.bouton(W / 2 - 160, 480, 260, 96, "VRAI", 0x36a35a, function () { D.quiz.repondre.call(sc, true); }).setDepth(12);
      g.bFaux = this.bouton(W / 2 + 160, 480, 260, 96, "FAUX", 0xff6142, function () { D.quiz.repondre.call(sc, false); }).setDepth(12);
      g.bVrai.label.setFontSize(44); g.bFaux.label.setFontSize(44);
      g.bVrai.add(this.texte(100, 30, "V", 20, "#fffdf6")); g.bFaux.add(this.texte(100, 30, "F", 20, "#fffdf6"));
      g.retour = this.add.container(W / 2, 520).setDepth(14).setVisible(false);
      g.retourFond = this.add.graphics();
      g.retourTitre = this.texte(0, -56, "", 34, "#36a35a");
      g.retourTxt = this.ecrit(0, -2, "", 22, ENCRE, 560);
      g.suivant = this.bouton(0, 76, 300, 62, "Question suivante", 0xff8a1f, function () { D.quiz.suivante.call(sc); });
      g.retour.add([g.retourFond, g.retourTitre, g.retourTxt, g.suivant]);
      g.qs = A.Shuffle(QUIZ.slice()).slice(0, 10); g.i = 0; g.rep = true;
      g.limite = PICO.TEMPS_QUIZ[PICO.S.temps] / Math.max(.8, this.v);
    },
    afficher: function () {
      var g = this.g, q = g.qs[g.i];
      g.num.setText("Question " + (g.i + 1) + " sur 10");
      g.q.setText(q[0]);
      g.q.setScale(.8).setAlpha(0); this.tweens.add({ targets: g.q, scale: 1, alpha: 1, duration: 250, ease: "Back.easeOut" });
      g.bVrai.setVisible(true); g.bFaux.setVisible(true); g.retour.setVisible(false);
      g.reste = g.limite; g.rep = false; this.majChrono();
      g.pico.setTexture("pico");
      this.boutonEntree = null;
    },
    repondre: function (v) {
      var sc = this, g = this.g;
      if (this.mode !== "jeu" || g.rep) return;
      g.rep = true; var q = g.qs[g.i], ok = v === q[1];
      if (ok) { this.score++; this.majScore(); this.son("bon", .7); this.fxEtoiles.explode(24, g.pico.x, g.pico.y - 120); g.pico.setTexture("pico_joie"); this.tweens.add({ targets: g.pico, y: g.pico.y - 30, duration: 160, yoyo: true, ease: "Quad.easeOut" }); }
      else { this.son("faux", .6); g.pico.setTexture("pico_oups"); this.cameras.main.shake(150, .004); }
      g.bVrai.setVisible(false); g.bFaux.setVisible(false); g.barre.clear();
      var f = g.retourFond; f.clear();
      f.fillStyle(0x0b0618, .4).fillRoundedRect(-310 + 6, -100 + 10, 620, 214, 20).fillStyle(ok ? 0xd8f3d2 : 0xffd9cf).fillRoundedRect(-310, -100, 620, 214, 20).lineStyle(5, ENCRE_N).strokeRoundedRect(-310, -100, 620, 214, 20);
      g.retourTitre.setText((v === null ? "Temps écoulé ! " : ok ? "Bravo ! " : "Raté ! ") + "C'est " + (q[1] ? "VRAI" : "FAUX") + ".").setColor(ok ? "#36a35a" : "#ff6142");
      g.retourTxt.setText(q[2]);
      g.suivant.label.setText(g.i < 9 ? "Question suivante" : "Voir le résultat");
      g.retour.setVisible(true).setScale(.7); this.tweens.add({ targets: g.retour, scale: 1, duration: 260, ease: "Back.easeOut" });
      this.boutonEntree = function () { D.quiz.suivante.call(sc); };
    },
    suivante: function () {
      var g = this.g;
      if (this.mode !== "jeu" || !g.rep) return;
      g.i++;
      if (g.i >= 10) { this.boutonEntree = null; this.finir(); } else D.quiz.afficher.call(this);
    },
    start: function () { D.quiz.afficher.call(this); },
    update: function (dt, t, g) {
      if (g.rep) return;
      g.reste -= dt;
      var r = Math.max(0, g.reste / g.limite), b = g.barre; b.clear();
      b.fillStyle(0x0b0618, .5).fillRoundedRect(W / 2 - 260, 400, 520, 22, 11);
      b.fillStyle(r < .3 ? 0xff6142 : 0xffc531).fillRoundedRect(W / 2 - 260, 400, Math.max(22, 520 * r), 22, 11);
      b.lineStyle(4, 0xfffdf6).strokeRoundedRect(W / 2 - 260, 400, 520, 22, 11);
      if (g.reste <= 0) D.quiz.repondre.call(this, null);
    },
    touche: function (e, bas, g) {
      if (!bas) return;
      if (!g.rep && (e.key === "v" || e.key === "V")) D.quiz.repondre.call(this, true);
      else if (!g.rep && (e.key === "f" || e.key === "F")) D.quiz.repondre.call(this, false);
      else if (g.rep && (e.key === "Enter" || e.key === " ")) D.quiz.suivante.call(this);
    }
  };

  PICO.ORDRE = ["tri", "peche", "gaspi", "panier", "velo", "memory", "quiz"];
})();
