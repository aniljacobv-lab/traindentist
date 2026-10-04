/**
 * Site settings: the one file to edit for contact details and the chatbot backend.
 */
window.TD_CONFIG = {
  email: "info@traindentist.com",
  location: "Online worldwide · In person in Houston / Katy, TX",

  /* Optional: a Formspree (or similar) endpoint. Empty = the form opens the visitor's email app instead. */
  formEndpoint: "",

  /* Optional: the deployed Dr. Mathew AI worker (see /worker/README.md).
     Empty = Dr. Mathew answers from the built-in guide only (still works on plain GitHub Pages). */
  chatApi: "https://drmathew-chat.aniljacobv.workers.dev",
};
