<template>
  <div class="container">
    <b-modal
      class="modal-backdrop"
      id="progressionModal"
      :title="activity.nom"
      hide-backdrop
    >
      <div class="modal-body">
        <p>{{ getCommentFromState(progression.state) }}</p>
        <p v-if="progression.commentaire && progression.commentaire.length">
          Commentaire: {{ progression.commentaire }}
        </p>
      </div>
      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button variant="primary" @click="cancel()">
          OK
        </b-button>
        <b-button
          v-if="progression.state === 'INPROGRESS'"
          variant="success"
          @click.prevent.capture="go(activity)"
        >
          Reprendre l'activité
        </b-button>
        <b-button
          v-if="progression.state === 'REFUSED'"
          variant="success"
          @click.prevent.capture="go(activity)"
        >
          Réessayer l'activité
        </b-button>
        <b-button
          v-if="['FINISHED', 'EXTRA', 'REVIEWING', 'VALIDATED'].includes(progression.state)"
          variant="warning"
          @click.prevent.capture="go(activity)"
        >
          Relire l'activité
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);
export default {
  name: "ProgressionModal",
  props: ["progression", "activity"],
  methods: {
    go(activity) {
      this.$store.state.activity.progression = this.progression;
      this.$router.push(`/activity/${activity.idParcours}/${activity.id}`);
    },
    getCommentFromState(state) {
      switch (state) {
        case "NOTSTARTED":
          return "Activité non commencée.";
        case "INPROGRESS":
          return "Tu n'as pas encore validé cette activité. Tu peux y retourner pour la terminer.";
        case "FINISHED":
          return "Ton activité est en cours de validation par un chef ou une cheftaine.";
        case "EXTRA":
          return "Ton activité est en cours de validation par un chef ou une cheftaine. " +
            "Comme c'est une activité bonus, elle mettra peut-être plus de temps à être relue !";
        case "REVIEWING":
          return "Ton activité est en cours de validation par un chef ou une cheftaine.";
        case "VALIDATED":
          return "Ton activité a été validée ! Bravo à toi !";
        case "REFUSED":
          return "Ton activité n'a pas été validée mais tu as la possibilité de la refaire !";
        default:
          return "Cette activité est dans un état étrange... Recharge la page pour voir ?";
      }
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
  opacity: 0.5 !important;
}
</style>
