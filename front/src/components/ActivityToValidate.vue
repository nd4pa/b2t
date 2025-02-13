<!-- ActivityComponent
Base Component for an activity page -->

<template>
  <div class="container" role="main">
    <Alert :show="showDismissibleAlert" :text="textAlert"/>
    <ActivityProgressBar :progress="progress"/>
    <div class="row">
      <div id="main-container" class="activity-container col-12">
        <Spinner v-if="!activity.nom"/>
        <h1 class="activity-title" :style="'color:' + changeParcoursColor()">
          {{ activity.nom }}
        </h1>
        <div v-if="pageNumber == 1 && activity.nom" class="details-container">
          <div id="details">
            <div class="card card-body">
              <ul>
                <li>
                  Description:<br/>
                  <i>{{ activity.description }}</i>
                </li>
                <li
                  v-if="
                    activity.materiel &&
                      activity.materiel.length &&
                      activity.materiel[0].length
                  "
                >
                  Matériel:
                  <ul>
                    <li v-for="item in activity.materiel" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </li>
                <li>Durée: {{ activity.duree }} minutes</li>
                <li>Difficulté: {{ activity.difficulte }}</li>
              </ul>
            </div>
          </div>
        </div>
        <ActivityContent :idActivite="idActivite" :idParcours="idParcours"/>
        <div class="end-container">
          <Spinner v-if="!progression.id"/>
          <div class="submit-container">
            <!-- Choisir parmi ces deux rendus en fonction de l'activité -->
            <div
              v-for="entry in pageEntries()"
              :key="entry.position"
              style="text-align: center; width: 100%"
            >
              <h3 style="text-align: left">
                {{ entry.question }}
              </h3>
              <DownloadFile
                v-if="entry.typeRendu === 'file'"
                :fileIds="entry.documents ? entry.documents : undefined"
              />
              <UploadText
                v-if="entry.typeRendu === 'text'"
                :entry="entry"
                :updateEntry="updateEntry"
              />
              <OrderList
                v-if="entry.typeRendu === 'orderList'"
                :entry="entry"
                :updateEntry="updateEntry"
              />
              <Qcm
                v-if="entry.typeRendu === 'qcm'"
                :entry="entry"
                :updateEntry="updateEntry"
              />
            </div>
          </div>
          <div class="container">
            <div class="container-buttons">
              <button
                v-if="pageNumber > 1"
                class="btn btn-success"
                @click="previousPage()"
              >
                Page précédente
              </button>
              <button class="btn btn-success" v-if="hasNext()" @click="nextPage()">
                Page suivante
              </button>
              <button
                class="btn btn-success"
                v-if="!hasNext() && progression.entries && progression.entries.length"
                @click="validate()"
              >
                Réviser l'activité
              </button>
            </div>
            <!-- Modals -->
            <ActivityToValidateModal
              title="Valider l'activité"
              :progression="progression"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Alert from "./includes/Alert";
  import DownloadFile from "./includes/activityComponents/DownloadFile";
  import UploadText from "./includes/activityComponents/UploadText";
  import OrderList from "./includes/activityComponents/OrderList";
  import Qcm from "./includes/activityComponents/Qcm";
  import activityService from "./../service/activity";
  import itineraryHelpers from "./../service/itineraryHelpers";
  import ActivityProgressBar from "./includes/activityComponents/ActivityProgressBar";
  import ActivityContent from "./includes/activityComponents/ActivityContent";

  import $ from "jquery";
  import ProgressionService from "../service/progression.service";
  import Spinner from "./includes/Spinner";
  import ActivityToValidateModal from "./includes/activityComponents/ActivityToValidateModal";

  export default {
    name: "ActivityToValidate",
    components: {
      Spinner,
      DownloadFile,
      UploadText,
      Qcm,
      OrderList,
      Alert,
      ActivityProgressBar,
      ActivityContent,
      ActivityToValidateModal,
    },
    data() {
      return {
        showDismissibleAlert: false, // for Alert
        textAlert: false, // for Alert
        idActivite: NaN,
        idParcours: NaN,
        idProgression: NaN,
        pageNumber: 1, // number of the visible page. 1 at start
        progress: 0,
        activity: {},
        progression: {},
      };
    },
    async created() {
      this.idProgression = this.$route.params.idProgression;
      this.idActivite = this.$route.params.idActivite;
      this.idParcours = this.$route.params.idParcours;

      this.progression = await this.findProgression(this.idProgression);
      if (!this.progression) {
        alert("Impossible de se connecter ou alors tu n'as les droits pour voir cette page !")
        return
      }

      this.progression.state = "REVIEWING";
      this.progression.entries.forEach(
        (_entry) => (_entry.state = this.progression.state)
      );
      let isUpdated = await ProgressionService.updateProgression(
        this.progression,
        "user/progression"
      );
      if (!isUpdated) {
        alert("Progression invalide !")
        this.$router.push("/validation")
        return
      }
      this.idActivite = this.progression.idActivite;
      this.idParcours = this.progression.idParcours;

      this.activity = await activityService.getActivity(
        this.idParcours,
        this.idActivite
      );

      this.showCurrentPages();
    },
    updated() {
      this.showCurrentPages();
    },
    beforeMount() {
      this.showCurrentPages();
    },
    mounted() {
      this.showCurrentPages();
    },
    methods: {
      showCurrentPages() {
        for (let i = 0; i < this.activity.page; i++) {
          if (i + 1 !== this.pageNumber) {
            $(`#page${i + 1}`).hide();
          }
        }
        $(".content-container").removeAttr("hidden");
      },

      async findProgression(progressionId) {
        let progression = await ProgressionService.getUserProgression(
          progressionId
        );
        if (!progression) {
          console.log("failed to retrieve progression");
          return false; // do not create a new progression and raises an error
        }
        return progression;
      },

      // Activity progression
      getProgress() {
        let counter = this.pageNumber;
        let total = this.activity.page;
        if (total === 0) {
          this.progress = 0; // div by 0
          return;
        }
        this.progress = (100 * counter) / total;
      },

      updateEntry(entry) {
        console.warn(
          "Should not appear in this view: updateEntry called for entry: "
        );
        console.log(entry);
      },
      changeParcoursColor() {
        return itineraryHelpers.getItineraryColor(this.activity.idParcours);
      },
      pageEntries() {
        if (!this.progression.entries) {
          return [];
        }
        this.progression.entries.forEach((entry) => {
          entry.state = "REVIEWING";
        });
        return this.progression.entries
          .filter((entry) => entry.page === this.pageNumber)
          .sort((a, b) => a.position - b.position);
      },

      // PAGE CHANGES
      updatePage(pageNumber) {
        if (pageNumber !== this.pageNumber) {
          $(`#page${this.pageNumber}`).hide();
          this.pageNumber = pageNumber;
          $(`#page${this.pageNumber}`).show();
        }
        this.getProgress();
        console.log(`Current page number: ${this.pageNumber}`);
        window.scrollTo(0, 0);
        return true;
      },
      hasNext() {
        return this.pageNumber < this.activity.page;
      },
      // Go to previous/next page or validate
      previousPage() {
        this.updatePage(this.pageNumber - 1);
      },
      nextPage() {
        this.updatePage(this.pageNumber + 1);
      },
      validate() {
        this.updatePage(this.pageNumber);
        // Try to send the updated progression
        if (this.$store.state.auth.user.role === "relecteur") {
          // Validation for reviewer, only if the state is REVIEWING
          if (this.progression.state === "REVIEWING") {
            this.$bvModal.show("activityToValidateModal");
          } else {
            // Otherwise, nothing happens.
            alert("Tu ne peux pas mettre à jour cette activité " +
              "car elle n'est pas en cours de relecture.")
          }
        }
      }
    },
  };
</script>

<style scoped>
  /* Require main.css */

  .activity-container {
    border: dashed;
    border-color: var(--default);
    border-width: thick;
    padding: 0.5rem 0.5rem;
    margin-top: 1rem;
    margin-bottom: 2rem;
    background-color: #fafafa;
    border-radius: 0.3rem;
  }

  .details-container {
    margin: 0.5rem;
    padding: 0.5rem;
  }

  .content-container {
    margin: 1rem;
    padding: 1rem;
  }

  .end-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .submit-container {
    display: flex;
    flex-wrap: wrap;
  }

  h1.activity-title {
    color: var(--default);
  }
</style>
