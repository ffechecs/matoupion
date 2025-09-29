export const addPieceToFen = (fen: string, square: string, piece: string) => {
    // Séparer le FEN en ses composants
    const [position, ...rest] = fen.split(' ');
    
    // Convertir la notation algébrique (e.g., 'e4') en indices de tableau
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(square[1]);
    
    // Diviser la position en rangs
    const ranks = position.split('/');
    
    // Convertir le rang ciblé en tableau de caractères
    let targetRank = ranks[rank];
    let newRank = '';
    let currentFile = 0;
    
    // Parcourir le rang et insérer la nouvelle pièce
    for (let i = 0; i < targetRank.length; i++) {
      if (isNaN(parseInt(targetRank[i]))) {
        if (currentFile === file) {
          newRank += piece;
        } else {
          newRank += targetRank[i];
        }
        currentFile++;
      } else {
        const spaces = parseInt(targetRank[i]);
        for (let j = 0; j < spaces; j++) {
          if (currentFile === file) {
            newRank += piece;
          } else {
            newRank += '1';
          }
          currentFile++;
        }
      }
    }
    
    // Remplacer le rang modifié
    ranks[rank] = newRank;
    
    // Reconstruire le FEN
    return [ranks.join('/'), ...rest].join(' ');
  };