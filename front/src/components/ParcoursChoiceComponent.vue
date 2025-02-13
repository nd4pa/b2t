<template>
  <div class="container">
    <div
      class="embed-responsive embed-responsive-16by9"
      style="margin-top: 10%; max-width: 560px; margin-left: auto; margin-right: auto;"
    >
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/VD2bQN5M9wM"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <h1>Choisis ton parcours</h1>
    <div class="row">
      <div class="col-md-3">
        <img
          @click="selectChoice(0)"
          src="@/assets/img/bosseEtBobo.png"
          alt="Bosses et bobos"
        />
      </div>
      <div class="col-md-3">
        <img
          @click="selectChoice(3)"
          src="@/assets/img/robinson.png"
          alt="Robinson"
        />
      </div>
      <div class="col-md-3">
        <img
          @click="selectChoice(2)"
          src="@/assets/img/cesArt.png"
          alt="Césart"
        />
      </div>
      <div class="col-md-3">
        <img
          @click="selectChoice(1)"
          src="@/assets/img/troisEtoiles.png"
          alt="Trois étoiles"
        />
      </div>
    </div>
    <span v-if="role != 'jeune'">Vue des jeunes</span>
    <b-modal
      class="modal-backdrop"
      id="choiceModal"
      title="Choix de parcours"
      hide-backdrop
    >
      <div class="modal-body">
        Tu as sélectionné le parcours <b>{{ getParcoursName(selected) }}</b
        >. Est-ce bien ce parcours que tu souhaites suivre ? <br />
        Une fois ton choix fait, tu ne pourras pas revenir en arrière !
      </div>
      <template v-slot:modal-footer="{}">
        <b-button variant="secondary" @click="cancelChoice()">
          Revenir au choix de parcours
        </b-button>
        <b-button
          variant="success"
          @click.prevent.capture="validateChoice(selected)"
        >
          Choisir ce parcours !
        </b-button>
      </template>
    </b-modal>
    <ErrorModal :title="titleError" :message="messageError" />
  </div>
</template>

<script>
import Vue from "vue";
import VueRouter from "vue-router";
import ItineraryHelpers from "../service/itineraryHelpers";
import ProgressionService from "../service/progression.service";
import ErrorModal from "./includes/ErrorModal";

Vue.use(VueRouter);

export default {
  name: "ParcoursChoiceComponent",
  components: { ErrorModal },
  data() {
    return {
      selected: null,
      titleError: "Impossible de choisir le parcours",
      messageError:
        "Nous n'arrivons pas à sélectionner le parcours ! Vérifie ta connexion internet et réessaie !",
    };
  },
  computed: {
    role() {
      if (!this.$store.state.auth.user) {
        return "jeune";
      }
      return this.$store.state.auth.user.role;
    },
  },
  created() {
    if ([0, 1, 2, 3].includes(this.$store.state.parcours.parcours)) {
      return this.$router.push("/activitees");
    }
  },
  mounted() {
    this.$root.$on('bv::modal::hide', (bvEvent, modalId) => {
      if (modalId === "choiceModal") {
        this.selected = null;
      }
    })
  },
  methods: {
    getParcoursName: ItineraryHelpers.getParcoursName,
    cancelChoice() {
      this.$bvModal.hide("choiceModal");
      this.selected = null;
    },
    async validateChoice(selected) {
      // state "NOTSTARTED" + idActivite == -1 --> choix de parcours
      // state "NOTSTARTED" + idActivite == -2 --> fin de parcours
      let parcoursFirstProgression = {
        state: "NOTSTARTED",
        idActivite: "-1",
        idParcours: JSON.stringify(parseInt(selected)),
        entries: [],
      };
      let isChosen = await ProgressionService.createProgression(
        parcoursFirstProgression
      );
      if (isChosen === undefined) {
        console.warn("Impossible to send the Parcours to server!");
        this.$bvModal.show("errorModal");
        this.selected = null;
      } else {
        // Store the Parcours and redirecte to activities
        this.$store.dispatch("parcours/setParcours", selected);
        this.$router.push("/activitees");
      }
    },
    async selectChoice(selected) {
      // Check the role
      if (this.role != "jeune") {
        return this.$router.push("/");
      }
      // Creates the first empty progression to permit to retrieve parcours after reconnection
      console.log("Parcours chosen:" + selected);
      if ([0, 1, 2, 3].includes(this.$store.state.parcours.parcours)) {
        //Parcours already chosen before (can open if user uses back/previous button)
        console.warn("Parcours already chosen before !");
        this.$router.push("/activitees");
      }
      if (this.selected !== null) {
        console.warn("Parcours already selected !");
        return; // Parcours has just been selected
      }
      this.selected = selected;
      this.$bvModal.show("choiceModal");
    },
  },
};
</script>

<style scoped>
.container {
  text-align: center;
}
.col-md-3 img {
  max-width: 100%;
  cursor: pointer;
}
</style>
