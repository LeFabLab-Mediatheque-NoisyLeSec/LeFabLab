/* Moteur commun : état sauvegardé, chargement, scène de défi générique (intro, compte à rebours, HUD, fins solo/duel), et accueil HTML. */
(function () {
  "use strict";
  var W = 1280, H = 720, ENCRE = "#1c3b33", ENCRE_N = 0x1c3b33;
  var PICO = window.PICO = window.PICO || {};
  PICO.W = W; PICO.H = H;
  var DIFF = PICO.DIFF = { doux: .72, normal: 1, turbo: 1.3 };
  var TEMPS_QUIZ = PICO.TEMPS_QUIZ = { 30: 10, 45: 12, 60: 14, 90: 18 };
  var AVATARS = PICO.AVATARS = ["bear", "chick", "cow", "dog", "duck", "elephant", "frog", "giraffe", "monkey", "owl", "panda", "parrot", "penguin", "pig", "rabbit", "zebra"];
  var POLICE_T = '"Bagel Fat One", "Arial Black", sans-serif', POLICE = '"Andika", Verdana, sans-serif';

  /* ---------- État ---------- */
  var CLE = "pico-jeu-phaser-v1";
  function charger() { try { return JSON.parse(localStorage.getItem(CLE)); } catch (e) { return null; } }
  var S = PICO.S = charger() || {};
  if (!S.joueurs) S.joueurs = [{ nom: "Joueur 1", av: "panda", etoiles: {}, manches: 0 }, { nom: "Joueur 2", av: "frog", etoiles: {}, manches: 0 }];
  S.nb = S.nb === 2 ? 2 : 1; S.actif = S.actif === 1 ? 1 : 0; S.diff = DIFF[S.diff] ? S.diff : "normal"; S.record = S.record || {};
  S.temps = [30, 45, 60, 90].indexOf(S.temps) >= 0 ? S.temps : 45;
  if (S.son === undefined) S.son = true;
  PICO.sauver = function () { try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (e) {} };
  PICO.nom = function (j) { return (j.nom || "").trim() || "Joueur"; };

  /* ---------- Chargement des dessins SVG en images ---------- */
  function chargerSvg(cle, src) {
    return new Promise(function (ok) {
      var img = new Image();
      img.onload = function () { ok({ cle: cle, img: img }); };
      img.onerror = function () { ok(null); };
      img.src = URL.createObjectURL(new Blob([src], { type: "image/svg+xml" }));
    });
  }
  var pretDessins = null;
  function chargerPng(cle, url) {
    return new Promise(function (ok) { var img = new Image(); img.onload = function () { ok({ cle: cle, img: img }); }; img.onerror = function () { ok(null); }; img.src = url; });
  }
  function dessinsPrets() {
    if (!pretDessins) {
      var R = window.RESSOURCES || { img: {} };
      pretDessins = Promise.all([
        Promise.all(Object.keys(window.DESSINS).map(function (k) { return chargerSvg(k, window.DESSINS[k]); })),
        Promise.all(Object.keys(R.img).map(function (k) { return chargerPng(k, R.img[k]); }))
      ]).then(function (r) { PICO.pngs = r[1]; return r[0]; });
    }
    return pretDessins;
  }

  var IMAGES = ["fish_blue", "fish_brown", "fish_green", "fish_orange", "fish_pink", "fish_red", "fish_grey_long_a",
    "seaweed_green_a", "seaweed_green_b", "seaweed_green_c", "seaweed_green_d", "seaweed_grass_a", "seaweed_grass_b", "seaweed_orange_a", "seaweed_orange_b", "seaweed_pink_a", "seaweed_pink_b", "seaweed_pink_c", "rock_a", "rock_b",
    "terrain_sand_top_a", "terrain_sand_top_b", "terrain_sand_top_c", "terrain_sand_top_d", "terrain_sand_top_e", "terrain_sand_top_f",
    "background_seaweed_a", "background_seaweed_b", "background_seaweed_c", "background_seaweed_d", "background_seaweed_e", "background_rock_a", "background_rock_b",
    "bubble_a", "bubble_b", "bubble_c", "p_star_04", "p_star_06", "p_circle_05", "p_light_03", "p_spark_05", "p_magic_05", "p_twirl_02"];
  var SONS = ["attrape", "plop", "erreur", "tic", "go", "clic", "splash", "choc", "etoile", "combo", "fin", "fin_bof", "interrupteur", "couvercle", "tombe", "feuille", "carte", "bon", "faux", "saut", "ding", "bois"];

  var Boot = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () { Phaser.Scene.call(this, { key: "boot" }); },
    preload: function () {
      var self = this;
      var barre = this.add.graphics();
      this.add.text(W / 2, H / 2 - 50, "Chargement…", { fontFamily: POLICE_T, fontSize: "40px", color: "#fffdf6" }).setOrigin(.5);
      this.load.on("progress", function (v) { barre.clear().fillStyle(0xfffdf6, .25).fillRoundedRect(W / 2 - 200, H / 2, 400, 24, 12).fillStyle(0xffc531).fillRoundedRect(W / 2 - 200, H / 2, Math.max(24, 400 * v), 24, 12); });
      this.load.on("complete", function () {});
    },
    create: function () {
      var self = this;
      (PICO.svgs || []).forEach(function (s) { if (s && !self.textures.exists(s.cle)) self.textures.addImage(s.cle, s.img); });
      (PICO.pngs || []).forEach(function (s) { if (s && !self.textures.exists(s.cle)) self.textures.addImage(s.cle, s.img); });
      var R = window.RESSOURCES || { son: {} }, sons = Object.keys(R.son).map(function (k) { return { key: k, data: R.son[k] }; });
      var lancer = function () {
        PICO.bootFini = true;
        if (PICO.enAttente) { var d = PICO.enAttente; PICO.enAttente = null; self.scene.start("defi", d); }
      };
      if (sons.length && this.sound.decodeAudio) {
        var fait = false, fin = function () { if (!fait) { fait = true; lancer(); } };
        this.sound.once("decodedall", fin);
        this.time.delayedCall(4000, fin);
        this.sound.decodeAudio(sons);
      } else lancer();
    }
  });

  /* ---------- Scène de défi générique ---------- */
  var Defi = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () { Phaser.Scene.call(this, { key: "defi" }); },

    init: function (data) {
      this.id = data.id; this.def = PICO.DEFIS[data.id]; this.tour = data.tour || 0;
      this.idx = S.nb === 2 ? S.actif : 0; this.J = S.joueurs[this.idx];
    },

    create: function () {
      var self = this, d = this.def;
      this.W = W; this.H = H;
      this.mode = "intro"; this.score = 0; this.g = {}; this.ecoule = 0;
      this.duree = d.chrono ? S.temps : 0; this.reste = this.duree; this.v = DIFF[S.diff];
      this.sound.mute = !S.son;
      this.cameras.main.fadeIn(300, 15, 59, 69);
      d.decor.call(this, this.g);
      this.creerEffets();
      this.creerHud();
      this.input.keyboard.on("keydown", function (e) {
        if (self.mode === "jeu" && d.touche) d.touche.call(self, e, true, self.g);
        else if ((e.key === "Enter" || e.key === " ") && self.boutonEntree) { e.preventDefault(); self.boutonEntree(); }
      });
      this.input.keyboard.on("keyup", function (e) { if (self.mode === "jeu" && d.touche) d.touche.call(self, e, false, self.g); });
      if (this.input.keyboard.addCapture) this.input.keyboard.addCapture("SPACE,LEFT,RIGHT,UP");
      this.intro();
    },

    /* --- outils --- */
    son: function (k, vol, rate) { if (!S.son) return; try { this.sound.play(k, { volume: vol == null ? .7 : vol, rate: rate || 1 }); } catch (e) {} },
    acc: function () { return Math.min(this.ecoule, 60); },
    img: function (x, y, cle, taille) { var i = this.add.image(x, y, cle); if (taille) i.setScale(taille / Math.max(i.width, i.height)); return i; },
    taille: function (o, t) { o.setScale(t / Math.max(o.width, o.height)); return o; },
    repeter: function (fn, delai) {
      var self = this;
      (function boucle() { if (self.mode !== "jeu") return; fn(); self.time.delayedCall(typeof delai === "function" ? delai() : delai, boucle); })();
    },
    texte: function (x, y, s, taille, couleur, extra) {
      var st = Object.assign({ fontFamily: POLICE_T, fontSize: taille + "px", color: couleur || "#fffdf6", align: "center", stroke: ENCRE, strokeThickness: Math.max(4, Math.round(taille / 7)) }, extra || {});
      return this.add.text(x, y, s, st).setOrigin(.5);
    },
    ecrit: function (x, y, s, taille, couleur, largeur) {
      return this.add.text(x, y, s, { fontFamily: POLICE, fontStyle: "bold", fontSize: taille + "px", color: couleur || ENCRE, align: "center", wordWrap: largeur ? { width: largeur, useAdvancedWrap: true } : undefined, lineSpacing: 4 }).setOrigin(.5);
    },
    panneau: function (x, y, w, h, couleur, rayon) {
      var g = this.add.graphics(); rayon = rayon || 24;
      g.fillStyle(0x0b2a24, .35).fillRoundedRect(x + 4, y + 9, w, h, rayon);
      g.fillStyle(couleur == null ? 0xfffdf6 : couleur, 1).fillRoundedRect(x, y, w, h, rayon);
      g.lineStyle(5, ENCRE_N, 1).strokeRoundedRect(x, y, w, h, rayon);
      return g;
    },
    bouton: function (x, y, w, h, label, couleur, action) {
      var self = this, c = this.add.container(x, y), g = this.add.graphics();
      function dessiner(bas) {
        g.clear();
        g.fillStyle(ENCRE_N, 1).fillRoundedRect(-w / 2, -h / 2 + (bas ? 2 : 8), w, h, 18);
        g.fillStyle(couleur, 1).fillRoundedRect(-w / 2, -h / 2 + (bas ? 5 : 0), w, h, 18);
        g.lineStyle(5, ENCRE_N).strokeRoundedRect(-w / 2, -h / 2 + (bas ? 5 : 0), w, h, 18);
        g.fillStyle(0xffffff, .28).fillRoundedRect(-w / 2 + 10, -h / 2 + 6 + (bas ? 5 : 0), w - 20, h / 3, 10);
      }
      dessiner(false);
      var t = this.texte(0, 0, label, Math.round(Math.min(h * .44, 34)));
      c.add([g, t]); c.label = t;
      c.setSize(w, h + 8).setInteractive({ useHandCursor: true });
      c.on("pointerover", function () { self.tweens.add({ targets: c, scale: 1.06, duration: 120, ease: "Back.easeOut" }); });
      c.on("pointerout", function () { self.tweens.add({ targets: c, scale: 1, duration: 120 }); dessiner(false); t.y = 0; });
      c.on("pointerdown", function () { dessiner(true); t.y = 5; self.son("clic", .6); });
      c.on("pointerup", function () { dessiner(false); t.y = 0; action(); });
      return c;
    },
    flotter: function (x, y, s, couleur, taille) {
      var t = this.texte(x, y, s, taille || 50, couleur).setDepth(95).setScale(.3);
      this.tweens.add({ targets: t, scale: 1, duration: 240, ease: "Back.easeOut" });
      this.tweens.add({ targets: t, y: y - 80, alpha: 0, duration: 700, delay: 260, ease: "Cubic.easeIn", onComplete: function () { t.destroy(); } });
    },
    points: function (n, x, y, sansSon) {
      this.score = Math.max(0, this.score + n);
      this.majScore();
      this.flotter(x, y, n > 0 ? "+" + n : "−" + Math.abs(n), n > 0 ? "#ffc531" : "#ff6142");
      if (n > 0) { this.fxEtoiles.explode(12, x, y); this.fxAnneau.explode(1, x, y); if (!sansSon) this.son("bon", .55, Phaser.Math.FloatBetween(.95, 1.12)); }
      else { this.cameras.main.shake(170, .006); if (!sansSon) this.son("faux", .6); }
    },
    toast: function (msg, couleur) {
      var t = this.toastTxt; t.setText(msg);
      var w = t.width + 44, h = t.height + 22, g = this.toastFond; g.clear();
      g.fillStyle(ENCRE_N, 1).fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 16);
      g.fillStyle(couleur || 0xffd9cf, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 16);
      g.lineStyle(4, ENCRE_N).strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
      this.tweens.killTweensOf(this.toastBox);
      this.toastBox.setAlpha(1).setScale(.6);
      this.tweens.add({ targets: this.toastBox, scale: 1, duration: 260, ease: "Back.easeOut" });
      this.tweens.add({ targets: this.toastBox, alpha: 0, duration: 300, delay: 1700 });
    },

    /* --- effets partagés --- */
    creerEffets: function () {
      this.fxEtoiles = this.add.particles(0, 0, "p_star_06", { speed: { min: 140, max: 320 }, angle: { min: 0, max: 360 }, scale: { start: .5, end: 0 }, lifespan: 650, tint: [0xffe27a, 0xffc531, 0xffffff, 0x9cf0ff], blendMode: "ADD", emitting: false, rotate: { min: 0, max: 360 } }).setDepth(90);
      this.fxAnneau = this.add.particles(0, 0, "p_circle_05", { scale: { start: .2, end: 1.2 }, alpha: { start: .9, end: 0 }, lifespan: 480, emitting: false, blendMode: "ADD" }).setDepth(89);
      this.fxPoussiere = this.add.particles(0, 0, "p_circle_05", { speed: { min: 30, max: 110 }, angle: { min: 180, max: 360 }, scale: { start: .12, end: .02 }, alpha: { start: .8, end: 0 }, lifespan: 500, tint: 0xe8d8b0, emitting: false }).setDepth(30);
      if (!this.textures.exists("confetti")) {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff).fillRect(0, 0, 14, 20); g.generateTexture("confetti", 14, 20); g.destroy();
      }
    },
    confettis: function () {
      var e = this.add.particles(0, 0, "confetti", {
        x: { min: 0, max: W }, y: -20, speedY: { min: 180, max: 340 }, speedX: { min: -80, max: 80 },
        rotate: { start: 0, end: 720 }, scaleX: { start: 1, end: .2 }, lifespan: 3200, quantity: 4, frequency: 40,
        tint: [0xffc531, 0x36a35a, 0xff6142, 0x3fb0dc, 0x7d4fc4, 0xff8a1f]
      }).setDepth(200);
      this.time.delayedCall(1500, function () { e.stop(); });
      this.time.delayedCall(5000, function () { e.destroy(); });
    },

    /* --- HUD --- */
    creerHud: function () {
      var d = this.def;
      this.hud = this.add.container(0, 0).setDepth(100).setAlpha(0);
      var p = this.panneau(20, 16, 236, 80);
      var couleurJ = this.idx === 0 ? 0x7d4fc4 : 0xff8a1f;
      var rond = this.add.graphics().fillStyle(couleurJ).fillCircle(62, 56, 30).lineStyle(4, ENCRE_N).strokeCircle(62, 56, 30);
      var av = this.img(62, 56, "av_" + this.J.av, 54);
      this.txtScore = this.texte(170, 56, "0", 44, "#ffc531");
      this.hud.add([p, rond, av, this.txtScore]);
      if (this.duree) {
        var cg = this.img(W - 74, 58, "chrono", 92);
        this.arc = this.add.graphics();
        this.txtTemps = this.texte(W - 74, 64, String(this.duree), 30, ENCRE, { stroke: "#fffdf6", strokeThickness: 2 });
        this.hud.add([cg, this.arc, this.txtTemps]);
      } else {
        var ps = this.panneau(W - 300, 16, 280, 70);
        this.txtStatut = this.ecrit(W - 160, 51, "", 24);
        this.hud.add([ps, this.txtStatut]);
      }
      this.toastBox = this.add.container(W / 2, 140).setDepth(110).setAlpha(0);
      this.toastFond = this.add.graphics();
      this.toastTxt = this.ecrit(0, 0, "", 26, ENCRE, 900);
      this.toastBox.add([this.toastFond, this.toastTxt]);
      if (d.hudY) this.toastBox.y = d.hudY;
    },
    majScore: function () {
      var d = this.def;
      this.txtScore.setText(d.hud ? d.hud.call(this, this.g) : String(this.score));
      this.tweens.killTweensOf(this.txtScore); this.txtScore.setScale(1);
      this.tweens.add({ targets: this.txtScore, scale: 1.45, duration: 110, yoyo: true, ease: "Quad.easeOut" });
    },
    majChrono: function () {
      if (this.duree) {
        var r = Math.max(0, this.reste / this.duree), g = this.arc; g.clear();
        g.fillStyle(this.reste <= 10 ? 0xff6142 : 0x36a35a, 1);
        g.slice(W - 74, 62, 33, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * r), false).fillPath();
        g.fillStyle(0xfffdf6, 1).fillCircle(W - 74, 62, 22);
        this.txtTemps.setText(String(Math.ceil(this.reste)));
      } else if (this.def.statut) this.txtStatut.setText(this.def.statut.call(this, this.g));
    },

    /* Quand une fenêtre est ouverte, rien en dessous ne doit capter les clics. */
    bloquer: function () {
      var gel = [];
      this.children.list.forEach(function (o) { if (o.input && o.input.enabled) { o.input.enabled = false; gel.push(o); } });
      return function () { gel.forEach(function (o) { if (o.input) o.input.enabled = true; }); };
    },

    /* --- intro, compte à rebours --- */
    intro: function () {
      var self = this, d = this.def, rendre = this.bloquer();
      var m = this.add.container(0, 0).setDepth(150);
      var voile = this.add.rectangle(0, 0, W, H, 0x0b2a24, .5).setOrigin(0);
      var p = this.panneau(230, 120, 820, 500);
      var titre = this.texte(W / 2, 178, d.nom, 64, "#ffc531", { strokeThickness: 11 });
      titre.setShadow(0, 7, ENCRE, 0, true, true);
      var regle = this.ecrit(W / 2, 252, d.regle, 24, ENCRE, 720);
      m.add([voile, p, titre, regle]);
      var ex = d.exemples || [], n = ex.length;
      ex.forEach(function (e, i) {
        var x = W / 2 + (i - (n - 1) / 2) * Math.min(220, 680 / Math.max(1, n - 1 || 1));
        if (n === 1) x = W / 2;
        var im = self.img(x, 352, e[0], e[3] || 96);
        var lb = self.texte(x, 418, e[1], 32, e[2] || "#36a35a");
        var lb2 = e[4] ? self.ecrit(x, 450, e[4], 17, "#4a6a60", 200) : null;
        self.tweens.add({ targets: im, y: 344, angle: { from: -6, to: 6 }, duration: 900 + i * 120, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        m.add([im, lb]); if (lb2) m.add(lb2);
      });
      var qui;
      if (S.nb === 2) {
        qui = [this.ecrit(W / 2 - 250, 506, "Qui joue ?", 22, "#4a6a60")];
        S.joueurs.forEach(function (J, k) {
          var actif = k === self.idx, x = W / 2 - 60 + k * 250;
          var c = self.add.container(x, 506), g = self.add.graphics();
          g.fillStyle(actif ? (k === 0 ? 0x7d4fc4 : 0xff8a1f) : 0xe4f0ea).fillRoundedRect(-115, -27, 230, 54, 27).lineStyle(4, ENCRE_N).strokeRoundedRect(-115, -27, 230, 54, 27);
          var nom = PICO.nom(J); if (nom.length > 11) nom = nom.slice(0, 10) + "…";
          c.add([g, self.img(-82, 0, "av_" + J.av, 42), actif ? self.texte(20, 0, nom, 24) : self.ecrit(20, 0, nom, 22, "#4a6a60")]);
          c.setSize(230, 54);
          if (!actif) {
            c.setInteractive({ useHandCursor: true });
            c.on("pointerover", function () { self.tweens.add({ targets: c, scale: 1.06, duration: 100 }); });
            c.on("pointerout", function () { self.tweens.add({ targets: c, scale: 1, duration: 100 }); });
            c.on("pointerup", function () { S.actif = k; PICO.sauver(); self.son("clic", .6); if (PICO.majAccueil) PICO.majAccueil(); self.scene.restart({ id: self.id }); });
          }
          qui.push(c);
        });
      } else {
        var t2 = this.ecrit(W / 2, 506, d.chrono ? "Durée : " + (S.temps < 60 ? S.temps + " secondes" : S.temps === 60 ? "1 minute" : "1 minute 30") : "", 20, "#4a6a60");
        qui = [t2];
      }
      m.add(qui);
      var go = this.bouton(W / 2, 584, 280, 74, "Jouer !", 0xff8a1f, function () { self.boutonEntree = null; m.destroy(); rendre(); self.compteARebours(); });
      this.tweens.add({ targets: go, scale: 1.05, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      m.add(go);
      this.boutonEntree = function () { self.boutonEntree = null; m.destroy(); rendre(); self.compteARebours(); };
      m.setAlpha(0); this.tweens.add({ targets: m, alpha: 1, duration: 250 });
      p.y = 30; this.tweens.add({ targets: p, y: 0, duration: 450, ease: "Back.easeOut" });
    },
    scoreABattre: function () {
      var r = PICO.duel && PICO.duel.res[0];
      return r ? r.aff : "?";
    },
    compteARebours: function () {
      var self = this; this.mode = "compte";
      this.tweens.add({ targets: this.hud, alpha: 1, duration: 300 });
      this.majScore(); this.majChrono();
      ["3", "2", "1", "C'est parti !"].forEach(function (s, i) {
        self.time.delayedCall(i * 700, function () {
          var t = self.texte(W / 2, H / 2, s, i === 3 ? 100 : 170, i === 3 ? "#ffc531" : "#fffdf6", { strokeThickness: 16 }).setDepth(160).setScale(2.4).setAlpha(0);
          t.setShadow(0, 10, ENCRE, 0, true, true);
          self.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 320, ease: "Back.easeOut" });
          self.tweens.add({ targets: t, scale: .6, alpha: 0, duration: 260, delay: 420, onComplete: function () { t.destroy(); } });
          self.son(i === 3 ? "go" : "tic", .8);
          if (i === 3) self.time.delayedCall(250, function () { self.mode = "jeu"; self.dernierTic = 99; if (self.def.start) self.def.start.call(self, self.g); });
        });
      });
    },

    update: function (temps, delta) {
      var dt = Math.min(delta, 50) / 1000, t = temps / 1000, d = this.def;
      if (d.anim) d.anim.call(this, dt, t, this.g);
      if (this.mode !== "jeu") return;
      this.ecoule += dt;
      if (d.update) d.update.call(this, dt, t, this.g);
      if (this.mode !== "jeu") return;
      if (this.duree) {
        this.reste -= dt;
        if (this.reste <= 10 && this.reste > 0 && Math.ceil(this.reste) !== this.dernierTic) {
          this.dernierTic = Math.ceil(this.reste); this.son("tic", .45, 1.2);
          this.tweens.add({ targets: this.txtTemps, scale: 1.4, duration: 100, yoyo: true });
        }
        if (this.reste <= 0) { this.reste = 0; this.majChrono(); this.finir(); return; }
      }
      this.majChrono();
    },

    /* --- fin --- */
    finir: function () {
      if (this.mode === "fin") return;
      var self = this, d = this.def, g = this.g;
      this.mode = "fin";
      if (d.fin) d.fin.call(this, g);
      this.tweens.add({ targets: this.hud, alpha: 0, duration: 300 });
      var et, seuils = null;
      if (d.etoiles) et = d.etoiles.call(this, this.score, g);
      else {
        var f = d.adapte === false ? 1 : this.v * (S.temps / d.bd);
        seuils = d.seuils.map(function (x) { return Math.max(1, Math.round(x * f)); });
        et = this.score >= seuils[2] ? 3 : this.score >= seuils[1] ? 2 : this.score >= seuils[0] ? 1 : 0;
      }
      var val = d.valeurRecord ? d.valeurRecord.call(this, this.score, g) : this.score;
      var res = { aff: d.unite ? d.unite.call(this, this.score, g) : this.score + (this.score > 1 ? " points" : " point"), et: et, val: val, seuils: seuils };
      this.J.etoiles[this.id] = Math.max(this.J.etoiles[this.id] || 0, et);
      var rec = S.record[this.id];
      var eligible = !(d.plusPetitMieux && val >= 90);
      var record = eligible && (!rec || (d.plusPetitMieux ? val < rec.v : val > rec.v));
      if (record) S.record[this.id] = { v: val, nom: PICO.nom(this.J) };
      PICO.sauver();
      this.time.delayedCall(600, function () {
        self.ecranSolo(res, record && !!rec);
      });
    },
    etoilesFin: function (m, et, y, seuils, unite) {
      var self = this;
      for (var i = 0; i < 3; i++) (function (i) {
        var x = W / 2 + (i - 1) * 120, yy = i === 1 ? y : y + 12;
        m.add(self.img(x, yy, "etoile_vide", i === 1 ? 104 : 88));
        if (seuils) m.add(self.ecrit(x, yy + 60, seuils[i] + " " + unite, 16, "#4a6a60"));
        if (i < et) {
          var s = self.img(x, yy, "etoile", i === 1 ? 104 : 88), sc = s.scale; s.setScale(0).setAngle(-120); m.add(s);
          self.time.delayedCall(700 + i * 380, function () {
            self.tweens.add({ targets: s, scale: sc, angle: 0, duration: 420, ease: "Back.easeOut" });
            self.fxEtoiles.explode(16, x, yy); self.son("etoile", .6, 1 + i * .12);
          });
        }
      })(i);
    },
    fondFin: function (h) {
      this.bloquer();
      var m = this.add.container(0, 0).setDepth(150);
      m.add(this.add.rectangle(0, 0, W, H, 0x0b2a24, .55).setOrigin(0));
      var y0 = (H - h) / 2, p = this.panneau(290, y0, 700, h);
      m.add(p); m.setAlpha(0); this.tweens.add({ targets: m, alpha: 1, duration: 250 });
      p.y = 40; this.tweens.add({ targets: p, y: 0, duration: 500, ease: "Back.easeOut" });
      return { m: m, y0: y0 };
    },
    savais: function (m, y) {
      var t = this.add.text(W / 2, y, "Le savais-tu ? " + Phaser.Utils.Array.GetRandom(this.def.savais), { fontFamily: POLICE, fontStyle: "bold", fontSize: "18px", color: "#7a4f00", backgroundColor: "#fff4c7", padding: { x: 16, y: 10 }, wordWrap: { width: 600, useAdvancedWrap: true }, align: "center" }).setOrigin(.5);
      m.add(t);
    },
    ecranSolo: function (res, nouveau) {
      var self = this, f = this.fondFin(560), m = f.m, y0 = f.y0;
      var t = this.texte(W / 2, y0 + 56, res.et === 3 ? "Champion !" : res.et >= 1 ? "Bravo, " + PICO.nom(this.J) + " !" : "Presque !", 58, "#ffc531", { strokeThickness: 10 });
      t.setShadow(0, 6, ENCRE, 0, true, true);
      m.add(t);
      m.add(this.img(968, y0 + 6, res.et >= 1 ? "pico_joie" : "pico_oups", 150).setAngle(8));
      var sc = this.texte(W / 2, y0 + 136, "0", 64, ENCRE, { stroke: "#ffc531", strokeThickness: 8 }); m.add(sc);
      this.compter(sc, res);
      this.etoilesFin(m, res.et, y0 + 230, res.seuils, this.def.uniteSeuil || "points");
      var rec = S.record[this.id];
      var rt = this.texte(W / 2, y0 + 336, nouveau ? "Nouveau record !" : rec ? "Record : " + (this.def.recTxt ? this.def.recTxt(rec.v) : rec.v) + " (" + rec.nom + ")" : "", 26, nouveau ? "#ff6142" : "#fffdf6");
      if (nouveau) this.tweens.add({ targets: rt, scale: 1.12, duration: 400, yoyo: true, repeat: -1 });
      m.add(rt);
      this.savais(m, y0 + 400);
      m.add(this.bouton(W / 2 - 130, y0 + 498, 220, 62, "Rejouer", 0xff8a1f, function () { self.scene.restart({ id: self.id, tour: 0 }); }));
      m.add(this.bouton(W / 2 + 130, y0 + 498, 220, 62, "Les défis", 0x9fb8ad, function () { PICO.retourAccueil(); }));
      this.boutonEntree = function () { self.scene.restart({ id: self.id, tour: 0 }); };
      this.son(res.et >= 2 ? "fin" : "fin_bof", .7);
      if (res.et >= 2 || nouveau) this.confettis();
    },
    compter: function (txt, res) {
      var num = parseInt(res.aff, 10);
      if (isNaN(num)) { txt.setText(res.aff); return; }
      var suffixe = res.aff.slice(String(num).length), c = { v: 0 };
      this.tweens.add({ targets: c, v: num, duration: Math.min(1300, 70 * num + 200), ease: "Cubic.easeOut", onUpdate: function () { txt.setText(Math.round(c.v) + suffixe); } });
    },
    carteJoueur: function (m, x, y, i, r, gagnant) {
      var J = S.joueurs[i], c = this.add.container(x, y);
      var g = this.add.graphics();
      g.fillStyle(ENCRE_N).fillRoundedRect(-150, -98, 300, 204, 22);
      g.fillStyle(i === 0 ? 0x7d4fc4 : 0xff8a1f).fillRoundedRect(-150, -104, 300, 204, 22).lineStyle(5, ENCRE_N).strokeRoundedRect(-150, -104, 300, 204, 22);
      c.add(g);
      c.add(this.img(0, -60, "av_" + J.av, 70));
      c.add(this.texte(0, -4, PICO.nom(J), 28));
      c.add(this.texte(0, 38, r.aff, 30, "#ffc531"));
      for (var k = 0; k < 3; k++) c.add(this.img((k - 1) * 40, 76, k < r.et ? "etoile" : "etoile_vide", 34));
      if (gagnant) {
        var cr = this.texte(0, -120, "♛", 70, "#ffc531"); c.add(cr);
        this.tweens.add({ targets: cr, y: -130, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.tweens.add({ targets: c, angle: -2, scale: 1.05, duration: 400, ease: "Back.easeOut" });
      }
      m.add(c);
      return c;
    },
    ecranEntreDeux: function (res) {
      var self = this, f = this.fondFin(520), m = f.m, y0 = f.y0, J2 = S.joueurs[1];
      var t = this.texte(W / 2, y0 + 56, "Bien joué !", 58, "#ffc531", { strokeThickness: 10 }); t.setShadow(0, 6, ENCRE, 0, true, true); m.add(t);
      this.carteJoueur(m, W / 2, y0 + 220, 0, res, false);
      m.add(this.ecrit(W / 2, y0 + 360, "Maintenant, c'est au tour de " + PICO.nom(J2) + ". Qui fera le meilleur score ?", 24, ENCRE, 600));
      var go = function () { self.scene.restart({ id: self.id, tour: 1 }); };
      m.add(this.bouton(W / 2 - 130, y0 + 450, 240, 62, "À toi, " + PICO.nom(J2).slice(0, 10) + " !", 0xff8a1f, go));
      m.add(this.bouton(W / 2 + 140, y0 + 450, 200, 62, "Arrêter", 0x9fb8ad, function () { PICO.retourAccueil(); }));
      this.boutonEntree = go;
      this.son("fin", .5);
    },
    ecranDuel: function () {
      var self = this, d = this.def, a = PICO.duel.res[0], b = PICO.duel.res[1];
      var cmp = d.plusPetitMieux ? (a.val < b.val ? -1 : a.val > b.val ? 1 : 0) : (a.val > b.val ? -1 : a.val < b.val ? 1 : 0);
      if (cmp === 0) cmp = a.et > b.et ? -1 : a.et < b.et ? 1 : 0;
      var gagnant = cmp === -1 ? 0 : cmp === 1 ? 1 : -1;
      if (gagnant >= 0) { S.joueurs[gagnant].manches = (S.joueurs[gagnant].manches || 0) + 1; PICO.sauver(); }
      var f = this.fondFin(580), m = f.m, y0 = f.y0;
      var t = this.texte(W / 2, y0 + 56, gagnant < 0 ? "Égalité parfaite !" : PICO.nom(S.joueurs[gagnant]) + " gagne !", 54, "#ffc531", { strokeThickness: 10 });
      t.setShadow(0, 6, ENCRE, 0, true, true); m.add(t);
      this.carteJoueur(m, W / 2 - 165, y0 + 240, 0, a, gagnant === 0);
      this.carteJoueur(m, W / 2 + 165, y0 + 240, 1, b, gagnant === 1);
      m.add(this.ecrit(W / 2, y0 + 378, "Manches gagnées : " + PICO.nom(S.joueurs[0]) + " " + (S.joueurs[0].manches || 0) + " · " + PICO.nom(S.joueurs[1]) + " " + (S.joueurs[1].manches || 0), 20, "#4a6a60"));
      this.savais(m, y0 + 432);
      m.add(this.bouton(W / 2 - 130, y0 + 520, 220, 62, "Revanche !", 0xff8a1f, function () { self.scene.restart({ id: self.id, tour: 0 }); }));
      m.add(this.bouton(W / 2 + 130, y0 + 520, 220, 62, "Les défis", 0x9fb8ad, function () { PICO.retourAccueil(); }));
      this.boutonEntree = function () { self.scene.restart({ id: self.id, tour: 0 }); };
      this.son("combo", .7); this.time.delayedCall(500, function () { self.son("fin", .6); });
      this.confettis();
    }
  });

  /* ---------- Lancement / retour ---------- */
  var jeu = null;
  PICO.lancer = function (id) {
    document.getElementById("ecran-hub").hidden = true;
    document.getElementById("ecran-jeu").hidden = false;
    window.scrollTo(0, 0);
    var data = { id: id, tour: 0 };
    PICO.duel = null;
    if (!jeu) {
      dessinsPrets().then(function (svgs) {
        PICO.svgs = svgs; PICO.enAttente = data;
        jeu = PICO.jeu = new Phaser.Game({
          type: Phaser.AUTO, parent: "jeu", width: W, height: H, backgroundColor: "#0f3b45",
          scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
          render: { antialias: true }, scene: [Boot, Defi]
        });
      });
    } else {
      jeu.loop.wake();
      jeu.scene.stop("defi");
      requestAnimationFrame(function () { jeu.scale.refresh(); jeu.scene.start("defi", data); });
    }
  };
  /* La zone de jeu fixe sa taille ; le canevas suit, sans rétroaction. */
  if (window.ResizeObserver) new ResizeObserver(function () { if (jeu) jeu.scale.refresh(); }).observe(document.getElementById("jeu"));
  PICO.retourAccueil = function () {
    if (jeu) { jeu.scene.stop("defi"); jeu.sound.stopAll(); setTimeout(function () { if (document.getElementById("ecran-jeu").hidden) jeu.loop.sleep(); }, 100); }
    document.getElementById("ecran-jeu").hidden = true;
    document.getElementById("ecran-hub").hidden = false;
    if (PICO.majAccueil) PICO.majAccueil();
  };

  /* polices puis dessins préparés dès l'ouverture */
  var polices = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('40px "Bagel Fat One"'), document.fonts.load('bold 20px "Andika"')]).catch(function () {}) : Promise.resolve();
  Promise.race([polices, new Promise(function (ok) { setTimeout(ok, 2500); })]).then(function () { if (window.DESSINS) dessinsPrets(); });
})();
