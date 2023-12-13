const GEM_APP_ID = "ca.cbc.gem.webos";
const TTV_APP_ID = "tv.tou.ici.webos";

const navArr = [[],[]];
let focusBtn = 'default';

const init = () => {
    const colGem = document.querySelector('#gem');
    const colTTV = document.querySelector('#ttv');

    addCustomMaker(colGem)
    addCustomMaker(colTTV)

    navArr[0].push(...addTestCasesButtons(colGem, testCasesGem))
    navArr[1].push(...addTestCasesButtons(colTTV, testCasesTTV))    

    if (navArr.length > 0) focusBtn = navArr[0][1];
    toggleBtnFocus(focusBtn);

    // add eventListener for keydown
    document.addEventListener('keydown', function(e) {
        switch(e.keyCode){
    	case 37: //LEFT arrow
            focusBtn = changeFocus('left', focusBtn);
        break;
    	case 38: //UP arrow
            focusBtn = changeFocus('up', focusBtn);
        break;
    	case 39: //RIGHT arrow
            focusBtn = changeFocus('right', focusBtn);
        break;
    	case 40: //DOWN arrow
            focusBtn = changeFocus('down', focusBtn);
        break;
    	case 13: //OK button
            if (focusBtn.includes('-maker')) {
                const maker = document.querySelector(`#${focusBtn}`)
                createCustomTestCase(maker);
            } else {
                onSelect(focusBtn);
            }
        break;
        default:
            console.log('Key code : ' + e.keyCode);
        break;
        }
    });
};
// window.onload can work without <body onload="">
window.onload = init;

function onSelect(btnId) {
    const appId = btnId.slice(0,3) === 'ttv'
        ? TTV_APP_ID 
        : GEM_APP_ID
    const testCase = [...testCasesGem, ...testCasesTTV]
        .find(el => el.id === btnId)

    console.log(appId, testCase)
    launchWebosApp(appId, testCase.url);
};

async function onClick(btnId) {
    toggleBtnFocus(focusBtn);
    toggleBtnFocus(btnId);
    await new Promise(r => setTimeout(r, 125));
    onSelect(btnId);
    focusBtn = btnId;
}

function changeFocus(dir, oldFocus) {
    toggleBtnFocus(oldFocus);
    let col = navArr.findIndex(col => col.includes(oldFocus))
    let row = navArr[col].indexOf(oldFocus);
    switch(dir) {
        case 'left':
            col = col > 0 ? col - 1 : 0;
            break;
        case 'right':
            col = (col < navArr.length - 1) ? col + 1 : navArr.length - 1;
            break;
        case 'up':
            row = row > 0 ? row - 1 : 0;
            break;
        case 'down':
            const { length } = navArr[col];
            row = (row < length - 1) ? row + 1 : length - 1;
            break;
    };
    const { length } = navArr[col];
    row = (row > length - 1) ? length - 1 : row;
    toggleBtnFocus(navArr[col][row]);
    const button = document.querySelector(`#${navArr[col][row]}`)
    if (button.id.includes('maker')) {
        button.querySelector('input').focus()
    } else {
        button.focus();
    }
    return navArr[col][row];
}

function toggleBtnFocus(btnId) {
    const btn = document.querySelector(`#${btnId}`);
    if (btn.classList.contains("focused"))
        btn.classList.remove("focused");
    else
        btn.classList.add("focused");
};

const addTestCasesButtons = (parent, testCaseArr) => {
    const navList = [];
    testCaseArr.forEach((testCase, ind) => {
        const testAction = document.createElement('div');
        testAction.setAttribute('class', 'action-btn');
        testAction.setAttribute('id', testCase.id);
        testAction.setAttribute('tabindex', -1);
        testAction.innerHTML = 
            `<span>${ind+1}. ${testCase.label}:</span> 
            ${testCase.url}`
        if (testCase.notExposed) {
            testAction.classList.add('not-exposed');
        } else {
            navList.push(testCase.id);
            testAction.addEventListener('click', () => onClick(testCase.id));
        }
        parent.appendChild(testAction);
    });
    if (testCaseArr.length > 13) {
        const spacerBtm = document.createElement('div')
        spacerBtm.setAttribute('class', 'spacer');
        parent.appendChild(spacerBtm);   
    }
    return navList;
};

function addCustomTestCase(prevElement, url) {
    isGem = prevElement.id.includes('gem')
    const testAction = document.createElement('div');
    const testCase = {
        id: `${isGem ? 'gem' : 'ttv'}-${100 + navArr[isGem ? 0 : 1].length}`,
        label: "Custom",
        url: `${isGem ? 'cbctv://' : 'toutv://'}${url}`
    }
    testCasesGem.push(testCase);
    testAction.setAttribute('class', 'action-btn');
    testAction.setAttribute('id', testCase.id);
    testAction.setAttribute('tabindex', -1);
    testAction.innerHTML = 
        `<span>${testCase.label}:</span> 
        ${testCase.url}`
    testAction.addEventListener('click', () => onClick(testCase.id));
    prevElement.after(testAction);
    navArr[isGem ? 0 : 1].splice(1, 0, testCase.id);
    focusBtn = changeFocus('down', focusBtn);
};

function addCustomMaker(parent) {
    const isGem = parent.id === "gem";
    const maker = document.createElement('div');
    const id = `${parent.id}-maker`;
    maker.setAttribute('class', 'action-btn');
    maker.classList.add('maker');
    maker.setAttribute('id', id);
    maker.setAttribute('tabindex', -1);
    const span = document.createElement('span')
    maker.append(span);
    span.innerText = 'Add Custom';
    maker.append(`:  ${isGem ? 'cbctv://' : 'toutv://'}`);

    const input = document.createElement('input');
    input.setAttribute('class', 'custom-input');
    input.setAttribute('type', 'text');
    input.setAttribute('id', `${parent.id}-input`);
    input.setAttribute('placeholder', `pattern`);
    maker.append(input);

    maker.addEventListener("click", () => selectInput(input, maker));

    navArr[isGem ? 0 : 1].unshift(id);

    parent.append(maker);
}

function createCustomTestCase(maker) {
    const input = maker.querySelector('input')
    addCustomTestCase(maker, input.value)
    input.value = ""
    // maker.removeChild(maker.lastChild)
};

function selectInput(input, maker) {
    toggleBtnFocus(focusBtn);
    toggleBtnFocus(maker.id);
    focusBtn = maker.id;
    input.focus()
};

function launchWebosApp(appId, url = '') {
    console.log('launchWebosApp', appId);
    var endpoint = "luna://com.webos.applicationManager";
    webOS.service.request(endpoint, {
        method: 'launch',
        parameters: { 
            id: appId,
            params: {
                "contentTarget": url,
            },
        },
        onSuccess: function (inResponse) {
            alert(`Launching, ${url}`);
            console.log(`${appId} app launched`);
        },
        onFailure: function (inError) {
            console.log('Failed to launch app', appId);
            console.log('[' + inError.errorCode + ']: ' + inError.errorText);
            return;
        },
    });
};


// "home", "accueil" -> "/home"
// "browse", "parcourir" -> "/browse"
// "catchup", "rattrapage" -> "/rattrapage"
// "kids", "jeunesse" -> "/kids"
// "login", "connexion-utilisateur" -> "/login-url"
// "continue-watching", "mes-visionnements" -> "/user/continue-watching"
// "my-favourites", "my-favorites", "mes-favoris" -> "/user/my-favorites"
// "account", "mon-compte" -> "/user/account"
// "premium", "abonnement" -> "/user/account"
// "live", "en-direct" -> "/live$params$queryString"
// "live-event", "evenement-en-direct" -> "/live?liveEvent=${params.replace("/", "")}"
// "category", "categorie" -> "/category$params"
// "collection" -> "/collection$params"
// // Show Details Page, path = show_name, details ?= s#e#?autoplay=1
// else -> "/details/$path$params$queryString${queryMark}backToHome=true"

const testCasesGem = [
    {
      id: 'gem-01',
      label: "Home",
      url: "cbctv://home"
    },
    {
      id: 'gem-02',
      label: "browse",
      url: "cbctv://browse"
    },
    {
      id: 'gem-03',
      label: "kids",
      url: "cbctv://kids"
    },
    {
      id: 'gem-04',
      label: "login",
      url: "cbctv://login"
    },
    {
      id: 'gem-05',
      label: "Continue Watching",
      url: "cbctv://continue-watching"
    },
    {
      id: 'gem-06',
      label: "favourites",
      url: "cbctv://my-favourites"
    },
    {
      id: 'gem-07',
      label: "My account",
      url: "cbctv://account"
    },
    {
      id: 'gem-08',
      label: "premium",
      url: "cbctv://premium"
    },
    {
      id: 'gem-09',
      label: "Category",
      url: "cbctv://category/documentary"
      // other test cases ???
    },
    {
      id: 'gem-10',
      label: "Collection",
      url: "cbctv://collection/indigenous-stories"
      // other test cases ??? 
    },
    {
        notExposed: true,
        id: 'gem-11',
        label: "Catch up",
        url: "cbctv://catchup"
    },
    {
      id: 'gem-12',
      label: "Live",
      url: "cbctv://live/40"
    },
    {
      id: 'gem-13',
      label: 'Live Event',
      url: 'cbctv://live-event/37707?autoplay=1'
    },
    {
      id: 'gem-14',
      label: "Show",
      url: "cbctv://the-studio-k-show"
    },
    {
      id: 'gem-15',
      label: "Show",
      url: "the-studio-k-show/s03"
    },
    {
      id: 'gem-16',
      label: "Show",
      url: "the-studio-k-show/s03e03"
    },
    {
      id: 'gem-17',
      label: "Show",
      url: "cbctv://the-studio-k-show/s03e01?autoplay=1"
    },
];

const testCasesTTV = [
    {
        id: 'ttv-01',
        label: "Home",
        url: "toutv://accueil"
    },
    {
        id: 'ttv-02',
        label: "Browse",
        url: "toutv://parcourir"
    },
    {
        id: 'ttv-03',
        label: "Kids",
        url: "toutv://jeunesse"
    },
    {
        id: 'ttv-04',
        label: "Login",
        url: "toutv://connexion-utilisateur"
    },
    {
        id: 'ttv-05',
        label: "Continue Watching",
        url: "toutv://mes-visionnements"
      },
      {
        id: 'ttv-06',
        label: "favourites",
        url: "toutv://mes-favoris"
      },
      {
        id: 'ttv-07',
        label: "My account",
        url: "toutv://mon-compte"
      },
      {
        id: 'ttv-08',
        label: "premium",
        url: "toutv://abonnement"
      },
      {
        id: 'ttv-09',
        label: "Category",
        url: "toutv://categorie/documentaire"
        // other test cases ???
      },
      {
        id: 'ttv-10',
        label: "Collection",
        url: "toutv://collection/sous-le-sapin"
        // other test cases ??? 
      },
      {
        id: 'ttv-11',
        label: "Catchup",
        url: "toutv://rattrapage"
      },
      {
        id: 'ttv-12',
        label: "Live",
        url: "toutv://en-direct/9"
      },
      {
        notExposed: true,
        id: 'ttv-13',
        label: "Live Event",
        url: "toutv://evenement-en-direct/37707?autoplay=1"
      },
      {
        id: 'ttv-14',
        label: "Show",
        url: "toutv://l-agent-jean"
      },
      {
        id: 'ttv-15',
        label: "Show",
        url: "toutv://l-agent-jean/s04"
      },
      {
        id: 'ttv-16',
        label: "Show",
        url: "toutv://l-agent-jean/s04e03"
      },
      {
        id: 'ttv-17',
        label: "Show",
        url: "toutv://l-agent-jean/s04e03?autoplay=1"
      },
];