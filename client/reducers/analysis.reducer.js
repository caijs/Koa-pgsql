const initialState = {
  result: [],
  error: null,
}

export default (state = initialState, action) => {
  switch(action.type) {
    case 'CLEAR_ALL': {
      return { ...initialState };
    }
    case 'LOAD_ANALYSIS': {
      return { ...state, result: action.result };
    }
    default: {
      return state;
    }
  }
}
