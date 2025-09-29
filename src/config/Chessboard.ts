
export const initialPuzzleBoardConfig = {
    viewOnly: false,
    coordinates: false,
    highlight: {
      lastMove: true, 
      check: true, 
    },
    selectable: {
      enabled: true,
    },
    animation: {
      enabled: true,
      duration: 1000,
    },
    draggable: {
      enabled: true,
    },
    drawable: {
      enabled: false,
    },
    movable: {
     free: false,
     color: 'both',
     showDests: false,
     events: { after: (from: any, to: any) => {} }
    },
    premovable: {
      enabled: false,
    }
  };

  export const initialExerciseBoardConfig = {
    viewOnly: false,
    coordinates: false,
    highlight: {
      lastMove: false, 
      check: false, 
    },
    selectable: {
      enabled: true,
    },
    draggable: {
      enabled: true,
    },
    animation: {
      enabled: true,
      duration: 1000,
    },
    drawable: {
      enabled: false,
    },
    movable: {
      color: 'both',
      free: false,
      rookCastle: true,
      showDests: false,
      events: { after: (from: any, to: any) => {} }
    },
    premovable: {
      enabled: false,
    }
  };


  export const initialListeBoardConfig = {
    viewOnly: true,
    coordinates: true,
    selectable: {
      enabled: false,
    },
    animation: {
      enabled: false,
    },
    draggable: {
      enabled: false,
    },
    drawable: {
      enabled: false,
    },
    movable: {
     free: true,
     color: 'both',
     showDests: false,
     rookCastle: true,
     events: { after: (from: any, to: any) => {} }
    },
    premovable: {
      enabled: false,
    }
    
  };