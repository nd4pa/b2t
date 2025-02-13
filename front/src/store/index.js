import Vue from "vue";
import Vuex from "vuex";

import { auth } from "./auth.module";
import { activity } from "./activity.module";
import { parcours } from "./parcours.module";
import { progression } from "./progression.module";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    activity,
    parcours,
    progression,
  }
});
