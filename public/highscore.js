const SERVER_ROOT = 'http://localhost:3000';
let highscore = [];

function sendScore(username, score) {
    username = prompt('Wie ist dein Name?', '');
    const SECRET_KEY = 'SUPER_GEHEIMES_PASSWORT';
    const signature = createSignatureClient(username, score, SECRET_KEY);

    fetch(SERVER_ROOT + '/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score, signature })
    }).then(res => res.json())
        .then(data => {
            console.log(data);
            loadHighScore();
            showHighScore();

        });
}

function createSignatureClient(username, score, secret) {
    return CryptoJS.HmacSHA256(username + score, secret).toString();
}

// Load High Score
loadHighScore();
async function loadHighScore() {
    highscore = await fetch(SERVER_ROOT + '/top20').then(res => res.json());
    highscoreTable.innerHTML = '';

    highscore.forEach((hs, i) => {
        highscoreTable.innerHTML +=
            `
        <tr>
            <td>${i + 1}.</td>
            <td id="username${i}"></td>
            <td>${hs.score}</td>
        </tr>
        `;

    document.getElementById('username' + i).innerText = hs.username;
    });
}

function showHighScore() {
    highscoreContainer.style.display = 'flex';
}

function hideHighScore() {
    highscoreContainer.style.display = 'none';
}

document.body.innerHTML += `
    <div class="highscore-container" id="highscoreContainer" style="display: none;" onclick="hideHighScore()">
        <div class="highscore-board" onclick="event.stopPropagation()">
            <h1>HIGHSCORES</h1>

            <table id="highscoreTable">
            </table>
        </div>
    </div>`;

document.head.innerHTML += `<style>
        .highscore-container {
            position: fixed;
            left: 0;
            right: 0;
            z-index: 10;
            top: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.2);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .highscore-board {
            height: 50vh;
            width: 40vw;
            background-color: white;
            box-shadow: 8px 8px 8px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            text-align: center;
            padding: 0px 150px;
            overflow-y: auto;
            padding-bottom: 40px;
        }

        /* slackey-regular - latin */
        @font-face {
            font-display: swap;
            /* Check https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display for other options. */
            font-family: 'Slackey';
            font-style: normal;
            font-weight: 400;
            src: url('./fonts/slackey-v28-latin-regular.woff2') format('woff2');
            /* Chrome 36+, Opera 23+, Firefox 39+, Safari 12+, iOS 10+ */
        }

        h1 {
            font-size: 60px;
            color: #F1DC6E;
        }

        table {
            color: #455E81;
            font-size: 26px;
            width: 100%;
            border-collapse: collapse;
        }


        tr {
            border-bottom: 3px solid #F1DC6E;
            line-height: 80px;
        }

        tr:last-child {
            border: 0;
        }
            
        </style>
`;