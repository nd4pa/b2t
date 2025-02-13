export default class ProgressionHelpers {
  static getStateName(state) {
    switch (state) {
      case "NOTSTARTED":
        return "Événement";
      case "INPROGRESS":
        return "En cours";
      case "FINISHED":
        return "En attente de validation";
      case "EXTRA":
        return "Activité bonus"
      case "REVIEWING":
        return "En cours de validation";
      case "VALIDATED":
        return "Validé";
      case "REFUSED":
        return "Refusé";
      default:
        return "État inconnu";
    }
  }

  static timestampToPrettyDate(timestamp) {
    let timestampMs = parseInt(timestamp) * 1000;
    let date = new Date(timestampMs);
    return date.toLocaleString();
  }

  static getTimeDiff(finishedAt, startedAt) {
    let startedAtMs = parseInt(startedAt) * 1000;
    let startedAtDate = new Date(startedAtMs);
    let finishedAtMs;
    let finishedAtDate;
    let prefix = "";
    if (!finishedAt) {
      // Not finished
      finishedAtDate = new Date(Date.now());
      prefix = "Depuis ";
    } else {
      finishedAtMs = parseInt(finishedAt) * 1000;
      finishedAtDate = new Date(finishedAtMs);
    }
    let diff = (finishedAtDate - startedAtDate) / 60000;
    diff = diff.toFixed(0);
    if (isNaN(diff)) {
      return "Durée inconnue";
    } else if (diff < 2) {
      return prefix + diff + " minute";
    }
    return prefix + diff + " minutes";
  }

  static getActivityFromLocalStorage(idParcours, idActivite) {
    if (idActivite == -1) {
      // Particular case of the first progression
      return {
        id: idActivite,
        idParcours: idParcours,
        nom: "Choix initial de parcours",
      };
    }
    try {
      const activities = JSON.parse(localStorage.getItem("activities"));
      return activities[idParcours.toString()][idActivite.toString()];
    } catch (error) {
      console.warn(
        `Activity ${idParcours}/${idActivite} not found in localStorage.`
      );
      return {
        id: idActivite,
        idParcours: idParcours,
        nom: "Activité inconnue",
      }
    }
  }
}

export const VALID_STATES = [
  "NOTSTARTED",
  "INPROGRESS",
  "FINISHED",
  "REVIEWING",
  "VALIDATED",
  "REFUSED",
];
