from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import pickle
import os
import threading

app = Flask(__name__)
CORS(app)

if os.path.exists('q_table.pkl'):
    with open('q_table.pkl', 'rb') as file:
        data = pickle.load(file)
        if isinstance(data, dict) and 'Q_table' in data:
            Q_table = data['Q_table']
        else:
            Q_table = data
else:
    Q_table = {}
    with open('q_table.pkl', 'wb') as file:
        pickle.dump(Q_table, file)


ADJACENCY_MAP = {
    'A1': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
  
    'B1': ['A1', 'B2', 'B6', 'C1', 'C2'],
    'B2': ['A1', 'B3', 'B1', 'C12', 'C11'],
    'B3': ['A1', 'B4', 'B2', 'C10', 'C9'],
    'B4': ['A1', 'B5', 'B3', 'C8', 'C7'],
    'B5': ['A1', 'B6', 'B4', 'C6', 'C5'],
    'B6': ['A1', 'B1', 'B5', 'C4', 'C3'],
    
    'C1': ['B1', 'C2', 'C12', 'D1'],
    'C2': ['B1', 'C3', 'C1', 'D2'],
    'C3': ['B6', 'C4', 'C2'],
    'C4': ['B6', 'C5', 'C3'],
    'C5': ['B5', 'C6', 'C4'],
    'C6': ['B5', 'C7', 'C5'],
    'C7': ['B4', 'C8', 'C6', 'D3'],
    'C8': ['B4', 'C9', 'C7', 'D4'],
    'C9': ['B3', 'C10', 'C8'],
    'C10': ['B3', 'C11', 'C9'],
    'C11': ['B2', 'C12', 'C10'],
    'C12': ['B2', 'C1', 'C11'],
    
    'D1': ['C1', 'D2'],
    'D2': ['C2', 'D1'],
    'D3': ['C7', 'D4'],
    'D4': ['C8', 'D3']
}

ALL_POSITIONS = [
    'A1',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12',
    'D1', 'D2', 'D3', 'D4'
]

def flatten_board(board, ai_colour):
    flat = []
    for pos in ALL_POSITIONS:
        piece = board.get(pos)
        if piece is None:
            flat.append(0)
        else:
            sign = 1 if piece['color'] == ai_colour else -1
            if piece['type'] == 'ROCK':
                flat.append(2 * sign)
            else:
                flat.append(1 * sign)
    return tuple(flat)

q_table_lock = threading.Lock()
game_count = 0
epsilon = 0.0
alpha = 0.5
gamma = 1.0
game_ongoing = 0
current_episode = {
    "BLACK": [],
    "WHITE": []
}

@app.route("/game-start", methods=["POST"])
def game_start():
    global game_ongoing, current_episode
    game_ongoing = 1
    current_episode = {
    "BLACK": [],
    "WHITE": []
    }
    return jsonify({"message": "Game started", "game_ongoing": game_ongoing})

@app.route("/game-end", methods=["POST"])
def end():
    global game_ongoing, current_episode, Q_table, alpha, gamma, game_count
    data = request.get_json()
    winner = data.get("winner")
    game_ongoing = 0
    game_count += 1
    
    with q_table_lock:
        if winner == "BLACK":
            reward = 1
            for i in range(len(current_episode['BLACK']) - 1, -1, -1):
                state, action = current_episode['BLACK'][i]
                old_value = Q_table[state][action]
                Q_table[state][action] += alpha * (reward - old_value)
                reward *= gamma
            
            reward = -1
            for i in range(len(current_episode['WHITE']) - 1, -1, -1):
                state, action = current_episode['WHITE'][i]
                old_value = Q_table[state][action]
                Q_table[state][action] += alpha * (reward - old_value)
                reward *= gamma
                
        elif winner == "WHITE":
            reward = -1
            for i in range(len(current_episode['BLACK']) - 1, -1, -1):
                state, action = current_episode['BLACK'][i]
                old_value = Q_table[state][action]
                Q_table[state][action] += alpha * (reward - old_value)
                reward *= gamma
            
            reward = 1
            for i in range(len(current_episode['WHITE']) - 1, -1, -1):
                state, action = current_episode['WHITE'][i]
                old_value = Q_table[state][action]
                Q_table[state][action] += alpha * (reward - old_value)
                reward *= gamma
        
        if game_count % 10 == 0:
            with open('q_table.pkl', 'wb') as file:
                pickle.dump(Q_table, file)
            print(f"Q-table saved at game {game_count}")
        
        if game_count % 100 == 0:
            with open(f'q_table_backup_{game_count}.pkl', 'wb') as file:
                pickle.dump(Q_table, file)
            print(f"Backup saved at game {game_count}")

    current_episode = {"BLACK": [], "WHITE": []}

    '''print("\n\n========= Q-TABLE AFTER UPDATE =========")
    for state, actions in Q_table.items():
        print(f"STATE {state}:")
        for action, value in actions.items():
            print(f"   {action} -> {value:.3f}")
    print(f"\nGame ended - Winner: {winner}")
    print("Episode length at end:", len(current_episode['BLACK']) + len(current_episode['WHITE']))'''
    return jsonify({"message": "Game ended", "game_ongoing": game_ongoing, "winner": winner})


@app.route("/ai-move", methods=["POST"])
def ai_move():
    global current_episode, Q_table
    data = request.get_json()
    board = data.get("board", {})
    ai_colour = data.get("ai_colour")
    # print(board)
    possible_moves = data.get("possible_moves", [])
    # print("\n\n" + str(possible_moves))
    
    if not possible_moves:
        return jsonify({"error": "no moves available"}), 400
    
    state = flatten_board(board, ai_colour)
    print("\n\n\n" + str(state))
    actions = [ (m['from'], m['to']) for m in possible_moves ]
    print("\n" + str(actions))

    with q_table_lock:
        if state not in Q_table:
            Q_table[state] = {}
            for action in actions:
                Q_table[state][action] = 0.0

        if random.random() < epsilon:
            chosen_move = random.choice(actions)
        else:
            action_pairs = Q_table[state]
            chosen_move = max(action_pairs, key=action_pairs.get)

        if (ai_colour == "BLACK"):
            current_episode["BLACK"].append((state, chosen_move))
            
        if (ai_colour == "WHITE"):
            current_episode["WHITE"].append((state, chosen_move))

    # print("\nEpisode length:", (len(current_episode['BLACK'])) + (len(current_episode['WHITE'])))

    '''
    capture_moves = []
    for move in possible_moves:
        to_pos = move["to"]
        moving_piece_color = board.get(move["from"], {}).get("color")

        neighbors = ADJACENCY_MAP.get(to_pos, [])
        for neighbor in neighbors:
            neighbor_piece = board.get(neighbor)
            if neighbor_piece and neighbor_piece["color"] != moving_piece_color:
                capture_moves.append(move)
                break

    if capture_moves:
        chosen_move = random.choice(capture_moves)
    else:
        chosen_move = random.choice(possible_moves)
    '''
    return jsonify({"from": chosen_move[0], "to": chosen_move[1]})

if __name__ == "__main__":
    app.run(port=5000, threaded=True)