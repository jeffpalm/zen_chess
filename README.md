# Zen Chess
___
## App Concept & Wireframe
### App Concept
- There are already some amazing chess websites out there such as Chess.com and Lichess.org. The stat tracking, learning resources, sophisticated ranking/matchmaking are wonderful. But for me, all that information gets to my head sometimes. I'll get matched up with someone rated higher and psych myself out or somone lower and make dumb mistakes. That's what Zen Chess is for. The times when you just want to play chess and get out of your own head.
- Online chess stripped down:
    - No database
    - No stat tracking or rankings
    - No chat
    - Just chess
    - Clean UI, quick matchmaking, and great sounds.

- I started learning JavaScript 2 months ago, and I also love chess. I decided to challenge myself to program a chess engine from scratch without looking at any existing chess programming resources[^1] in the spirit of immersing myself in learning how to code.
- The goal was to generate all legal moves for every possible chess position

### Functionality
- Backend engine is written from scratch based on 8x8 grid system and offset coordinates from each square:
	![diagram of 8x8 grid](/docs/board_grid.png)  

### Wireframe
![diagram](/docs/Wireframe.png)
    
___
## Endpoints
___
### GET
#### /api/game/new
- Creates new instance of ChessGame class.
- Generate unique game ID
- Pushes {id, Game} to JSON array of current active games
- Returns:
    - **gid**: Game id
    - **pieces**: indices match draw order for drawBoard() function
    - p, r, n, b, k,
    - Uppercase = white, lowercase = black
  - **board**:
    - Arry of objects representing each square on the board
    - Schema
       - **id**: matches coordinate system engine uses
       - **square**: name of square
       - **side**: w, b, or empty string representing side currently controlling square
       - **cP**: Current piece occupying square
       - **cPMvCnt**: Move count of current piece
       - **pP**: Previous piece occupying square
       - **color**: Whether square is dark or light
  - **cvm**: Current valid moves
    - Array of objects representing every valid move for the current position
    - Schema
        - **newSq**: square to move to,
        - **origin**: square to move from,
        - **type**: move, atk, promo, castle. Multiple types separated with ' '
        - **castle**: square to move rook to on castle,
        - **cOrigin**: square rook is coming from.,
        - **promo**: name of piece pawn is promoting to

### PUT
#### /api/game/move/:gid
- Send with move object in body
- Body Schema
    - **newSq**
    - **origin**
    - **type**
    - **castle**
    - **cOrigin**
    - **promo**
- Finds game object with gid param
- Invokes .move() on Game object
- Returns: 
    - **pieces**
    - **board**
    - **cvm**
    - **outcome**
        - ''
        - 'check'
        - 'mate'
        - '3fr' *3 fold repetition draw*
        - 'stale' *stalemate draw*
        - 'draw' *draw*

### POST 
#### /api/game/new
- Use to start game with custom position
- Body schema
    - **fen**
- Generate unique game ID
- Pushes {id, Game} to JSON array of current active games
- Returns:
    - **gid**
    - **pieces**
    - **board**
    - **cvm**


### DELETE
#### /api/game/:gid
- Deletes game from JSON array
- Use when game finishes


___
[^1]: I pretty much accomplished this. I only looked at the Chess Programming wiki when it came to testing and debugging :)