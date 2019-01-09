import { reducer as form} from 'redux-form';
import { combineReducers } from 'redux';

import facilities from './reducers/facilities.reducer';
import defaults from './reducers/defaults.reducer';
import analysis from './reducers/analysis.reducer';
import states from './reducers/states.reducer';
import users from './reducers/users.reducer';

export default combineReducers({
  states,
  facilities,
  form,
  defaults,
  analysis,
  users,
});
