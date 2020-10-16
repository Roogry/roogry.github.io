const mappa = new Mappa("Leaflet");

const baseUrl = "https://svbaksosti.herokuapp.com";

const defaultColor = "#007bff";

let canvas;
let width;
let height;

let regionAreas;
let categoryHierarchy;
const showAllCategoryDefault = true;
let categoryToShow = [];
let itemsAll = [];
let itemsToShow = [];

let isLoading = true;

const options = {
  lat: -8.3258226,
  lng: 115.1571415,
  zoom: 13,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
};

function refreshItemsToShow() {
  itemsToShow = [];
  itemsToShow = itemsAll.filter((v, i) => {
    if (
      v.category == null &&
      v.banjar == null &&
      categoryToShow.includes("tanpa-kategori") &&
      categoryToShow.includes("tanpa-banjar")
    ) {
      return true;
    }

    if (
      v.category &&
      v.banjar == null &&
      categoryToShow.includes(v.category.id) &&
      categoryToShow.includes("tanpa-banjar")
    ) {
      return true;
    }

    if (
      v.category == null &&
      v.banjar &&
      categoryToShow.includes("tanpa-kategori") &&
      categoryToShow.includes(v.banjar.id)
    ) {
      return true;
    }

    if (
      v.category &&
      v.banjar &&
      categoryToShow.includes(v.category.id) &&
      categoryToShow.includes(v.banjar.id)
    ) {
      return true;
    }

    return false;
  });

}

function onclickCheckbox(params) {
  const checked = params.target.checked;
  if (checked) {
    // Become checked
    categoryToShow.push(params.target.id);
  } else {
    categoryToShow.splice(categoryToShow.indexOf(params.target.id), 1);
  }

  refreshItemsToShow();
}

function mouseClicked() {
  ellipse(mouseX, mouseY, 300, 300);

  for (let i = 0; i < itemsToShow.length; i++) {
    const it = itemsToShow[i];
    const _d = dist(mouseX, mouseY, it.drawn.x, it.drawn.y);

    if (_d <= it.drawn.hb) {
      console.log(it);
      var modal = document.getElementById("myModal");
      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];

      // When the user clicks on the button, open the modal
      modal.style.display = "block";

      // When the user clicks on <span> (x), close the modal
      span.onclick = function () {
        modal.style.display = "none";
      };

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      };

      const modalDetail = document.getElementById("modal-detail");
      if (it.description && it.description.length > 0) {
        var md = window.markdownit();
        fullContent = md.render(it.description);
        // modalDetail.innerHTML = "";
        modalDetail.innerHTML = fullContent;

        var hrEl = document.createElement("hr");
        modalDetail.prepend(hrEl);
      } else {
        modalDetail.innerHTML = "";
      }

      var titleEl = document.createElement("h3");
      titleEl.innerText = it.nama;

      var kategoriEl = document.createElement("h6");
      if (it.category) {
        kategoriEl.innerHTML = "<span>Kategori:</span> " + it.category.name;
      } else {
        kategoriEl.innerHTML = "<span>Kategori:</span> Tanpa Kategori";
      }

      var banjarEl = document.createElement("h6");
      if (it.banjar) {
        banjarEl.innerHTML = "<span>Banjar:</span> " + it.banjar.name;
      } else {
        banjarEl.innerHTML = "<span>Banjar:</span> Tanpa banjar";
      }

      var latlngEl = document.createElement("h6");
      if (it.lat && it.lng) {
        latlngEl.innerHTML = "<span>Latlng:</span> " + it.lat + ", " + it.lng;
      } else {
        latlngEl.innerHTML = "<span>Latlng:</span> Belum ditambahkan";
      }

      modalDetail.prepend(latlngEl);
      modalDetail.prepend(banjarEl);
      modalDetail.prepend(kategoriEl);
      modalDetail.prepend(titleEl);

      // prevent default
      return true;
    }
  }
}

function appendCheckbox(id, text, level, subs, containerId, color) {
  var _cb = document.createElement("INPUT");
  _cb.setAttribute("type", "checkbox");
  _cb.setAttribute("id", id);
  if (showAllCategoryDefault) _cb.defaultChecked = true;
  _cb.addEventListener("click", onclickCheckbox);

  var _label = document.createElement("label");
  _label.setAttribute("for", id);
  _label.innerText = text;

  var _cont = document.createElement("div");
  _cont.appendChild(_cb);
  _cont.appendChild(_label);
  _cont.classList.add(`level${level}hierarchy`);

  var _colorInd = document.createElement("span");
  _colorInd.classList.add(`colorIndicator`);
  if (color) {
    _colorInd.style["background-color"] = color;
  } else {
    _colorInd.style["background-color"] = defaultColor;
  }
  if (containerId != "banjarHierarchy") {
    _cont.appendChild(_colorInd);
  }

  document.getElementById(containerId).appendChild(_cont);

  if (subs) {
    createCheckboxes(level + 1, subs, "catHierarchy");
  }
}

function createCheckboxes(level, cats, containerId, uncategorized) {
  if (uncategorized && uncategorized.id != null && uncategorized.name != null) {
    appendCheckbox(
      uncategorized.id,
      uncategorized.name,
      level,
      uncategorized.subs,
      containerId
    );

    if (showAllCategoryDefault) categoryToShow.push(uncategorized.id);
  }
  for (const it of cats) {
    let _color;
    if (it.color) _color = it.color;

    appendCheckbox(it.id, it.name, level, it.subs, containerId, _color);
    if (showAllCategoryDefault) categoryToShow.push(it.id);
  }

  refreshItemsToShow();
}

async function preload() {
  document
    .getElementById("hamburgerMenu")
    .addEventListener("click", onHamburgerClicked);

  isLoading = true;
  const getRegions = await fetch(baseUrl + "/sv-regions");
  regionAreas = await getRegions.json();

  const getItems = await fetch(baseUrl + "/sv-items");
  itemsAll = await getItems.json();

  const getBanjars = await fetch(baseUrl + "/sv-banjars");
  banjarAll = await getBanjars.json();
  createCheckboxes(0, banjarAll, "banjarHierarchy", {
    id: "tanpa-banjar",
    name: "Tanpa Banjar",
  });

  const getHierarchy = await fetch(baseUrl + "/sv-categories/hierarchy");
  categoryHierarchy = await getHierarchy.json();
  createCheckboxes(0, categoryHierarchy, "catHierarchy", {
    id: "tanpa-kategori",
    name: "Tanpa Kategori",
  });

  isLoading = false;
  document.getElementById("loadingIndicator").classList.add("hideLoading");
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.position(0, 0);
  canvas.class("p5canvas");

  trainMap = mappa.tileMap(options);
  trainMap.overlay(canvas);
}

function draw() {
  clear();
  fill(0, 125, 255);
  noStroke();

  if (regionAreas && regionAreas.length > 0) drawRegionAreas();
  if (itemsToShow && itemsToShow.length > 0) drawItems();
}

window.onresize = function () {
  var w = window.innerWidth;
  var h = window.innerHeight;
  canvas.size(w, h);
  width = w;
  height = h;
};

function drawItems() {
  for (let i = 0; i < itemsToShow.length; i++) {
    const it = itemsToShow[i];
    const pix = trainMap.latLngToPixel(it.lat, it.lng);
    push();

    if (it.category && it.category.color) {
      fill(it.category.color);
    } else {
      // Default category color
      fill(defaultColor);
    }

    ellipse(pix.x, pix.y, 10, 10);
    it.drawn = {
      x: pix.x,
      y: pix.y,
      hb: 15,
    };
    pop();
  }
}

function drawRegionAreas() {
  push();

  for (const areas of regionAreas) {
    if (areas.hex_color) {
      fill(areas.hex_color);
    } else {
      // Default fill color
      fill(125, 125, 255, 128);
    }

    beginShape();
    for (const it of areas.coordinate_list) {
      const pix = trainMap.latLngToPixel(it[1], it[0]);
      vertex(pix.x, pix.y);
    }
    endShape(p5.CLOSE);
  }

  pop();
}

/* For collapsible tile*/
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "none") {
      content.style.display = "block";
    } else {
      content.style.display = "none";
    }
  });
}