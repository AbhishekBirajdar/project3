// console.log("active_users.js loaded");

// let activeGameId = null; // Track the active game ID
// let isMoveInProgress = false; // Track if the user is entering a move
// let ongoingPolling = false; // Prevent duplicate polling

// setInterval(() => {
//     if (!ongoingPolling) {
//         ongoingPolling = true; 
//         updateActivePlayers();
//         fetchPendingChallenges();
//         checkForOngoingGame();
//         ongoingPolling = false;
//     }
// }, 2000);

// document.addEventListener('DOMContentLoaded', () => {
//     console.log("DOM fully loaded");
//     updateActivePlayers(); 
// });

// // Fetch active users
// function updateActivePlayers() {
//     fetch('/active-users/')
//         .then(response => response.json())
//         .then(data => {
//             const activePlayersList = document.getElementById('active-players');
//             activePlayersList.innerHTML = ''; 

//             if (data.active_users.length > 0) {
//                 data.active_users.forEach(user => {
//                     const listItem = document.createElement('li');
//                     listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
//                     listItem.innerHTML = `
//                         ${user.username}
//                         <button class="btn btn-sm btn-primary" onclick="sendChallenge(${user.id})">Challenge</button>
//                     `;
//                     activePlayersList.appendChild(listItem);
//                 });
//             } else {
//                 activePlayersList.innerHTML = '<li class="list-group-item">No active players available.</li>';
//             }
//         })
//         .catch(error => console.error('Error fetching active users:', error));
// }


// function fetchPendingChallenges() {
//     fetch('/pending-challenges/')
//         .then(response => response.json())
//         .then(data => {
//             const gameInfo = document.getElementById('game-info');
//             gameInfo.innerHTML = '';

//             if (data.pending_challenges.length > 0) {
//                 data.pending_challenges.forEach(challenge => {
//                     const div = document.createElement('div');
//                     div.innerHTML = `
//                         <p>${challenge.sender} has challenged you!</p>
//                         <button class="btn btn-success" onclick="acceptChallenge(${challenge.id})">Accept</button>
//                         <button class="btn btn-danger" onclick="declineChallenge(${challenge.id})">Decline</button>
//                     `;
//                     gameInfo.appendChild(div);
//                 });
//             } else {
//                 gameInfo.innerHTML = '<p>No new challenges.</p>';
//             }
//         })
//         .catch(error => console.error('Error fetching challenges:', error));
// }

// function checkForOngoingGame() {
//     if (isMoveInProgress) return; 

//     fetch('/ongoing-game/')
//         .then(response => response.json())
//         .then(data => {
//             if (data.status === 'success' && data.game_id) {
//                 activeGameId = data.game_id;

//                 if (window.location.pathname === '/') {
//                     window.location.href = `/game/${activeGameId}/`; 
//                 }
//                 renderChessboard(data.board, activeGameId, data.turn, data.player_color);
//             } else if (data.status === 'no_active_game') {
//                 document.getElementById('chessboard-container').innerHTML = '<p>No active game.</p>';
//                 window.location.href = '/';
//             } else if (data.status === 'game_over') {
//                 const outcomeMessage = `Game Over! ${data.winner} wins.`;
//                 const alertElement = document.getElementById('gameOutcomeAlert');
//                 document.getElementById('gameOutcomeMessage').innerText = outcomeMessage;
//                 alertElement.style.display = 'block';
//                 window.location.href = '/';
//             }
//         })
//         .catch(error => console.error('Error checking for ongoing game:', error));
// }



// function renderChessboard(board, gameId, turn, playerColor) {
//     const chessboardContainer = document.getElementById('chessboard-container');

//     if (isMoveInProgress) return;

//     chessboardContainer.innerHTML = ''; 

//     let timestamp = new Date().getTime();

//     let tableHtml = `<table class="table-bordered" data-timestamp="${timestamp}"><tbody>`;
//     const colLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

//     board.forEach((row, rowIndex) => {
//         tableHtml += `<tr><th>${8 - rowIndex}</th>`;
//         Object.entries(row).forEach(([cellLabel, piece]) => {
//             tableHtml += `
//                 <td id="${cellLabel}" style="width: 75px; height: 75px; font-size: 60px;
//                     text-align: center; vertical-align: middle;">
//                     ${piece || ''}
//                 </td>`;
//         });
//         tableHtml += '</tr>';
//     });

//     tableHtml += '<tr><th></th>';
//     colLabels.forEach(label => {
//         tableHtml += `<th>${label}</th>`;
//     });
//     tableHtml += '</tr></tbody></table>';

//     const playerInfoHtml = `
//         <div id="player-info" class="text-center mt-3">
//             <p>You are playing as <strong>${playerColor}</strong>.</p>
//             <p>It's <strong>${turn === 'w' ? 'White' : 'Black'}</strong>'s turn to move.</p>
//         </div>
//     `;

//     chessboardContainer.innerHTML = playerInfoHtml + tableHtml;

//     const isPlayerTurn = (turn === 'w' && playerColor === 'White') || 
//                          (turn === 'b' && playerColor === 'Black');

//     chessboardContainer.innerHTML += `
//         <form id="moveForm" class="d-flex justify-content-center align-items-center gap-2 mt-3">
//             <input type="text" id="uciInput" class="form-control w-50" 
//                    placeholder="Enter move (e.g., e2e4)" required ${!isPlayerTurn ? 'disabled' : ''}>
//             <button type="submit" class="btn btn-primary" ${!isPlayerTurn ? 'disabled' : ''}>Move</button>
//             <button type="button" id="resignButton" class="btn btn-danger">Resign</button>
//         </form>
//     `;

//     const moveForm = document.getElementById('moveForm');
//     moveForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const uciMove = document.getElementById('uciInput').value.trim();
//         if (uciMove.length === 4) {
//             makeMove(gameId, uciMove);
//         } else {
//             alert("Invalid move! Please enter a valid UCI move (e.g., e2e4).");
//         }
//     });

//     const resignButton = document.getElementById('resignButton');
//     resignButton.addEventListener('click', () => {
//         if (confirm('Are you sure you want to resign?')) {
//             resignGame(gameId);
//         }
//     });

//     moveForm.addEventListener('focusin', () => (isMoveInProgress = true));
//     moveForm.addEventListener('focusout', () => (isMoveInProgress = false));
// }


// function resignGame(gameId) {
//     fetch(`/resign-game/${gameId}/`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' }
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.status === 'success') {
//             alert('You have resigned from the game.');
//             window.location.href = data.redirect_url; 
//         } else {
//             alert(data.message || 'Failed to resign.');
//         }
//     })
//     .catch(error => console.error('Error resigning game:', error));
// }


// function applyMoveToUI(src, dest) {
//     const srcCell = document.getElementById(src);
//     const destCell = document.getElementById(dest);

//     if (srcCell && destCell) {
//         destCell.innerHTML = srcCell.innerHTML; 
//         srcCell.innerHTML = ''; 
//     }
// }

// function makeMove(gameId, move) {
//     isMoveInProgress = true; 

//     applyMoveToUI(move.slice(0, 2), move.slice(2)); 

//     fetch(`/make-move/${gameId}/`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ move: move })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.status === 'success') {
//             if (data.checkmate) {
//                 alert(`Checkmate! ${data.winner} wins.`);
//                 window.location.href = data.redirect_url;
//             } else if (data.stalemate) {
//                 alert("The game is a draw by stalemate.");
//                 window.location.href = data.redirect_url;
//             } else {

//                 renderChessboard(data.board, gameId, data.turn, data.player_color);
//             }
//         } else {
//             alert(data.message || 'Invalid move');
//             fetchGameState(gameId); 
//         }
//     })
//     .catch(error => {
//         console.error('Error making move:', error);
//         fetchGameState(gameId);
//     })
//     .finally(() => {
//         isMoveInProgress = false; 
//     });
// }




// function sendChallenge(opponentId) {
//     fetch('/challenge/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ opponent_id: opponentId })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.status === 'success') {
//             alert('Challenge sent successfully!');
//         } else {
//             alert(`Error: ${data.message}`);
//         }
//     })
//     .catch(error => console.error('Error sending challenge:', error));
// }


// function acceptChallenge(challengeId) {
//     fetch(`/accept-challenge/${challengeId}/`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' }
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.status === 'success') {
//             alert(data.message);
//             activeGameId = data.game_id; 
//             window.location.href = data.redirect_url; 
//             renderChessboard(data.board, data.game_id, data.turn, data.player_color); 
//         } else {
//             alert('Failed to start the game.');
//         }
//     })
//     .catch(error => console.error('Error accepting challenge:', error));
// }

// function declineChallenge(challengeId) {
//     fetch(`/decline-challenge/${challengeId}/`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' }
//     })
//     .then(response => response.json())
//     .then(data => {
//         alert(data.message);
//         fetchPendingChallenges(); 
//     })
//     .catch(error => console.error('Error declining challenge:', error));
// }


// let gameIdToDelete = null;


// document.getElementById('deleteModal').addEventListener('show.bs.modal', function (event) {
//     const button = event.relatedTarget;
//     gameIdToDelete = button.getAttribute('data-game-id');
// });

// document.getElementById('confirmDelete').addEventListener('click', function () {
//     fetch(`/delete-game/${gameIdToDelete}/`, {
//         method: 'POST',
//         headers: {
//             'X-CSRFToken': '{{ csrf_token }}',
//             'Content-Type': 'application/json',
//         },
//     })
//         .then(response => response.json())
//         .then(data => {
//             if (data.status === 'success') {
//                 location.reload(); 
//             } else {
//                 alert('Failed to delete the game.');
//             }
//         })
//         .catch(error => console.error('Error deleting game:', error));
// });

console.log("active_users.js loaded");

let activeGameId = null;
let isMoveInProgress = false;

// Determine WebSocket protocol based on current page protocol
const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
const ws = new WebSocket(`${protocol}${window.location.host}/ws/game/`);

ws.onopen = () => {
    console.log("WebSocket connection reestablished.");
    // Fetch updated active users list
    ws.send(JSON.stringify({ type: "request_active_users" }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    console.log("WebSocket message received:", data);

    switch (data.type) {
        case "active_users":
            updateActiveUsersList(data.active_users);
            break;
        case "challenge_notification":
            alert(`${data.challenger} has challenged you to a game!`);
            addPendingChallenge(data.challenger);
            break;
        case "game_start":
            console.log(`Game started! Opponent: ${data.opponent}`);
            // Redirect to the game page with board state
            window.location.href = `/game/${data.game_id}/`;
            checkForOngoingGame()
            break;
        case "make_move":
            console.log("make_move received")
            window.location.href = '/'
            checkForOngoingGame()
            break;
        case "resign":
            alert(`Game Over! Your opponent has resigned.`);
            window.location.href = "/";
            break;
        case "game_over":
            handleGameOver(data);
            break;
        default:
            console.error("Unknown message type:", data.type);
    }
};

ws.onclose = () => {
    console.log("WebSocket connection closed. Reconnecting...");
    setTimeout(() => {
        window.location.reload(); // Reload to ensure fresh state
    }, 1000);
};




// Update the list of active players
function updateActiveUsersList(activeUsers) {
    const activePlayersList = document.getElementById("active-players");
    activePlayersList.innerHTML = "";

    const loggedInUsernameElement = document.getElementById("logged-in-username");
    const loggedInUsername = loggedInUsernameElement ? loggedInUsernameElement.textContent.trim() : null;

    // Filter valid usernames, exclude the logged-in user
    const filteredUsers = (activeUsers || []).filter(username => username && username !== loggedInUsername);

    if (filteredUsers.length > 0) {
        filteredUsers.forEach(username => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";
            listItem.innerHTML = `
                ${username}
                <button class="btn btn-sm btn-primary" onclick="sendChallenge('${username}')">Challenge</button>
            `;
            activePlayersList.appendChild(listItem);
        });
    } else {
        activePlayersList.innerHTML = '<li class="list-group-item">No active players available.</li>';
    }
}





// Update pending challenges
// function updatePendingChallenges(challenges) {
//     const gameInfo = document.getElementById("game-info");
//     gameInfo.innerHTML = "";

//     if (challenges.length > 0) {
//         challenges.forEach(challenge => {
//             const div = document.createElement("div");
//             div.innerHTML = `
//                 <p>${challenge.sender} has challenged you!</p>
//                 <button class="btn btn-success" onclick="acceptChallenge(${challenge.id})">Accept</button>
//                 <button class="btn btn-danger" onclick="declineChallenge(${challenge.id})">Decline</button>
//             `;
//             gameInfo.appendChild(div);
//         });
//     } else {
//         gameInfo.innerHTML = '<p>No new challenges.</p>';
//     }
// }

// Update game state
// function updateGameState(data) {
//     console.log("update gamestate reached")
//     console.log(data)
//     if (data.status === "success" && data.game_id) {
//         activeGameId = data.game_id;
//         renderChessboard(data.board, data.game_id, data.turn, data.player_color);
//     } else if (data.status === "no_active_game") {
//         document.getElementById("chessboard-container").innerHTML = "<p>No active game.</p>";
//         window.location.href = "/";
//     }
// }

function checkForOngoingGame() {
    if (isMoveInProgress) return; 

    fetch('/ongoing-game/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.game_id) {
                activeGameId = data.game_id;

                if (window.location.pathname === '/') {
                    window.location.href = `/game/${activeGameId}/`; 
                }
                renderChessboard(data.board, activeGameId, data.turn, data.player_color);
            } else if (data.status === 'no_active_game') {
                document.getElementById('chessboard-container').innerHTML = '<p>No active game.</p>';
                window.location.href = '/';
            } else if (data.status === 'game_over') {
                const outcomeMessage = `Game Over! ${data.winner} wins.`;
                const alertElement = document.getElementById('gameOutcomeAlert');
                document.getElementById('gameOutcomeMessage').innerText = outcomeMessage;
                alertElement.style.display = 'block';
                window.location.href = '/';
            }
        })
        .catch(error => console.error('Error checking for ongoing game:', error));
}


// Handle game over
function handleGameOver(data) {
    alert(`Game Over! ${data.winner} wins.`);
    window.location.href = "/";
}

// Render the chessboard
function renderChessboard(board, gameId, turn, playerColor) {

    let opponentUsername = '';

    // Fetch opponent username and update the variable
    fetch(`/api/get_opponent_username/${gameId}/`)
        .then(response => response.json())
        .then(data => {
            opponentUsername = data.opponent_username;

            // Now that you have the opponent's username, you can use it in your UI rendering logic
            console.log(opponentUsername);  // For example, you can log or display it, if needed
        })
        .catch(error => console.error('Error fetching opponent username:', error));

    const chessboardContainer = document.getElementById("chessboard-container");

    chessboardContainer.innerHTML = "";

    let tableHtml = `<table class="table-bordered"><tbody>`;
    const colLabels = ["a", "b", "c", "d", "e", "f", "g", "h"];

    board.forEach((row, rowIndex) => {
        tableHtml += `<tr><th>${8 - rowIndex}</th>`;
        Object.entries(row).forEach(([cellLabel, piece]) => {
            tableHtml += `
                <td id="${cellLabel}" style="width: 75px; height: 75px; font-size: 60px;
                    text-align: center; vertical-align: middle;">
                    ${piece || ""}
                </td>`;
        });
        tableHtml += "</tr>";
    });

    tableHtml += "<tr><th></th>";
    colLabels.forEach(label => {
        tableHtml += `<th>${label}</th>`;
    });
    tableHtml += "</tr></tbody></table>";

    const playerInfoHtml = `
        <div id="player-info" class="text-center mt-3">
            <p>You are playing as <strong>${playerColor}</strong>.</p>
            <p>It's <strong>${turn === "w" ? "White" : "Black"}</strong>'s turn to move.</p>
        </div>
    `;

    chessboardContainer.innerHTML = playerInfoHtml + tableHtml;

    const isPlayerTurn = (turn === "w" && playerColor === "White") || (turn === "b" && playerColor === "Black");

    chessboardContainer.innerHTML += `
        <form id="moveForm" class="d-flex justify-content-center align-items-center gap-2 mt-3">
            <input type="text" id="uciInput" class="form-control w-50" 
                   placeholder="Enter move (e.g., e2e4)" required ${!isPlayerTurn ? "disabled" : ""}>
            <button type="submit" class="btn btn-primary" ${!isPlayerTurn ? "disabled" : ""}>Move</button>
            <button type="button" id="resignButton" class="btn btn-danger">Resign</button>
        </form>
    `;

    document.getElementById("moveForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const uciMove = document.getElementById("uciInput").value.trim();
        const func = checkIfValidMove(gameId,uciMove);
        const checkValid = func && uciMove.length === 4;
        if (checkValid) {
            makeMove(gameId, uciMove);
            sendMove(uciMove, opponentUsername);

        } else {
            alert("Invalid move! Enter a valid UCI move (e.g., e2e4).")
        }
    });

    // document.getElementById("resignButton").addEventListener("click", () => {
    //     if (confirm("Are you sure you want to resign?")) {
    //         sendResign(opponentUsername);
    //     }
    // });
    const resignButton = document.getElementById('resignButton');
    resignButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to resign?')) {
            resignGame(gameId);
            sendResign(opponentUsername);
        }
    });
}

// Send a move to the server
function sendMove(move, opponentUsername) {
    ws.send(
        JSON.stringify({
            type: "make_move",
            move: move,
            opponent_username: opponentUsername, // Include opponent's username
            game_id: activeGameId // Ensure game ID is included to identify the game
        })
    );
}

// Send a resign message to the server
function sendResign(opponentUsername) {
    ws.send(
        JSON.stringify({
            type: "resign",
            opponent_username: opponentUsername,
        })
    );
}

// Send a challenge request
function sendChallenge(username) {
    ws.send(
        JSON.stringify({
            type: "send_challenge",
            opponent_username: username,
        })
    );
}

// // Accept a challenge
// function acceptChallenge(challengeId) {ssssss
//     fetch('/accept-challenge/${challengeId}/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ challenge_id: challengeId })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.status === 'success') {
//             console.log(`Game started with ID: ${data.game_id}`);
//             window.location.href = `/game/${data.game_id}/`; // Redirect to the game page
//         } else {
//             alert(data.message || 'Error accepting challenge.');
//         }
//     })
//     .catch(error => console.error('Error:', error));
// }

function acceptChallenge(challengeId) {
    fetch(`/accept-challenge/${challengeId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            activeGameId = data.game_id; 
            window.location.href = data.redirect_url; 
            renderChessboard(data.board, data.game_id, data.turn, data.player_color); 
        } else {
            alert('Failed to start the game.');
        }
    })
    .catch(error => console.error('Error accepting challenge:', error));
}


function removePendingChallenge(challenger) {
    const gameInfo = document.getElementById("game-info");
    const challenges = gameInfo.querySelectorAll(".pending-challenge");

    challenges.forEach((challenge) => {
        if (challenge.textContent.includes(challenger)) {
            gameInfo.removeChild(challenge);
        }
    });
}


function addPendingChallenge(challenger) {
    const gameInfo = document.getElementById("game-info");

    // Create a new div for the challenge
    const div = document.createElement("div");
    div.className = "pending-challenge";

    // Populate the div with the challenge details and buttons
    div.innerHTML = `
        <p>${challenger} has challenged you!</p>
        <button class="btn btn-success" onclick="acceptChallenge('${challenger}')">Accept</button>
        <button class="btn btn-danger" onclick="declineChallenge(this)">Decline</button>
    `;

    // Append the new challenge to the gameInfo container
    gameInfo.appendChild(div);
}

function declineChallenge(button) {
    // Remove the parent div of the button
    const challengeDiv = button.parentElement;
    challengeDiv.parentElement.removeChild(challengeDiv);
}


function applyMoveToUI(src, dest) {
    const srcCell = document.getElementById(src);
    const destCell = document.getElementById(dest);

    if (srcCell && destCell) {
        destCell.innerHTML = srcCell.innerHTML; 
        srcCell.innerHTML = ''; 
    }
}

function makeMove(gameId, move) {
    isMoveInProgress = true; 

    

    fetch(`/make-move/${gameId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: move })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            applyMoveToUI(move.slice(0, 2), move.slice(2)); 
            if (data.checkmate) {
                alert(`Checkmate! ${data.winner} wins.`);
                window.location.href = data.redirect_url;
            } else if (data.stalemate) {
                alert("The game is a draw by stalemate.");
                window.location.href = data.redirect_url;
            } else {
                console.log(data.player_color)
                renderChessboard(data.board, gameId, data.turn, data.player_color);
            }
        } else {
            alert(data.message || 'Invalid move');
            //fetchGameState(gameId); 
        }
    })
    .catch(error => {
        console.error('Error making move:', error);
        //fetchGameState(gameId);
    })
    .finally(() => {
        isMoveInProgress = false; 
    });
}

function fetchOpponentUsername(gameId) {
    fetch(`/api/get_opponent_username/${gameId}/`)
        .then(response => response.json())
        .then(data => {
            const opponentUsername = data.opponent_username;
            displayOpponentUsername(opponentUsername);
        })
        .catch(error => console.error('Error fetching opponent username:', error));
}

async function checkIfValidMove(gameId, move) {
    let isValid = false;

    try {
        const response = await fetch(`/api/check-valid-move/${gameId}/`, {
            method: 'POST', // Use POST method for sending data
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ move: move }),
        });

        if (response.ok) {
            const data = await response.json();  // Wait for the response data
            isValid = data.isValid;  // Assuming the response contains { isValid: boolean }
        } else {
            console.error('Error checking move validity:', response.statusText);
        }
    } catch (error) {
        console.error('Error checking valid move:', error);
    }

    return isValid;
}

function resignGame(gameId) {
    fetch(`/resign-game/${gameId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('You have resigned from the game.');
            window.location.href = data.redirect_url; 
        } else {
            alert(data.message || 'Failed to resign.');
        }
    })
    .catch(error => console.error('Error resigning game:', error));
}
