$(document).ready(function () {
  window.onscroll = function () {
    scrollFunction();
  };

  $("#to-top").on("click", scrollTop);
});

function scrollFunction() {
  let btnToTop = $("#to-top");
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    btnToTop.css("bottom", "40px");
  } else {
    btnToTop.css("bottom", "-60px");
  }
}

function scrollTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

var postCount = 99;
var action = "inactive";
const defaultThumbnail = "assets/img/background/blog.jpg";

function stripHtml(html) {
  // Create a new div element
  var temporalDivElement = document.createElement("div");
  // Set the HTML content with the providen
  temporalDivElement.innerHTML = html;
  // Retrieve the text property of the element (cross-browser support)
  return temporalDivElement.textContent || temporalDivElement.innerText || "";
}

async function getPosts(limit, start) {
  let url = `https://svbaksosti.herokuapp.com/posts?_limit=${limit}&_start=${start}`;

  if (action == "inactive") {
    action = "active";

    const responseObj = await fetch(url);
    const data = await responseObj.json();

    postCount = data.countTotal;

    let template = data.posts.map((post) => {
      let fullContent;

      var md = window.markdownit();
      fullContent = md.render(post.content);

      let pFirst = stripHtml(fullContent);
      $("#load-data").html('<p class="text-center">Loading...</p>');

      if (post.thumbnail) {
        imgUrl = post.thumbnail.url;
      } else {
        imgUrl = defaultThumbnail;
      }

      return `<div class="lqd-column col-md-4 col-sm-6 post-list">
                  <article class="liquid-lp mb-60">
                     <figure class="liquid-lp-media">
                        <a href="berita.html?s=${post.slug}">
                          <div class="thumbnail center-cropped"
                            style="background-image: url(${imgUrl});"></div>
                        </a>
                     </figure>
                     <header class="liquid-lp-header">
                        <h2 class="liquid-lp-title h4"><a href="berita.html?s=${post.slug}">${
                          post.title
                        }</a></h2>
                        <time class="liquid-lp-date text-uppercase size-sm" datetime="2017-09-25">${formatDate(
                          post.created_at
                        )}</time>
                     </header>
                     <div class="liquid-lp-excerpt" style="max-height: 4em; overflow: hidden;" >
                        <p>${pFirst}</p>
                     </div>
                  </article>
               </div>
                  `;
    });

    $("#list-post").append(template);
    action = "inactive";
    // $("#load-data").html('<p class="text-center">Done</p>');
  } else {
    // $("#load-data").html('<p class="text-center">Done</p>');
  }
}

function getPost(slug) {
  let url = `https://svbaksosti.herokuapp.com/posts/${slug}`;

  fetch(url)
    .then((response) => response.json())
    .then(function (post) {
      if (post.thumbnail) {
        imgUrl = post.thumbnail.formats.small.url;
        imgUrlBig = post.thumbnail.url;
      } else {
        imgUrl = defaultThumbnail;
        imgUrlBig = defaultThumbnail;
      }

      let fullContent = marked(post.content);
      $(".blog-single-content").html(fullContent);
      $("h1.entry-title").text(post.title);
      $("span.author").text(`${post.created_by.firstname} ${post.created_by.lastname}`);
      $("time.published").text(formatDate(post.created_at));
      $("div.thumbnail").css("background-image", `url(${imgUrl})`);
      $("a.thumbnail").attr("href", imgUrlBig);

      //next prev content
      if (post.around.next) {
        $(".nav-next").removeClass("invisible");
        $(".nav-next .nav-title").text(post.around.next.title);
        $("a#next-link").attr("href", `berita.html?s=${post.around.next.slug}`);
      }

      if (post.around.previous) {
        $(".nav-previous").removeClass("invisible");
        $(".nav-previous .nav-title").text(post.around.previous.title);
        $("a#prev-link").attr("href", `berita.html?s=${post.around.previous.slug}`);
      }
    })
    .catch(function (e) {
      console.log(e);
    });
}