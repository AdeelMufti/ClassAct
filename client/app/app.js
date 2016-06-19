'use strict';

angular.module('classActApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'cgNotify',
  'pascalprecht.translate',
  'angular-loading-bar',
  'angularMoment',
  'isteven-multi-select',
  'ngFileUpload',
  'blockUI',
  'ui.validate',
  'infinite-scroll',
  'angular-google-analytics'
])

  .value('THROTTLE_MILLISECONDS', 250) //for infinite-scroll

  .constant('CONSTANTS',{
    WEBSITE_NAME: 'ClassAct',
    WEBSITE_TITLE: {
      en: "Classifieds",
      fr: 'Petites annonces',
    },
    WEBSOCKET_PORT: 8000,
    SYSTEM_EMAIL: "system@email.com",
    GOOGLE_ANALYTICS_TRACKING_ID: "xx-xxxxxxxx-x", //Comment this line out if you don't want to use Google Analytics
    AUTO_APPROVE_VERIFIED_USER: true,
    HEADER_IMAGES: [ //Note: these must have the full path in order for grunt build to "minimize" them correctly
      "/assets/images/mali-178.jpg",
      "/assets/images/malian-14.jpg",
      "/assets/images/malian-women.jpg",
      "/assets/images/mali-146.jpg",
      "/assets/images/mali-40.jpg"
    ],

    APP_VERSION: '1.0.0',
    APP_VERSION_DATE: 'Mar 01, 2016', //In the format 'Mon DD, YYYY'
  })

  .constant('translations', {})
  .factory('customTranslationsLoader', function ($http, $q, translations, CONSTANTS) {
    return function (options) {
      var deferred = $q.defer();

      for(var lang in CONSTANTS.WEBSITE_TITLE)
        translations[lang].WEBSITE_TITLE = CONSTANTS.WEBSITE_TITLE[lang];

      if(translations[options.key] === undefined)
        deferred.reject(options.key);
      else
        deferred.resolve(translations[options.key]);

      return deferred.promise;
    }
  })
  .config(['$translateProvider','translations', function ($translateProvider, translations) {
    $translateProvider.useLoader('customTranslationsLoader', {});
    translations['en'] = {
      THIS_LANGUAGE_NAME: "English",
      HELLO: "Hello",
      HOME_PAGE: "Home",
      CLASSIFIEDS: "Classifieds",
      CLASSIFIED: "Classified",
      SIGN_UP: "Sign Up",
      ACCOUNT_NOT_VERIFIED_MESSAGE: "Your account is not verified. You will not receive any classifieds emails until you verify your account.",
      VERIFICATION: "Verification",
      VERIFICATION_COMPLETE: "Verification complete.",
      INVALID_OR_EXPIRED_TOKEN: "The request code is invalid or expired.",
      RESET_PASSWORD_LINK: "Forgot Password? Click here.",
      REQUEST_SUBMITTED: "Request submitted. Please check your email for instructions.",
      EMAIL_NOT_FOUND: "Email not found",
      RESET_PASSWORD_COMPLETE: "Your password has been reset.",
      POST_CLASSIFIED_TITLE: "Post Classified",
      ADMIN_TITLE: "Admin Tools",
      SETTINGS_TITLE: "Settings",
      RESET_PASSWORD: "Reset Password",
      POSTED: "Posted",
      LOCATION: "Location",
      POSTING_RULES: "Posting Rules",
      TITLE_REQUIRED: "A title for your classified is required.",
      TITLE_TOO_LONG: "The title you entered is too long.",
      LOCATION_TOO_LONG: "The location you entered is too long.",
      CONTENT_REQUIRED: "Content for your classified is required.",
      CONTENT_TOO_LONG: "The content you entered is too long.",
      EMAIL_TOO_LONG: "The email you entered is too long.",
      NEW_CLASSIFIED_TITLE: "Classified title",
      NEW_CLASSIFIED_LOCATION: "Classified location",
      NEW_CLASSIFIED_CONTENT: "Classified content",
      YOUR_EMAIL: "Your email address",
      TITLE: "Title",
      CONTENT: "Content",
      SUBMIT: "Submit",
      LOGIN: "Login",
      PASSWORD: "Password",
      LOGIN_FIELDS_REQUIRED: "Please enter your email and password.",
      INVALID_EMAIL: "Please enter a valid email.",
      CONNECT_WITH_FACEBOOK: "Connect with Facebook",
      CONNECT_WITH_GOOGLE_PLUS: "Connect with Google+",
      CONNECT_WITH_TWITTER: "Connect with Twitter",
      EMAIL_REQUIRED: "Email address is required.",
      NEW_PASSWORD: "New password",
      PASSWORD_MIN_LENGTH: "Password must be at least 3 characters.",
      PASSWORD_CHANGED: "Password changed",
      INCORRECT_PASSWORD: "Incorrect password",
      CURRENT_PASSWORD: "Current Password",
      CHANGE_PASSWORD: "Change Password",
      SAVE: "Save",
      REMOVE_YOUR_CLASSIFIEDS: "Delete Your Classifieds",
      REMOVE_USERS: "Delete Users",
      CLASSIFIED_SUBMITTED_POSTED: "Your classified '<b>{{title}}</b>' has been submitted and posted.",
      CLASSIFIED_SUBMITTED_NOT_POSTED: "Your classified '<b>{{title}}</b>' has been submitted. It will be posted when it is approved by an administrator.",
      CLASSIFIED_POST_ERROR: "There was an error submitting your classified. Please contact an administrator for assistance. Message: {{message}}",
      REMOVE_CONFIRMATION_MESSAGE: "Are you sure you want to delete <u>'{{name}}'</u>?",
      CONFIRM_REMOVE: "Confirm Delete",
      REMOVE: "Delete",
      CANCEL: "Cancel",
      LOGOUT: "Logout",
      CLASSIFIED_REMOVED: "Classified '{{title}}' Deleted.",
      CLASSIFIED_REMOVE_ERROR: "There was an error deleting the classified '{{title}}'. {{message}}",
      USER_REMOVED: "User '{{email}}' Removed.",
      USER_REMOVE_ERROR: "There was an error deleting the user. {{message}}",
      REGISTRATION_COMPLETE: "Registration complete. Verification email will be sent.",
      REGISTER_EMAIL_INFO_MSG: "By registering your email, you will periodically receive classifieds that are submitted to {{WEBSITE_NAME}}. You can create an account later.",
      NAME: "Name",
      NAME_REQUIRED: "Name is required",
      OR: "Or",
      REGISTER_EMAIL: "Register Email",
      REGISTER: "Register",
      CATEGORIES: "Categories",
      SELECT_ALL: "Select All",
      SELECT_NONE: "Select None",
      RESET: "Reset",
      SEARCH: "Search",
      NOTHING_SELECTED: "Nothing Selected",
      SELECT_CATEGORIES: "Select Categories",
      CATEGORIES_REQUIRED: "At least one category is required.",
      TRY_AGAIN: "Something went wrong, please try again.",
      SPAM_MESSAGE: "In order to receive emails from {{WEBSITE_NAME}}, please add <b>{{SYSTEM_EMAIL}}</b> to your spam filter allowance list.",
      ALL_SELECTED: "All selected",
      POSTING_RULE_2: "Please do not post anything illegal or inappropriate.",
      REGISTER_ACCOUNT_INFO_MSG: "By signing up, an account will be created for you where you can manage various settings. You will received classifieds by email that are submitted to {{WEBSITE_NAME}}. You can also sign up for a full account if your email is already registered.",
      IMAGES: "Images",
      SELECT_IMAGES: "Select up to 10 images",
      IMAGE_NOT_UPLOADED: 'Image "{{name}}" not uploaded',
      IMAGE_UPLOAD_ERROR_minWidth: "Image too small. It must be at least 50 pixels by 50 pixels.",
      IMAGE_UPLOAD_ERROR_minHeight: "Image too small. It must be at least 50 pixels by 50 pixels.",
      IMAGE_UPLOAD_ERROR_maxSize: "Image file too big. It must be less than 20mb.",
      IMAGE_UPLOAD_ERROR_minSize: "Image file too small. It must be at least 1 kb.",
      IMAGE_UPLOAD_ERROR_maxFiles: "You can attach up to 10 images only.",
      IMAGE_UPLOAD_ERROR_pattern: "This is not an image file.",
      PROCESSING: "Processing",
      FORM_NOT_VALID: "There are problems with the fields above.",
      LOCAL_USER_EXISTS: "An account exists with your email. Please sign in directly. If you don't remember your password, please use the Forgot Password link.",
      FORMATTING_IMAGES: "Formatting images",
      ABOUT_TITLE: "About",
      ABOUT_TITLE_FULL: "About",
      ABOUT_CLASSACT: "Running on ClassAct (v{{APP_VERSION}}, {{APP_VERSION_DATE}}) created by Adeel Mufti",
      ADMINISTRATOR: "Administrator",
      FOUNDER: "Founder",
      CO_FOUNDER_MALE: "Co-Founder",
      CO_FOUNDER_FEMALE: "Co-Founder",
      CONTENT_HAS_HTML: "Your classified content has HTML tags which are not currently supported.",
      NO_CLASSIFIEDS: "You currently have no classifieds.",
      REGENERATE_VERIFICATION_EMAIL: "Regenrate Verification Email",
      VERIFICATION_EMAIL_GENERATED: "Verification email will be generated and sent to your email address.",
      VERIFICATION_EMAIL_GENERATION_ERROR: "There was a problem generating the verification email. Please contact an administrator.",
      LANGUAGE: "Language",
      DEREGISTER: "De-register Account",
      MORE: "More",
      PASSWORD_MAX_LENGTH: "Password must be lass than 50 characters.",
      NAME_TOO_LONG: "The name you entered is too long.",
      REGISTRATION_SERVER_ERROR: "There was an error while submitting your registration. Please contact an administrator for assistance. Message: {{message}}",
      ERROR_PROCESSING_REQUEST: "There was an error processing your request. Please try again or contact an administrator for assistance.",
      USER_IS_NOT_LOCAL: "This account was signed up with a different service (such as Facebook).",
      DEREGISTER_CONFIRMATION: "Are you sure you want to de-register (delete) this account from {{name}}?",
      YES: "Yes",
      NO: "No",
      DEREGISTER_COMPLETE: "Your account has been de-registered.",
      LOGGED_OUT: "You were logged out.",
      RESET_PASSWORD_LINK_SHORT: "Reset Password",
      NOTE: "Note",
      VIEW_CLASSIFIED_TITLE: "View Classified",
      LOADING_CLASSIFIEDS: "Loading Classifieds",
      LOAD_MORE_CLASSIFIEDS: "Load More Classifieds",
      BACK: "Back",
      UNAUTHORIZED_OPERATION: "Unauthorized operation",
      SEARCH_KEYWORDS: "Search keywords",
      NOT_FOUND: "Not Found",
      END_OF_CLASSIFIEDS: "End Of Classifieds",
      CONTACT: "Contact",
      CONTACT_TOO_LONG: "The contact you entered is too long.",
      NEW_CLASSIFIED_CONTACT: "Classified contact (email, phone, etc.)",
      VERIFIED: "Verified",
      APPROVED: "Approved",
      ACCOUNT_NOT_APPROVED_MESSAGE: "Your account is not approved. The classifieds you submit will need to be approved by an administrator.",
      ACCOUNT_APPROVED_MESSAGE: "Your account is approved. The classifieds you submit will be posted immediately.",
      ACCOUNT_VERIFIED_MESSAGE: "Your account is verified. You can receive classifieds emails.",
      POSTING_RULE_1_NOT_LOGGED_IN: "You are not logged in. Your classified will need to be approved by an administrator. Click here to <a href='{{signupUrl}}'>sign up</a> or <a href='{{loginUrl}}'>login.</a>",
      NOT_VERIFIED_WITH_AUTO_APPROVE_ENABLED: "Please verify your account to post classifieds without administrator approval. You can re-generate a verification email from <a href='{{settingsUrl}}'>settings</a>.",
      FLAG: "Flag",
      FLAG_CLASSIFIED_TEXT: "Flag classified as illegal or inappropriate",
      FLAG_CONFIRMATION_MESSAGE: "Are you sure you want to flag <u>'{{title}}'</u>?<br><br><b>Note:</b> Please only flag classifieds that are either 1) illegal, 2) inappropriate, 3) spam, 4) duplicate, 5) overposted.",
      CONFIRM_FLAG: "Confirm Flag As Illegal/Inappropriate",
      CLASSIFIED_FLAGGED: "This classified has been flagged and reported as illegal or inappropriate to the administrators. Thank you for your feedback.",
      CLASSIFIED_ALREADY_FLAGGED: "This classified has already been flagged.",
      FLAGGED: "Flagged",
      EMAIL_SUBSCRIPTIONS: "Email Subscriptions",
      SUBSCRIBE_EMAILS_MESSAGE: "Subscribe to emails containing the latest classifieds posted on {{WEBSITE_NAME}}?",
      SETTINGS_SAVED: "Setting(s) saved.",
      USER: "User",
      MISCELLANEOUS: "Miscellaneous",
      FLAGGED_AND_REMOVED: "Flagged And Removed",
      NOT_FLAGGED_NOT_REMOVED: "Not Flagged / Not Removed",
      CREATED: "Created",
      FLAGGED_BY_USERS: "Flagged By Users",
      IDENTIFIER: "Identifier",
      SUBMITTED_BY_USER: "Submitted By User",
      SUBMITTED_BY_EMAIL: "Submitted By Email",
      IP_ADDRESS_OF_SUBMITTER: "IP Address Of Submitter",
      DETAILS_FOR_ADMIN: "Details For Admin",
      NOT_POSTED: "Not posted",
      SELECT_FILTERS: "Select Filters",
      APPROVED_POSTED: "Approved (Posted)",
      NOT_APPROVED_NOT_POSTED: "Not Approved (Not Posted)",
      FLAGGED_BY_USERS_DETAILS: "Will be removed from posted list after 5 flags",
      FROM_POSTED_LIST: "from posted list",
      CLASSIFIED_UPDATED: "Classified '{{title}}' updated to '{{action}}'.",
      CLASSIFIED_UPDATE_ERROR: "There was an error updating classified '{{title}}'. {{message}}",
      CONFIRM_UPDATE: "Confirm Update",
      UPDATE_CONFIRMATION_MESSAGE: "Are you sure you want to update <u>'{{name}}'</u> to '{{action}}'?",
      PERMANENT_SETTING_MODIFY_ERROR: "Permanent setting cannot be changed",
      EMAIL_ONLY_USER: "Your email is registered but you do not have a full account. Click here to <a href='{{signupUrl}}'>sign up</a>.",
      LOAD_MORE_USERS: "Load More Users",
      LOADING_USERS: "Loading Users",
      END_OF_USERS: "End Of Users",
      ADMIN_CLASSIFIEDS_SEARCH_MESSAGE: "Search supported for: classified identifier, user identifier, submitter's email, classified title, IP address",
      NOT_APPROVED: "Not Approved",
      NOT_VERIFIED: "Not Verified",
      ADMINISTRATORS: "Administrators",
      REGULAR_USERS: "Regular Users",
      EMAIL_ONLY_USERS: "Email Only Users",
      EMAIL_SUBSCRIBED: "Subscribed To Emails",
      NOT_EMAIL_SUBSCRIBED: "Not Subscribed To Emails",
      LOCALLY_REGISTERED_USERS: "Locally Registered Users",
      FACEBOOK_REGISTERED_USERS: "Facebook Registered Users",
      PERMANENT_USERS: "Permanent Users",
      PERMANENT_USER: "Permanent User",
      ADMIN_USERS_SEARCH_MESSAGE: "Search supported for: user identifier, user name, user email",
      ROLE: "Role",
      AUTHENTICATION_PROVIDER: "Authentication Provider",
      INCLUDE_ANY: "Include Any",
      INCLUDE_ALL: "Include All",
      USER_UPDATED: "User '{{email}}' updated to '{{action}}'.",
      USER_UPDATE_ERROR: "There was an error updating user '{{email}}'. {{message}}",
      SELECTED: "Selected",
      LAST_SENT_IN_DIGEST: "Last Sent In Digest",
      NEVER: "Never",
      DIGEST_EMAIL_TOOL_MESSAGE: "Use this page to send a digest of the latest classifieds to all users. Only users that are verified and subscribed to emails will receive the classifieds. The classified will be sent to the user in the language they signed up with. You can enter a custom message below (optional) which will be included at the top of the email digest.",
      DEFAULT_DIGEST_EMAIL_SUBJECT: "Latest Classifieds On {{WEBSITE_NAME}}, As Of {{date}}",
      SUBJECT: "Subject",
      CUSTOM_MESSAGE: "Custom Message (Optional)",
      POSTING_RULE_REQUIRED_FIELDS: "<font color='red'>*</font> signifies required fields",
      EMAIL_DIGEST: "Email Digest",
      CREATED_IP_ADDRESS: "Created IP address",
      EMAIL_DIGEST_SENT: "Email digest sent by <b>{{user}}</b> at <b>{{date}}</b>. It contained <b>{{selectedCount}}</b> classifieds.",
      EMAIL_DIGEST_SEND_ERROR: "There was an error sending the email digest. {{message}}",
      EMAIL_DIGEST_SEND_ERROR_WITH_USER: "<b>{{user}}</b> sent an email digest at <b>{{date}}</b>. There was an error. <b>{{message}}</b>",
      SENDING_EMAIL_DIGEST: "Sending Email Digest",
      PLEASE_CONFIRM: "Please Confirm",
      EMAIL_DIGEST_SEND_CONFIRM: "Are you sure you want to send the email digest with the {{selectedCount}} selected classifieds?",
      SELECT_ALL_NEVER_SENT: "Select All Never Sent",
      SELECT_ALL_MESSAGE: "Note: only the loaded items will be selected. Please scroll to the bottom to load more.",
      SEND: "Send",
      ACTION_ON_ALL_SELECTED: "Action On All Selected",
      ALL_ITEMS_NOT_APPLICABLE: "All of the selected items are not applicable for, or are already set to '{{action}}'.",
      MULTIPLE_UPDATE_APPLICABLE_ITEMS_MESSAGE: "Of the {{selectedCount}} items selected, only {{applicableCount}} items are applicable and not already set to '{{action}}'.",
      MULTIPLE_UPDATE_CONFIRM: "Are you sure you want to update the {{applicableCount}} applicable selected items to '{{action}}'?",
      MULTIPLE_ITEMS_UPDATED: "{{applicableCount}} items were updated to '{{action}}'.",
      MULTIPLE_ITEMS_UPDATE_ERROR: "There was an error updating the selected items. {{message}}",
      MULTIPLE_REMOVE_CONFIRM: "Are you sure you want to delete the {{selectedCount}} selected items?",
      MULTIPLE_ITEMS_REMOVED: "{{selectedCount}} items were removed.",
      MULTIPLE_ITEMS_REMOVE_ERROR: "There was an error deleting the selected items. {{message}}",
      NOT_ADMINISTRATOR: "Not Administrator (Regular User)",
      SET_TO: "Set To",
      PERMANENT_ACCOUNT_MODIFY_ERROR: "Permanent accounts cannot be modified.",
      POST_CLASSIFIED_CONTACT_MESSAGE: "<b>Note:</b> If you would like to be contacted through email, please enter it in the contact box, or in the classified content. Otherwise your email will not be displayed.",
      POSTING_RULE_3: "Please do not: Post the same classified (duplicate) more than once within a week's period (7 days) / Post more than 5 classifieds per day / Post anything that could be considered spam or overposting.",
      LOADED_ITEMS_THAT_MATCH_FILTERS_SEARCH: "Loaded items that match current filter and search criteria",
      CLICK_HERE_LOAD_ALL: "Click here to load all.",
      EXPORT_EMAILS: "Export Emails",
      COPY_EXPORTED_EMAILS_MESSAGE: "Email addresses exported. You may copy them from below",
      EMAIL_DIGEST_TRIGGERED: "Email digest will be sent.",
      POSTED_OVER_30_DAYS_AGO: "Posted Over 30 Days Ago",
      POSTED_OVER_60_DAYS_AGO: "Posted Over 60 Days Ago",
      POSTED_OVER_90_DAYS_AGO: "Posted Over 90 Days Ago",
      POSTED_OVER_180_DAYS_AGO: "Posted Over 180 Days Ago",
      SITE_UTILIZATION_TITLE: "Site Utilization",
      GATEWAY_TIMEOUT_DURING_CLASSIFIED_POST: "<b>Note:</b> There was an error submitting your classified. It took too long for the server to respond. Your classified may or may not have been posted. Please check by visiting <a href='http://{{hostname}}'>http://{{hostname}}</a> to see if it posted. If not, please try posting it again.",
    };
    translations['fr'] = {
      THIS_LANGUAGE_NAME: "Français",
      HELLO: "Bonjour",
      HOME_PAGE: "Page d'accueil",
      CLASSIFIEDS: "Annonces",
      CLASSIFIED: "Annonce",
      SIGN_UP: "S'inscrire",
      ACCOUNT_NOT_VERIFIED_MESSAGE: "Votre compte est non vérifié. Vous ne recevrez aucune Annonces emails jusqu'à ce que vous vérifiez votre compte.",
      VERIFICATION: "Vérification",
      VERIFICATION_COMPLETE: "La vérification est complète.",
      INVALID_OR_EXPIRED_TOKEN: "Le code de demande est invalide ou expiré.",
      RESET_PASSWORD_LINK: "Mot de passe oublié? Cliquez ici.",
      REQUEST_SUBMITTED: "Demande présentée. Merci de vérifier votre e-mail pour les instructions.",
      EMAIL_NOT_FOUND: "Mail non trouvé",
      RESET_PASSWORD_COMPLETE: "Votre mot de passe a été réinitialisé.",
      POST_CLASSIFIED_TITLE: "Publier Une Annonce",
      ADMIN_TITLE: "Outils D'Admin",
      SETTINGS_TITLE: "Paramètres",
      RESET_PASSWORD: "Réinitialiser le mot de passe",
      POSTED: "Publié",
      LOCATION: "Lieu",
      POSTING_RULES: "Règles de publication",
      TITLE_REQUIRED: "Un titre pour votre annonce est nécessaire.",
      TITLE_TOO_LONG: "Le titre que vous avez choisi est trop long.",
      LOCATION_TOO_LONG: "Le lieu que vous avez choisi est trop long.",
      CONTENT_REQUIRED: "Un contenu pour votre annonce est nécessaire.",
      CONTENT_TOO_LONG: "Le contenu que vous avez choisi est trop long.",
      EMAIL_TOO_LONG: "L'email que vous avez choisi est trop long.",
      NEW_CLASSIFIED_TITLE: "Titre de l'annonce",
      NEW_CLASSIFIED_LOCATION: "Lieu de l'annonce",
      NEW_CLASSIFIED_CONTENT: "Contenu de l'annonce",
      YOUR_EMAIL: "Votre adresse email",
      TITLE: "Titre",
      CONTENT: "Contenu",
      SUBMIT: "Envoyer",
      LOGIN: "S'identifier",
      PASSWORD: "Mot de passe",
      LOGIN_FIELDS_REQUIRED: "Prière S'il vous plaît entrer votre email et mot de passe.",
      INVALID_EMAIL: "Veuillez fournir une adresse email valide.",
      CONNECT_WITH_FACEBOOK: "Se connecter avec Facebook",
      CONNECT_WITH_GOOGLE_PLUS: "Se connecter avec Google+",
      CONNECT_WITH_TWITTER: "Se connecter avec Twitter",
      EMAIL_REQUIRED: "Une adresse email est nécessaire.",
      NEW_PASSWORD: "Nouveau Mot De Passe",
      PASSWORD_MIN_LENGTH: "Mot de passe doit être d'au moins 3 caractères.",
      PASSWORD_CHANGED: "Mot de passe changé",
      INCORRECT_PASSWORD: "Mot de passe incorrect",
      CURRENT_PASSWORD: "Mot De Passe Actuel",
      CHANGE_PASSWORD: "Changer Le Mot De Passe",
      SAVE: "Sauvegarder",
      REMOVE_YOUR_CLASSIFIEDS: "Supprimer Vos Annonces",
      REMOVE_USERS: "Supprimer Utilisateurs",
      CLASSIFIED_SUBMITTED_POSTED: "Votre annonce '<b>{{title}}</b>' a été soumise et publiée",
      CLASSIFIED_SUBMITTED_NOT_POSTED: "Votre annonce '<b>{{title}}</b>' a été soumise. Elle sera affichée quand elle est approuvée par un administrateur.",
      CLASSIFIED_POST_ERROR: "Il y a une erreur dans la publication de votre annonce. Prière de contactez un administrateur pour de l'aide. Le message: {{message}}",
      REMOVE_CONFIRMATION_MESSAGE: "Veuillez confirmer que vous voulez supprimer <u>'{{name}}'</u>?",
      CONFIRM_REMOVE: "Supprimer?",
      REMOVE: "Supprimer",
      CANCEL: "Annuler",
      LOGOUT: "Se Déconnecter",
      CLASSIFIED_REMOVED: "Annonce '{{title}}' Supprimée.",
      CLASSIFIED_REMOVE_ERROR: "Il y a une erreur dans la suppression de l'annonce '{{title}}'. {{message}}",
      USER_REMOVED: "Utilisateur Supprimé.",
      USER_REMOVE_ERROR: "Il y a une erreur dans la suppression de l'utilisateur. {{message}}",
      REGISTRATION_COMPLETE: "Enregistrement complet. Un email de vérification vous sera envoyé.",
      REGISTER_EMAIL_INFO_MSG: "En enregistrant votre email, vous recevrez périodiquement les annonces qui sont soumis à {{WEBSITE_NAME}}. Vous pourrez créer un compte plus tard.",
      NAME: "Nom",
      NAME_REQUIRED: "Un nom est nécessaire",
      OR: "Ou",
      REGISTER_EMAIL: "Enregistrer Son Email",
      REGISTER: "Enregistrer",
      CATEGORIES: "Catégories",
      SELECT_ALL: "Sélectionner Tout",
      SELECT_NONE: "Sélectionner Aucun",
      RESET: "Réinitialiser",
      SEARCH: "Recherche",
      NOTHING_SELECTED: "Rien Sélectionné",
      SELECT_CATEGORIES: "Choisir Des Catégories",
      CATEGORIES_REQUIRED: "Choisir au moins une catégorie.",
      TRY_AGAIN: "Une erreur s'est produite. Veuillez réessayer.",
      SPAM_MESSAGE: "Afin de recevoir les emails de {{WEBSITE_NAME}}, merci d'ajouter <b>{{SYSTEM_EMAIL}}</b> à votre filtre de pourriels (spams).",
      ALL_SELECTED: "Toutes sélectionnées",
      POSTING_RULE_2: "Merci de ne pas publier d'annonces illégales ou inappropriées.",
      REGISTER_ACCOUNT_INFO_MSG: "En vous inscrivant, un compte sera créé où vous pourrez gérer vos préférences. Vous recevrez par email les dernières annonces postées sur {{WEBSITE_NAME}}. Vous pouvez également passer à compte complet si votre email est déjà enregistré.",
      IMAGES: "Images",
      SELECT_IMAGES: "Sélectionnez jusqu'à 10 images",
      IMAGE_NOT_UPLOADED: 'Image "{{name}}" non téléchargée',
      IMAGE_UPLOAD_ERROR_minWidth: "Image trop petite. Taille minimum de 50 pixels par 50 pixels.",
      IMAGE_UPLOAD_ERROR_minHeight: "Image trop petite. Taille minimum de 50 pixels par 50 pixels.",
      IMAGE_UPLOAD_ERROR_maxSize: "Fichier image trop grand. Il doit être inférieure à 20 Mo.",
      IMAGE_UPLOAD_ERROR_minSize: "Fichier image trop petit. Il doit faire au moins 1 kb.",
      IMAGE_UPLOAD_ERROR_maxFiles: "Vous pouvez joindre jusqu'à 10 images maximum.",
      IMAGE_UPLOAD_ERROR_pattern: "Cela n'est pas un fichier image.",
      PROCESSING: "En cours de traitement",
      FORM_NOT_VALID: "Il ya des problèmes avec les champs ci-dessus.",
      LOCAL_USER_EXISTS: "Un compte existe avec cet email. Veuillez vous connecter directement avec ce compte. Si vous ne vous souvenez pas de votre mot de passe, utilisez le lien Mot De Passe Oublié.",
      FORMATTING_IMAGES: "Images en cours de formatage",
      ABOUT_TITLE: "A Propos",
      ABOUT_TITLE_FULL: "A Propos De",
      ABOUT_CLASSACT: "Fonctionnant sur Class Act (v{{APP_VERSION}}, {{APP_VERSION_DATE}}) créée par Adeel Mufti",
      ADMINISTRATOR: "Administrateur",
      FOUNDER: "Fondateur",
      CO_FOUNDER_MALE: "Co-fondateur",
      CO_FOUNDER_FEMALE: "Co-fondatrice",
      CONTENT_HAS_HTML: "Le contenu de votre annonce possède des balises HTML qui ne sont pas prises en charge actuellement.",
      NO_CLASSIFIEDS: "Vous n'avez actuellement pas d'annonces.",
      REGENERATE_VERIFICATION_EMAIL: "Générer une Vérification Email",
      VERIFICATION_EMAIL_GENERATED: "un email de vérification sera généré et envoyé à votre adresse email.",
      VERIFICATION_EMAIL_GENERATION_ERROR: "Il y a eu un problème pour générer l'email de vérification. Contactez s'il vous plaît un administrateur pour de l'aide.",
      LANGUAGE: "La Langue",
      DEREGISTER: "Supprimer le Compte",
      MORE: "Plus",
      PASSWORD_MAX_LENGTH: "le mot de passe doit être inférieur à 50 caractères.",
      NAME_TOO_LONG: "Le nom que vous avez entré est trop long.",
      REGISTRATION_SERVER_ERROR: "Il y a eu une problème lors de votre inscription. Contactez s'il vous plaît un administrateur. Message: {{message}}",
      ERROR_PROCESSING_REQUEST: "Il y a eu une erreur lors du traitement de votre demande. Essayez de nouveau ou contactez un administrateur pour de l'aide.",
      USER_IS_NOT_LOCAL: "Ce compte utilise un mode de connexion différent (comme Facebook).",
      DEREGISTER_CONFIRMATION: "Êtes-vous sûr que vous voulez supprimer le compte de {{name}}?",
      YES: "Oui",
      NO: "Non",
      DEREGISTER_COMPLETE: "Votre compte a été supprimé.",
      LOGGED_OUT: "Vous avez été déconnecté.",
      RESET_PASSWORD_LINK_SHORT: "Réinitialiser Mot De Passe",
      NOTE: "Note",
      VIEW_CLASSIFIED_TITLE: "Voir Annonce",
      LOADING_CLASSIFIEDS: "Annonces en Cours de chargement",
      LOAD_MORE_CLASSIFIEDS: "Afficher d'avantage d'annonces",
      BACK: "Retour",
      UNAUTHORIZED_OPERATION: "Action non autorisée",
      SEARCH_KEYWORDS: "Rechercher les mots clés",
      NOT_FOUND: "Pas Trouvé",
      END_OF_CLASSIFIEDS: "Fin Des Annonces",
      CONTACT: "Contact",
      CONTACT_TOO_LONG: "Le contact que vous avez entré est trop long.",
      NEW_CLASSIFIED_CONTACT: "Contact de l'annonce (email, téléphone, etc.)",
      VERIFIED: "Vérifié",
      APPROVED: "Approuvé",
      ACCOUNT_NOT_APPROVED_MESSAGE: "Votre compte n'est pas validé. Les annonces que vous soumettez devront être approuvées par un administrateur.",
      ACCOUNT_APPROVED_MESSAGE: "Votre compte est validé. Les annonces que vous soumettez seront publiées immédiatement.",
      ACCOUNT_VERIFIED_MESSAGE: "Votre compte est vérifié. Vous pouvez recevoir les abonnements par e-mail.",
      POSTING_RULE_1_NOT_LOGGED_IN: "Vous n'êtes pas connecté. Votre annonce devra être approuvée par un administrateur. Cliquez ici pour <a href='{{signupUrl}}'>vous inscrire</a> ou <a href='{{loginUrl}}'>vous identifier</a>.",
      NOT_VERIFIED_WITH_AUTO_APPROVE_ENABLED: "Veuillez vérifier votre compte pour que vos annonces soient automatiquement approuvées par l'administrateur. Vous pouvez re-générer un message de vérification des <a href='{{settingsUrl}}'>paramètres</a>.",
      FLAG: "Marquer",
      FLAG_CLASSIFIED_TEXT: "Marquer comme illégal ou inapproprié",
      FLAG_CONFIRMATION_MESSAGE: "Êtes-vous sûr que vous voulez marquer <u>'{{title}}'</u>?<br><br><b>Note:</b> Veuillez signaler d'un drapeau uniquement les annonces qui sont soit 1) illégales 2) inappropriées 3) du spam 4) un doublon 5) parues trop souvent.",
      CONFIRM_FLAG: "Confirmez marquer comme illégal ou inapproprié",
      CLASSIFIED_FLAGGED: "Cette annonce a été signalée comme illégale ou inappropriée aux administrateurs. Merci pour votre retour.",
      CLASSIFIED_ALREADY_FLAGGED: "Cette petite annonce a déjà été marquée.",
      FLAGGED: "Marqué",
      EMAIL_SUBSCRIPTIONS: "Abonnements par email",
      SUBSCRIBE_EMAILS_MESSAGE: "Abonnez-vous aux emails contenant les dernières annonces publiées sur {{WEBSITE_NAME}}?",
      SETTINGS_SAVED: "Paramètres sauvegardés.",
      USER: "Utilisateur",
      MISCELLANEOUS: "Divers",
      FLAGGED_AND_REMOVED: "Marqué et Retiré",
      NOT_FLAGGED_NOT_REMOVED: "Non Marqué / Non Retiré",
      CREATED: "Créé",
      FLAGGED_BY_USERS: "Marqué Par Les Utilisateurs",
      IDENTIFIER: "Identifiant",
      SUBMITTED_BY_USER: "Soumis Par un Utilisateur",
      SUBMITTED_BY_EMAIL: "Soumis Par Email",
      IP_ADDRESS_OF_SUBMITTER: "Adresse IP de l'utilisateur",
      DETAILS_FOR_ADMIN: "Détails Pour l'Administrateur",
      NOT_POSTED: "Non publié",
      SELECT_FILTERS: "Sélectionner Les Filtres",
      APPROVED_POSTED: "Approuvé (Publié)",
      NOT_APPROVED_NOT_POSTED: "Non Approuvé (Non Publié)",
      FLAGGED_BY_USERS_DETAILS: "Sera retiré de la liste d'utilisateurs approuvés après 5 signalements",
      FROM_POSTED_LIST: "de la liste des annonces publiées",
      CLASSIFIED_UPDATED: "Annonce '{{title}}' réactualisée en '{{action}}'.",
      CLASSIFIED_UPDATE_ERROR: "Il y eu une erreur lors réactualisation de l'annonce '{{title}}'. {{message}}",
      CONFIRM_UPDATE: "Confirmer la réactualisation",
      UPDATE_CONFIRMATION_MESSAGE: "Veuillez confirmer que vous voulez réactualiser <u>'{{name}}'</u> en '{{action}}'?",
      PERMANENT_SETTING_MODIFY_ERROR: "Paramètre non modifiable",
      EMAIL_ONLY_USER: "Votre e-mail est enregistré, mais vous ne disposez pas d'un compte actif. Cliquez ici pour votre <a href='{{signupUrl}}'>inscription</a>.",
      LOAD_MORE_USERS: "Charger plus d'utilisateurs",
      LOADING_USERS: "Chargement des Utilisateurs",
      END_OF_USERS: "Fin de la liste des Utilisateurs",
      ADMIN_CLASSIFIEDS_SEARCH_MESSAGE: "Recherche possible : identifiant classé, identifiant de l'utilisateur, courriel du demandeur, nom de l'entreprise, adresse IP",
      NOT_APPROVED: "Non Approuvé",
      NOT_VERIFIED: "Non Vérifié",
      ADMINISTRATORS: "Administrateurs",
      REGULAR_USERS: "Utilisateurs normaux",
      EMAIL_ONLY_USERS: "Utilisateurs email seul",
      EMAIL_SUBSCRIBED: "Abonné aux Emails",
      NOT_EMAIL_SUBSCRIBED: "Non abonné aux Emails",
      LOCALLY_REGISTERED_USERS: "Utilisateurs Enregistrés Localement",
      FACEBOOK_REGISTERED_USERS: "Utilisateurs Enregistrés via Facebook",
      PERMANENT_USERS: "Utilisateurs Permanents",
      PERMANENT_USER: "Utilisateur Permanent",
      ADMIN_USERS_SEARCH_MESSAGE: "Recherche possible: identifiant de l'utilisateur, nom d'utilisateur, email de l'utilisateur",
      ROLE: "Rôle",
      AUTHENTICATION_PROVIDER: "Fournisseur d'Authentification",
      INCLUDE_ANY: "Inclure aucune",
      INCLUDE_ALL: "Inclure toutes",
      USER_UPDATED: "Utilisateur '{{email}}' mis à jour vers '{{action}}'.",
      USER_UPDATE_ERROR: "Il y eu une erreur dans la mise à jour de l'utilisateur '{{email}}'. {{message}}",
      SELECTED: "Sélectionné",
      LAST_SENT_IN_DIGEST: "Derniers Envois du récapitulatif",
      NEVER: "Jamais",
      DIGEST_EMAIL_TOOL_MESSAGE: "Utilisez cette page pour envoyer un récapitulatif des dernières annonces à tous les utilisateurs. Seuls les utilisateurs vérifiés et abonnés aux e-mails recevront le récapitulatif qui sera envoyée à l'utilisateur dans la langue qu'ils a défini dans son compte. Vous pouvez entrer un message personnalisé ci-dessous (en option) qui sera inclus dans la partie supérieure de l'email récapitulatif.",
      DEFAULT_DIGEST_EMAIL_SUBJECT: "Dernières Petites Annonces Sur {{WEBSITE_NAME}}, au {{date}}",
      SUBJECT: "Objet",
      CUSTOM_MESSAGE: "Message Personnalisé (Optionnel)",
      POSTING_RULE_REQUIRED_FIELDS: "<font color='red'>*</font> Champ obligatoire",
      EMAIL_DIGEST: "Email récapitulatif",
      CREATED_IP_ADDRESS: "Adresse IP créée",
      EMAIL_DIGEST_SENT: "Email récapitulatif envoyé par <b>{{user}}</b> à <b>{{date}}</b>. Il contient <b>{{selectedCount}}</b> annonces.",
      EMAIL_DIGEST_SEND_ERROR: "Erreur lors de l'envoi de l'email récapitulatif. {{message}}",
      EMAIL_DIGEST_SEND_ERROR_WITH_USER: "<b>{{user}}</b> a envoyé un email récapitulatif à <b>{{date}}</b>. Il y a une erreure. <b>{{message}}</b>",
      SENDING_EMAIL_DIGEST: "Envoi de l'email récapitulatif",
      PLEASE_CONFIRM: "Veuillez confirmer",
      EMAIL_DIGEST_SEND_CONFIRM: "Etes-vous sûr que vous voulez envoyer l'email récapitulatif avec les {{selectedCount}} annonces sélectionnées?",
      SELECT_ALL_NEVER_SENT: "Sélectionner toutes les annonces jamais envoyées",
      SELECT_ALL_MESSAGE: "Remarque: seuls les éléments affichés seront sélectionnés. Faites défiler vers le bas pour en afficher plus.",
      SEND: "Envoyer",
      ACTION_ON_ALL_SELECTED: "Action Sur Tous Les éléments Sélectionnés",
      ALL_ITEMS_NOT_APPLICABLE: "Tous les éléments sélectionnés ne peuvent pas être traités, ou ont déjà été traités en '{{action}}'.",
      MULTIPLE_UPDATE_APPLICABLE_ITEMS_MESSAGE: "Sur les {{selectedCount}} éléments sélectionnés, seulement {{applicableCount}} éléments peuvent être traités et n'ont pas encore été traités en '{{action}}'.",
      MULTIPLE_UPDATE_CONFIRM: "Etes-vous sûr que vous voulez mettre à jour les {{applicableCount}} éléments sélectionnés vers '{{action}}'?",
      MULTIPLE_ITEMS_UPDATED: "{{applicableCount}} éléments ont été mis à jour vers'{{action}}'.",
      MULTIPLE_ITEMS_UPDATE_ERROR: "Une erreur s'est produite lors de la mise à jour des éléments sélectionnés. {{message}}",
      MULTIPLE_REMOVE_CONFIRM: "Etes-vous sûr de vouloir supprimer les {{selectedCount}} éléments sélectionnés?",
      MULTIPLE_ITEMS_REMOVED: "{{selectedCount}} éléments ont été supprimés.",
      MULTIPLE_ITEMS_REMOVE_ERROR: "Une erreur s'est produite lors de la suppression des éléments sélectionnés. {{message}}",
      NOT_ADMINISTRATOR: "Non Administrateur (Utilisateur standard)",
      SET_TO: "Réglé sur",
      PERMANENT_ACCOUNT_MODIFY_ERROR: "Les comptes permanents ne peuvent pas être modifiés.",
      POST_CLASSIFIED_CONTACT_MESSAGE: "<b>Note:</b> si vous voulez être contacté par e-mail, merci d’entrer votre e-mail dans la case Contact ou dans le Contenu de l’annonce. Sinon votre e-mail ne sera pas visible.",
      POSTING_RULE_3: "Merci de ne pas : Poster la même annonce (doublon) sur une période d'une semaine (7 jours) / Poster plus de 5 annonces par jour / Poster des annonces pouvant être considérées comme du spam ou trop répétitives.",
      LOADED_ITEMS_THAT_MATCH_FILTERS_SEARCH: "Eléments chargés qui correspondent au filtre et les mots clés actuels",
      CLICK_HERE_LOAD_ALL: "Veuillez cliquer ici pour télécharger tous.",
      EXPORT_EMAILS: "Exporter Les Emails",
      COPY_EXPORTED_EMAILS_MESSAGE: "Les adresses emails sont exportées. Vous pouvez les copier de la liste ci-dessous",
      EMAIL_DIGEST_TRIGGERED: "L'email récapitulatif sera envoyé.",
      POSTED_OVER_30_DAYS_AGO: "Publié il y a plus de 30 jours",
      POSTED_OVER_60_DAYS_AGO: "Publié il y a plus de 60 jours",
      POSTED_OVER_90_DAYS_AGO: "Publié il y a plus de 90 jours",
      POSTED_OVER_180_DAYS_AGO: "Publié il y a plus de 180 jours",
      SITE_UTILIZATION_TITLE: "Utilisation Du Site",
      GATEWAY_TIMEOUT_DURING_CLASSIFIED_POST: "<b>Note:</b> Il y a une erreur dans la publication de votre annonce. Le temps de réponse du serveur est dépassé. Votre annonce a pu être postée ou non. Merci de vérifier en vous rendant sur <a href='http://{{hostname}}'>http://{{hostname}}</a> pour vérifier si elle a été publié. Si votre annonce n’apparaît pas, merci de réessayer.",
    };

    var $cookies;
    angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
      $cookies = _$cookies_;
      if($cookies.get('language')==null || $cookies.get('language')=='')
      {
        $translateProvider
          .uniformLanguageTag('bcp47')
          .registerAvailableLanguageKeys(
            ['en','fr'],
            {
              'en*': 'en',
              'fr*': 'fr'
            })
          .determinePreferredLanguage()
          .fallbackLanguage('en');
      }
      else
        $translateProvider.preferredLanguage($cookies.get('language'));
    }]);

    $translateProvider.useSanitizeValueStrategy('escapeParameters');
  }])

  .config(function (AnalyticsProvider, CONSTANTS) {
    if(CONSTANTS.GOOGLE_ANALYTICS_TRACKING_ID) {
      AnalyticsProvider.setAccount(CONSTANTS.GOOGLE_ANALYTICS_TRACKING_ID);
      AnalyticsProvider.setPageEvent('$stateChangeSuccess');
      AnalyticsProvider.ignoreFirstPageLoad(true);
    }
  })

  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .config(function(blockUIConfig) {
    blockUIConfig.autoBlock = false;
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookies, $injector) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookies.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {

          $rootScope.$broadcast('logout', {
            forceLogout: true,
            newPath: '/login',
            callback: function(userWasLoggedIn) {
              if(userWasLoggedIn) {
                var notify = $injector.get('notify');
                var $translate = $injector.get('$translate')
                notify.closeAll();
                notify.config({
                  startTop: 75,
                  duration: 0,
                  position: 'center'
                });
                notify({
                  message: $translate.instant('UNAUTHORIZED_OPERATION') + '. '+$translate.instant('LOGGED_OUT')
                });
              }
            }
          });

          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .directive('emailSpamMessage', function() {
    return {
      template: '<p class="small text-muted" style="margin-top:10px;"><span class="label label-danger">{{"NOTE" | translate | uppercase}}</span> <span ng-bind-html="\'SPAM_MESSAGE\' | translate:{WEBSITE_NAME:CONSTANTS.WEBSITE_NAME,SYSTEM_EMAIL:CONSTANTS.SYSTEM_EMAIL}"></span></p>'
    }
  })

  .run(function ($rootScope, $location, Auth, amMoment, CONSTANTS, $translate, Misc, $timeout, Analytics) {
    $rootScope.$on('$stateChangeSuccess', function (event, current, currentParams, from, fromParams) {
      Misc.setPageTitle(current);
      $rootScope.previousState = from;
    });

    var $cookies;
    angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
      $cookies = _$cookies_;
      if($cookies.get('language')==null || $cookies.get('language')=='')
        amMoment.changeLocale('en');
      else
        amMoment.changeLocale($cookies.get('language'));
    }]);

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $timeout(function () {
            $location.path("/login");
          });
        }
      });
    });
  });
