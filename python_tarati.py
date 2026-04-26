# IMPORTANT: USE FOR TRAINING AI ONLY, DO NOT USE FOR ANYTHING ELSE. WILL BREAK. ALSO BE CAREFUL WITH .PKL FILE

import random
import pickle
import os
import time

# CONSTANTS
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

BLACK_START = {'D3', 'D4', 'C7', 'C8'}
WHITE_START = {'D1', 'D2', 'C1', 'C2'}

WHITE_PROMOTION = {'C7', 'C8', 'D3', 'D4'}
BLACK_PROMOTION = {'C1', 'C2', 'D1', 'D2'}

Y_POSITIONS = {
    'A1': 50,
    'B1': 65, 'B2': 58, 'B3': 42, 'B4': 35, 'B5': 42, 'B6': 58,
    'C1': 80, 'C2': 80, 'C3': 70, 'C4': 58, 'C5': 42, 'C6': 30,
    'C7': 20, 'C8': 20, 'C9': 30, 'C10': 42, 'C11': 58, 'C12': 70,
    'D1': 93, 'D2': 93, 'D3': 7, 'D4': 7
}

Q_table_visits = {}

# DIRECTION VALIDATION
def is_valid_direction(from_pos, to_pos, is_black, piece_type):
    if piece_type == 'ROCK':
        return True

    from_y = Y_POSITIONS[from_pos]
    to_y = Y_POSITIONS[to_pos]

    if from_y == to_y:
        return False

    if is_black:
        return to_y > from_y 
    else:
        return to_y < from_y 


def are_positions_adjacent(from_pos, to_pos):
    return to_pos in ADJACENCY_MAP.get(from_pos, [])


# GAME CLASS
class TaratiGame:
    def __init__(self):
        self.board = self._create_initial_board()
        self.current_player = 'WHITE'
        self.game_status = 'ONGOING'

    def _create_initial_board(self):
        board = {}
        for pos in BLACK_START:
            board[pos] = {'color': 'BLACK', 'type': 'NORMAL'}
        for pos in WHITE_START:
            board[pos] = {'color': 'WHITE', 'type': 'NORMAL'}
        return board

    def get_valid_moves(self, player):
        moves = []
        is_black = (player == 'BLACK')

        for pos, piece in self.board.items():
            if piece['color'] != player:
                continue
            for adj in ADJACENCY_MAP.get(pos, []):
                if adj in self.board:
                    continue
                if not are_positions_adjacent(pos, adj):
                    continue
                if is_valid_direction(pos, adj, is_black, piece['type']):
                    moves.append((pos, adj))
        return moves

    def has_valid_moves(self, player):
        return len(self.get_valid_moves(player)) > 0

    def get_affected_pieces(self, position, player_color):
        opposite = 'WHITE' if player_color == 'BLACK' else 'BLACK'
        affected = []
        for adj in ADJACENCY_MAP.get(position, []):
            if adj in self.board and self.board[adj]['color'] == opposite:
                affected.append(adj)
        return affected

    def flip_pieces(self, positions, color):
        for pos in positions:
            if pos in self.board:
                self.board[pos]['color'] = color

    def check_promotion(self, pos):
        if pos not in self.board:
            return
        piece = self.board[pos]
        if piece['type'] == 'ROCK':
            return 

        if piece['color'] == 'WHITE' and pos in WHITE_PROMOTION:
            self.board[pos]['type'] = 'ROCK'
        elif piece['color'] == 'BLACK' and pos in BLACK_PROMOTION:
            self.board[pos]['type'] = 'ROCK'

    def make_move(self, from_pos, to_pos):
        if from_pos not in self.board:
            return False
        if to_pos in self.board:
            return False

        piece = self.board.pop(from_pos)
        self.board[to_pos] = piece

        self.check_promotion(to_pos)

        affected = self.get_affected_pieces(to_pos, self.current_player)
        if affected:
            self.flip_pieces(affected, self.current_player)
            for pos in affected:
                self.check_promotion(pos)

        next_player = 'WHITE' if self.current_player == 'BLACK' else 'BLACK'

        next_pieces = [p for p in self.board.values() if p['color'] == next_player]
        if len(next_pieces) == 0:
            self.game_status = f'{self.current_player}_WON'
            return True

        if not self.has_valid_moves(next_player):
            self.game_status = f'{self.current_player}_WON'
            return True

        self.current_player = next_player
        return True

    def is_over(self):
        return self.game_status != 'ONGOING'

    def get_winner(self):
        if self.game_status == 'BLACK_WON':
            return 'BLACK'
        elif self.game_status == 'WHITE_WON':
            return 'WHITE'
        return None



# Q-LEARNING
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


def select_action(Q_table, state, actions, epsilon):
    global Q_table_visits
    
    if state not in Q_table:
        Q_table[state] = {}
        Q_table_visits[state] = 0
    
    Q_table_visits[state] += 1
    
    for action in actions:
        if action not in Q_table[state]:
            Q_table[state][action] = 0.0

    if random.random() < epsilon:
        return random.choice(actions)
    else:
        return max(actions, key=lambda a: Q_table[state][a])


def update_q_table(Q_table, episode, winner, alpha, gamma):
    for color in ['BLACK', 'WHITE']:
        reward = 1 if winner == color else -1
        for i in range(len(episode[color]) - 1, -1, -1):
            state, action = episode[color][i]
            old_value = Q_table[state][action]
            Q_table[state][action] += alpha * (reward - old_value)
            reward *= gamma


def prune_q_table(Q_table, min_visits=3):
    global Q_table_visits
    
    states_to_remove = [s for s, count in Q_table_visits.items() if count < min_visits]
    for state in states_to_remove:
        if state in Q_table:
            del Q_table[state]
        if state in Q_table_visits:
            del Q_table_visits[state]
    return len(states_to_remove)


def save_q_table(Q_table, epsilon, path='q_table.pkl'):
    data = {
        'Q_table': Q_table,
        'Q_table_visits': Q_table_visits,
        'epsilon': epsilon
    }
    with open(path, 'wb') as f:
        pickle.dump(data, f)


def load_q_table(path='q_table.pkl'):
    global Q_table_visits
    if os.path.exists(path):
        with open(path, 'rb') as f:
            data = pickle.load(f)
        
        if isinstance(data, dict) and 'Q_table' in data:
            Q_table_visits = data.get('Q_table_visits', {})
            epsilon = data.get('epsilon', 0.3)
            return data['Q_table'], epsilon
        else:
            Q_table_visits = {}
            return data, 0.3
    
    return {}, 0.3


def train(num_games=100000, epsilon_start=0.3, epsilon_end=0.05, alpha=0.5, gamma=0.9, 
          save_every=10000, backup_every=20000, prune_threshold=5):
    Q_table, loaded_epsilon = load_q_table()
    
    epsilon = loaded_epsilon if len(Q_table) > 0 else epsilon_start
    
    print(f"Loaded Q-table with {len(Q_table)} states")
    print(f"Starting epsilon: {epsilon:.4f}")
    print(f"Training for {num_games} games...")
    print(f"Epsilon: {epsilon:.4f} → {epsilon_end}, Alpha: {alpha}, Gamma: {gamma}")
    print("─" * 70)

    epsilon_decay = (epsilon_end / max(epsilon, epsilon_end)) ** (1 / num_games)

    black_wins = 0
    white_wins = 0
    total_moves = 0
    start_time = time.time()

    for game_num in range(1, num_games + 1):
        game = TaratiGame()
        episode = {'BLACK': [], 'WHITE': []}

        while not game.is_over():
            player = game.current_player
            valid_moves = game.get_valid_moves(player)

            if not valid_moves:
                other = 'WHITE' if player == 'BLACK' else 'BLACK'
                game.game_status = f'{other}_WON'
                break

            state = flatten_board(game.board, player)
            action = select_action(Q_table, state, valid_moves, epsilon)
            episode[player].append((state, action))
            game.make_move(action[0], action[1])

        winner = game.get_winner()
        if winner:
            update_q_table(Q_table, episode, winner, alpha, gamma)
            if winner == 'BLACK':
                black_wins += 1
            else:
                white_wins += 1

        total_moves += len(episode['BLACK']) + len(episode['WHITE'])
        
        epsilon = max(epsilon_end, epsilon * epsilon_decay)

        if game_num % save_every == 0:
            save_q_table(Q_table, epsilon)

        if game_num % backup_every == 0:
            removed = prune_q_table(Q_table, min_visits=prune_threshold)
            
            save_q_table(Q_table, epsilon, f'q_table_backup_{game_num}.pkl')
            elapsed = time.time() - start_time
            avg_moves = total_moves / game_num
            print(f"Game {game_num:>6} | B: {black_wins:>5} | W: {white_wins:>5} | "
                  f"Moves: {avg_moves:.1f} | States: {len(Q_table):>7} | "
                  f"ε: {epsilon:.4f} | Pruned: {removed:>7} | Time: {elapsed:.1f}s")

    save_q_table(Q_table, epsilon)
    elapsed = time.time() - start_time
    print("─" * 70)
    print(f"Training complete!")
    print(f"Total games: {game_num}")
    print(f"Black wins: {black_wins} ({black_wins/game_num*100:.1f}%)")
    print(f"White wins: {white_wins} ({white_wins/game_num*100:.1f}%)")
    print(f"Total states learned: {len(Q_table)}")
    print(f"Final epsilon: {epsilon:.4f}")
    print(f"Total time: {elapsed:.1f}s ({game_num/elapsed:.1f} games/sec)")

def test_vs_random(num_games=100):
    Q_table, _ = load_q_table()
    print(f"\n{'='*70}")
    print(f"Testing Q-bot (1.7M states) vs Random Player")
    print(f"{'='*70}\n")
    
    black_wins = 0
    white_wins = 0
    
    print("Testing Q-bot as BLACK vs Random WHITE...")
    for i in range(num_games):
        game = TaratiGame()
        while not game.is_over():
            moves = game.get_valid_moves(game.current_player)
            if game.current_player == 'BLACK':
                state = flatten_board(game.board, 'BLACK')
                if state in Q_table:
                    q_values = {a: Q_table[state].get(a, 0.0) for a in moves}
                    action = max(q_values, key=q_values.get)
                else:
                    action = random.choice(moves)
            else:
                action = random.choice(moves)
            game.make_move(action[0], action[1])
        
        if game.get_winner() == 'BLACK':
            black_wins += 1
        
        if (i+1) % 20 == 0:
            print(f"  Progress: {i+1}/{num_games} games")
    
    print(f"  Result: {black_wins}/{num_games} wins ({black_wins/num_games*100}%)\n")
    
    print("Testing Q-bot as WHITE vs Random BLACK...")
    for i in range(num_games):
        game = TaratiGame()
        while not game.is_over():
            moves = game.get_valid_moves(game.current_player)
            if game.current_player == 'WHITE':
                state = flatten_board(game.board, 'WHITE')
                if state in Q_table:
                    q_values = {a: Q_table[state].get(a, 0.0) for a in moves}
                    action = max(q_values, key=q_values.get)
                else:
                    action = random.choice(moves)
            else:
                action = random.choice(moves)
            game.make_move(action[0], action[1])
        
        if game.get_winner() == 'WHITE':
            white_wins += 1
        
        if (i+1) % 20 == 0:
            print(f"  Progress: {i+1}/{num_games} games")
    
    print(f"  Result: {white_wins}/{num_games} wins ({white_wins/num_games*100}%)\n")
    
    avg_win_rate = (black_wins + white_wins) / 2 / num_games*100
    print(f"{'='*70}")
    print(f"OVERALL WIN RATE: {avg_win_rate:.3f}%")
    print(f"{'='*70}\n")
    

# RUN
if __name__ == "__main__":
    test_vs_random(10000)
    '''train(num_games=100000,
          epsilon_start=None,
          epsilon_end=0.02,
          alpha=0.1,
          gamma=1,
          save_every=10000,
          backup_every=50000,
          prune_threshold=5
          )'''