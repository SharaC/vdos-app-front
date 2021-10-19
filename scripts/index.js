const API_KEY = "yujlaY7XJnWMZa6xShdTC1M1IOL3u0uh";
const URL_GIPHY = "https://api.giphy.com";
const URL_VDOS = "http://vdos-app-bootcamp.herokuapp.com";
let modeCurrent = localStorage.getItem('modeCurrent');
let searchDiv = document.getElementById('search');
let iconSearchActive = document.getElementById('iconSearch');
let iconClosedSearch = document.getElementById('closeSearch');
let suggestionDiv = document.getElementById('suggestions');
let suggestionList = document.getElementById('listSuggestions');
let searchInput = document.getElementById('inputSearch');
let textHomeSearch = document.getElementById('headerResultSearch');
let suggestionsText = document.querySelectorAll('#suggestions span');
let resultSearchSection = document.getElementById('resultsSearch');
let resultSearchDiv = document.createElement('div');
resultSearchDiv.setAttribute('id', 'gridResultsSearch');
let trendingGrid = document.getElementById('gridGifs');
let leftButton = document.getElementById('buttonLeft');
let rightButton = document.getElementById('buttonRight');
let modalGif = document.createElement("div");
modalGif.classList.add('modalGif', 'nonvisible');
let modalCreate = document.createElement("div");
modalCreate.classList.add('modalCreate', 'nonvisible');
let spanTextSuggestion;
let resultsListModal = [];
let term;
let totalResultsSearch = 0;
let resultsShown;
let resultsToLoad = 0;
let btnSeeMore;
let infoResultsShown;
let numberResultToShow = 0;
let favoriteGifs;
let offsetSelectorTrending = 0;
let form = document.getElementById('uploadForm')
let btnOpenUploadVideo = document.querySelector('#createGifo').addEventListener('click', uploadVideo);

document.body.classList.add("darkMode");

showTrending();

searchInput.addEventListener('keyup', () => {
    searchTerm = searchInput.value;
    (searchTerm.length > 0) ? prepareSuggestions(searchTerm): clearSearch();
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        term = searchInput.value;
        (term.length > 0) ? showSuggestions(): clearSearch();
    }
});

async function newSuggest(term) {
    let urlBase = `${URL_GIPHY}/v1/tags/related/${term}?api_key=${API_KEY}&limit=4`;
    let response = await fetch(urlBase);
    let suggestions = await response.json();
    return suggestions;
}

async function newSearch(term, offset) {
    let urlBase = `${URL_VDOS}/search/${term}?skip=${offset}&limit=3`;
    let response = await fetch(urlBase);
    let results = await response.json();
    return results;
}

async function trending(limit, offset) {
    let urlBase = `${URL_VDOS}/recent?limit=${limit}&skip=${offset}`;
    let response = await fetch(urlBase);
    let results = await response.json();
    return results;
}

function prepareSuggestions(searchTerm) {
    term = searchInput.value;
    searchDiv.classList.remove('inactive');
    iconSearchActive.classList.remove('nonvisible');
    iconClosedSearch.classList.add('active');
    iconClosedSearch.addEventListener('click', clearSearch);
    newSuggest(searchTerm).then((suggestedListApi) => {
        suggestionList.textContent = "";
        suggestedListApi.data.map(function (suggestedTerm) {
            let li = document.createElement("li");
            spanTextSuggestion = document.createElement("span");
            spanTextSuggestion.innerHTML = suggestedTerm.name;
            suggestionList.appendChild(li).appendChild(spanTextSuggestion);
            li.addEventListener('click', function () {
                term = suggestedTerm.name;
                showSuggestions()
            });
            iconSearchActive.removeEventListener('click', showSuggestions);
            iconSearchActive.addEventListener('click', showSuggestions);
        });
    })
    suggestionDiv.classList.remove('nonvisible');
}


function showSuggestions() {
    clearSearch();
    textHomeSearch.classList.add('nonvisible');
    let searchTitle = document.createElement('h1');
    searchTitle.textContent = term;
    searchInput.value = term;
    resultSearchSection.appendChild(searchTitle);
    searchTitle.insertAdjacentHTML('beforebegin', '<hr>');
    resultSearchSection.appendChild(resultSearchDiv);
    searchTermsuggested(term);
}


function clearSearch() {
    searchDiv.classList.add('inactive');
    iconSearchActive.classList.add('nonvisible');
    iconClosedSearch.classList.remove('active');
    iconClosedSearch.removeEventListener('click', clearSearch);
    suggestionDiv.classList.add('nonvisible');
    resultSearchSection.textContent = "";
    resultSearchDiv.textContent = "";
    textHomeSearch.classList.remove('nonvisible');
    resultsToLoad = 0;
    searchInput.value = "";
}

function searchTermsuggested(termSuggested) {
    newSearch(termSuggested, resultsToLoad).then((resultListApi) => {
        console.log(resultListApi)
        if (resultListApi.result.length === 0 && !document.contains(btnSeeMore)) {
            resultSearchSection.innerHTML =
                `<div id="noResults">
                <img src="../images/icon-busqueda-sin-resultado.svg" alt="">
                <h3 class="textNoResult">Intenta con otra búsqueda.</h3>
            </div>`;
        }
        resultsToLoad += 3;
        if (!document.contains(btnSeeMore) && resultListApi.result.length > 0) {
            btnSeeMore = document.createElement('button');
            btnSeeMore.setAttribute('class', 'btnLarge');
            btnSeeMore.textContent = "VER MÁS";
            btnSeeMore.addEventListener('click', () => {
                searchTermsuggested(termSuggested);
            });
            resultSearchSection.appendChild(btnSeeMore);
        } else if (document.contains(btnSeeMore) && resultListApi.result.length === 0) {
            btnSeeMore.remove();
        }

        resultListApi.result.map(function (resultGif) {
            resultsListModal.push(resultGif);
            let gif = document.createElement('div');
            let id = resultGif.previewId;
            let selectorFavorite = ".iconFavorite[name='" + id + "']";
            let selectorDownload = ".iconDownload[name='" + id + "']";
            let selectorMaximize = ".iconMaximize[name='" + id + "']";
            let imgsrc= `${URL_VDOS}/download/${id}`
            gif.innerHTML = `<img name="${id}" class="gifPreview" src="${imgsrc}">
                            <div id="infoGif${id}" class="gifContent">
                                <div class="icons">
                                    <img name="${id}" class="iconGifs iconFavorite" alt="">
                                    <img name="${id}" class="iconGifs iconDownload" alt="">
                                    <img name="${id}" class="iconGifs iconMaximize" alt="">
                                </div>
                                <div class="info" style="position-: right;position: absolute;bottom: 30px;left: 20px;">
                                    <span id="nameUserGif">${resultGif.author}</span>
                                    <span id="titleGif">${resultGif.title}</span>
                                </div>
                            </div>`;
            resultSearchDiv.appendChild(gif);
            document.querySelector(selectorFavorite).addEventListener('click', addFavoriteGif);
            document.querySelector(selectorDownload).addEventListener('click', downloadGif);
            document.querySelector(selectorMaximize).addEventListener('click', maximizeGif);
        })
    }).catch((err) => {
        console.log(err);
    });
}

function addFavoriteGif(fileId, rankingNumber) {
    console.log(rankingNumber)
    rankingNumber = rankingNumber +1
    fetch(`${URL_VDOS}/resources/${fileId}?ranking=${rankingNumber}`,{
            method:'PATCH',
            headers:{
                "Content-Type":"application/json"
            }
        }).then(response => {
            console.log(response);                     
            if(response.status==200){
                response.json().then((data)=>{
                    console.log(data);
                });        
            }
            else{
                console.log(response.json);
            }
        });
    closeModal()
    window.location.reload(true);

}

function downloadGif(fileId) {
    window.location =`${URL_VDOS}/download/${fileId}`
}

function maximizeGif(event) {
    let idGifToDownload = event.target.name;
    console.log(resultsListModal)
    resultsListModal.map(async function (gif) {
        if (gif.previewId === idGifToDownload) {
            let selectorFavorite = ".iconFavModal[name='" + gif.previewId + "']";
            let selectorDownload = ".iconDownModal[name='" + gif.previewId + "']";
            let imgsrc= `${URL_VDOS}/download/${gif.fileId}`
            modalGif.innerHTML = `
                    <img id="btnClose" src="./images/button-close.svg" onclick="closeModal()" alt="">  
                    <video id="imgGifDesktop" width="600" controls muted="muted" autoplay>
                        <source src="${imgsrc}" type="video/mp4" />
                    </video>
                    <div id="modalGifInfo">
                        <div id="modalText">
                            <span id="infoUsername" class="infoUser">${gif.author}</span>
                            <span id="infoTitle" class="infoTitle">${gif.filename}</span>
                        </div>
                        <h3>${gif.ranking} Likes</h3>
                        <div class="icons">
                            
                            <img name="${gif.previewId}" class="iconGifs iconFavModal iconFavorite" alt="">
                            <img name="${gif.previewId}" class="iconGifs iconDownModal iconDownload" alt="">
                        </div>
                    </div>`;
            modalGif.classList.add("modalGif");
            document.body.appendChild(modalGif);
            document.querySelector(selectorFavorite).addEventListener('click', ()=>{
                addFavoriteGif(gif.fileId, gif.ranking)
            });
            document.querySelector(selectorDownload).addEventListener('click', ()=>{
                downloadGif(gif.fileId)
            });
            modalGif.classList.remove('nonvisible');
        }
    });
}

function closeModal() {
    modalGif.classList.replace('modalGif', 'nonvisible')
}

function closeModalForm() {
    modalCreate.classList.replace('modalGif', 'nonvisible')
}

function redirect(){
    window.location.href="/createGifs.html";
}

function uploadVideo() {
    const URL_UPLOAD = `${URL_VDOS}/resources/upload`
        modalCreate.innerHTML = `
        <img id="btnCloseForm" src="./images/button-close.svg" onclick="closeModalForm()" alt=""><br>
        <div class="containerUpload">
            <form id="uploadForm" action="${URL_UPLOAD}" method="post" 
            enctype="multipart/form-data" redirect="/createGifs.html">
                <div>
                    <label class="labelForm" for="title">Elige un Título para tu video:</label><br>
                    <input type="text" id="title" name="title" class="formUploadInput"><br>
                </div>
                <br>
                <div>
                    <label class="labelForm" for="author">Nombre del autor:</label><br>
                    <input type="text" id="author" name="author" class="formUploadInput">
                </div>
                <br>
                <div>
                    <label class="labelForm"> A continuación adjunta el archivo de tu video</label><br>
                    <input type="file" id="video" name="video"/>
                </div>
                <br>
                <div>
                    <label class="labelForm">Sube una imagen para la miniatura de tu video</label><br>
                    <input type="file" id="preview" name="preview"/>
                </div>
                <div style="text-align: center;">
                    <input id="btnUpload" type="submit" class="btnLarge" value="Subir video!">
                </div>
            </form>
        </div>

        `;
    modalCreate.classList.add("modalGif");
    document.body.appendChild(modalCreate);
    
    modalCreate.classList.remove('nonvisible');
    }

function showTrending() {
    trending(3, offsetSelectorTrending).then((resultListApi) => {
        console.log(resultListApi)
        resultsList = resultListApi.resource;
        resultsList.forEach(video => {
            resultsListModal.push(video);
        })
        trendingGrid.textContent = "";
        resultListApi.resource.map(function (resultGif) {
            let gif = document.createElement('div');
            let id = resultGif.previewId;
            let selectorFavorite = ".iconFavorite[name='" + id + "']";
            let selectorDownload = ".iconDownload[name='" + id + "']";
            let selectorMaximize = ".iconMaximize[name='" + id + "']";
            let imgsrc= `${URL_VDOS}/download/${id}`
            gif.innerHTML =             
            `<img name="${id}" class="gifPreview" src="${imgsrc}" type="video/mp4">
                            <div id="infoGif${id}" class="gifContent">
                                <div class="icons">
                                    <img name="${id}" class="iconGifs iconFavorite" alt="">
                                    <img name="${id}" class="iconGifs iconDownload" alt="">
                                    <img name="${id}" class="iconGifs iconMaximize" alt="">
                                </div>
                                
                            <h3>${resultGif.ranking} Likes</h3>
                            </div>`;
            trendingGrid.appendChild(gif);
            document.querySelector(selectorFavorite).addEventListener('click', ()=>{
                addFavoriteGif(resultGif.fileId, resultGif.ranking)
            });
            document.querySelector(selectorDownload).addEventListener('click', ()=>{
                downloadGif(resultGif.fileId)
            });
            document.querySelector(selectorMaximize).addEventListener('click', maximizeGif);
        });
    });
    if (offsetSelectorTrending === 3) {
        leftButton.classList.add('active');
        leftButton.addEventListener('click', slideToLeft);
    } else if (offsetSelectorTrending === 0) {
        leftButton.removeEventListener('click', slideToLeft);
        leftButton.classList.remove('active');
        rightButton.removeEventListener('click', slideToRight);
        rightButton.addEventListener('click', slideToRight);
    };
}

function slideToLeft() {
    offsetSelectorTrending -= 3;
    showTrending();
}

function slideToRight() {
    offsetSelectorTrending += 3;
    showTrending();
}

function modeToggle() {
    document.body.classList.toggle('darkMode');
    if (modeCurrent === "lightMode") {
        modeCurrent = "darkMode";
        document.getElementById('modeView').textContent = "MODO DIURNO";
    } else {
        modeCurrent = "lightMode";
        document.getElementById('modeView').textContent = "MODO NOCTURNO";
    }
    localStorage.setItem("modeCurrent", modeCurrent);
}


window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted || 
                           ( typeof window.performance != "undefined" && 
                                window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
      // Handle page restore.
      window.location.reload();
    }
  });
