'use strict';

var CONSTANTS = require("./constants");

var translations =
{
  en: {
    VERIFICATION_EMAIL_SUBJECT: CONSTANTS.WEBSITE_NAME + " sign up verification",
    VERIFICATION_EMAIL_TEXT: "You are receiving this email because you or someone else has signed up with this email address on " + CONSTANTS.WEBSITE_NAME + ".\n" +
    "\n" +
    "Please click on the following link, or paste this into your browser to complete the process:\n" +
    "\n" +
    "%s\n" +
    "\n" +
    "If you did not request this, please ignore this email.\n",
    RESET_PASSWORD_EMAIL_SUBJECT: CONSTANTS.WEBSITE_NAME + " password reset",
    RESET_PASSWORD_EMAIL_TEXT: "You are receiving this email because you or someone else has requested to reset the password for this account on " + CONSTANTS.WEBSITE_NAME + ".\n" +
    "\n" +
    "Please click on the following link, or paste this into your browser to complete the process:\n" +
    "\n" +
    "%s\n" +
    "\n" +
    "If you did not request this, please ignore this email.\n",
    EMAIL_OR_USER_REQUIRED: "An email or a user is required to post a classified.",
    EMAIL_REQUIRED: "Email Required",
    TITLE_REQUIRED: "A title for your classified is required.",
    TITLE_TOO_LONG: "The title you entered is too long.",
    LOCATION_TOO_LONG: "The location you entered is too long.",
    CONTENT_REQUIRED: "Content for your classified is required.",
    CONTENT_TOO_LONG: "The content you entered is too long.",
    EMAIL_TOO_LONG: "The email you entered is too long.",
    SUCCESS: "Success",
    UNAUTHORIZED: "Unauthorized",
    NOT_FOUND: "Not Found",
    INVALID_PASSWORD: "Invalid Password",
    VERIFICATION_TOKEN_REQUIRED: "Verification Token Required",
    MISSING_OR_INVALID_DATA: "Missing Or Invalid Data",
    EMAIL_ALREADY_IN_USE: "The specified email address is already in use.",
    PASSWORD_MIN_LENGTH: "Password must be at least 3 characters.",
    TRY_AGAIN: "Something went wrong, please try again.",
    EMAIL_NOT_REGISTERED: "This email is not registered.",
    CATEGORIES_REQUIRED: "At least one category is required.",
    CATEGORIES_INVALID: "Submitted categories are invalid.",
    NAME_REQUIRED: "Name is required",
    INVALID_EMAIL: "Please enter a valid email.",
    NOT_AN_IMAGE: "File is not an image.",
    IMAGE_UPLOAD_ERROR_minWidth: "Image too small. It must be at least 50 pixels by 50 pixels.",
    IMAGE_UPLOAD_ERROR_minHeight: "Image too small. It must be at least 50 pixels by 50 pixels.",
    IMAGE_UPLOAD_ERROR_maxSize: "Image file too big. It must be less than 20mb.",
    IMAGE_UPLOAD_ERROR_minSize: "Image file too small. It must be at least 1 kb.",
    IMAGE_UPLOAD_ERROR_maxFiles: "You can attach up to 10 images only.",
    UNABLE_TO_PROCESS_IMAGE: "Unable to process image. Please contact an administrator.",
    CONTENT_HAS_HTML: "Your classified content has HTML tags which are not currently supported.",
    PASSWORD_MAX_LENGTH: "Password must be lass than 50 characters.",
    NAME_TOO_LONG: "The name you entered is too long.",
    DEREGISTER_EMAIL_SUBJECT: CONSTANTS.WEBSITE_NAME + " account de-registration",
    DEREGISTER_EMAIL_TEXT: "You are receiving this email because you or someone else has requested to de-register (delete) this account on " + CONSTANTS.WEBSITE_NAME + ".\n" +
    "\n" +
    "Please click on the following link, or paste this into your browser to complete the process:\n" +
    "\n" +
    "%s\n" +
    "\n" +
    "If you did not request this, please ignore this email.\n",
    DEREGISTER_TOKEN_REQUIRED: "Deregister token is required",
    USER_IS_NOT_LOCAL: "This account was signed up with a different service (such as Facebook).",
    LOCATION: "Location",
    CATEGORIES: "Categories",
    POSTED: "Posted",
    CONTACT_TOO_LONG: "The contact you entered is too long.",
    CLASSIFIED_ALREADY_FLAGGED: "This classified has already been flagged.",
    PERMANENT_SETTING_MODIFY_ERROR: "Permanent setting cannot be changed",
    CONTACT: "Contact",
    LATEST_CLASSIFIEDS_ON_WEBSITE: "Latest classifieds on "+CONSTANTS.WEBSITE_NAME,
    UNSUBSCRIBE_MESSAGE: 'To unsubscribe from these emails, you may <a href="%s">de-register</a>, or unsubscribe in your account <a href="%s">settings</a>.',
    PERMANENT_ACCOUNT_MODIFY_ERROR: "Permanent accounts cannot be modified.",
  },
  fr: {
    VERIFICATION_EMAIL_SUBJECT: CONSTANTS.WEBSITE_NAME+" Vérification d'inscription ",
    VERIFICATION_EMAIL_TEXT:  "Vous recevez ce courriel parce que vous ou quelqu'un d'autre s'est enregistré avec cette adresse email sur "+CONSTANTS.WEBSITE_NAME+".\n"+
    "\n"+
    "Prière de cliquer sur le lien ci-dessous, ou de le coller dans votre navigateur pour continuer:\n"+
    "\n"+
    "%s\n" +
    "\n"+
    "Si vous n'avez pas fait cette demande, veuillez ignorer cet email.\n",
    RESET_PASSWORD_EMAIL_SUBJECT: CONSTANTS.WEBSITE_NAME+" réinitialiser le mot de passe",
    RESET_PASSWORD_EMAIL_TEXT: "Vous recevez ce courriel parce que vous ou quelqu'un d'autre a demandé de réinitialiser le mot de passe pour ce compte sur "+CONSTANTS.WEBSITE_NAME+".\n"+
    "\n"+
    "Prière de cliquer sur le lien ci-dessous, ou de le coller dans votre navigateur pour continuer:\n"+
    "\n"+
    "%s\n" +
    "\n"+
    "Si vous n'avez pas fait cette demande, veuillez ignorer cet email.\n",
    EMAIL_OR_USER_REQUIRED: "Un email ou un utilisateur est obligatoire pour afficher une annonce.",
    EMAIL_REQUIRED: "Email Obligatoire",
    TITLE_REQUIRED: "Un titre pour votre annonce est nécessaire.",
    TITLE_TOO_LONG: "Le titre que vous avez choisi est trop long.",
    LOCATION_TOO_LONG: "Le lieu que vous avez choisi est trop long.",
    CONTENT_REQUIRED: "Contenu pour votre annonce est nécessaire.",
    CONTENT_TOO_LONG: "Le contenu que vous avez choisi est trop long.",
    EMAIL_TOO_LONG: "L'email que vous avez choisi est trop long.",
    SUCCESS: "Succès",
    UNAUTHORIZED: "Non Autorisé",
    NOT_FOUND: "Pas Trouvé",
    INVALID_PASSWORD: "Mot De Passe Incorrect",
    VERIFICATION_TOKEN_REQUIRED: "Code de Vérification Requis",
    MISSING_OR_INVALID_DATA: "Données Manquantes Ou Invalides",
    EMAIL_ALREADY_IN_USE: "L'adresse email choisie est déjà utilisée.",
    PASSWORD_MIN_LENGTH: "Mot de passe doit être d'au moins 3 caractères.",
    TRY_AGAIN: "Une erreur s'est produite. Veuillez réessayer.",
    EMAIL_NOT_REGISTERED: "Cet email est pas enregistré.",
    CATEGORIES_REQUIRED: "Choisir au moins une catégorie.",
    CATEGORIES_INVALID: "Catégories présentées sont invalides.",
    NAME_REQUIRED: "Un nom est nécessaire",
    INVALID_EMAIL: "Veuillez fournir une adresse email valide.",
    NOT_AN_IMAGE: "le fichier n'est pas une image.",
    IMAGE_UPLOAD_ERROR_minWidth: "Image trop petite. Taille minimum de 50 pixels par 50 pixels.",
    IMAGE_UPLOAD_ERROR_minHeight: "Image trop petite. Taille minimum de 50 pixels par 50 pixels.",
    IMAGE_UPLOAD_ERROR_maxSize: "Fichier image trop grand. Il doit être inférieure à 20 Mo.",
    IMAGE_UPLOAD_ERROR_minSize: "Fichier image trop petit. Il doit faire au moins 1 kb.",
    IMAGE_UPLOAD_ERROR_maxFiles: "Vous pouvez joindre jusqu'à 10 images seulement.",
    UNABLE_TO_PROCESS_IMAGE: "Impossible de traiter l'image. Contactez s'il vous plaît un administrateur.",
    CONTENT_HAS_HTML: "Le contenu de votre annonce possède des balises HTML qui ne sont pas prises en charge actuellement.",
    PASSWORD_MAX_LENGTH: "Le mot de passe doit être inférieur à 50 caractères.",
    NAME_TOO_LONG: "Le nom que vous avez entré est trop long.",
    DEREGISTER_EMAIL_SUBJECT: CONSTANTS.WEBSITE_NAME+" compte radiation",
    DEREGISTER_EMAIL_TEXT: "Vous recevez ce courriel parce que vous ou quelqu'un d'autre a demandé la suppression de ce compte sur "+CONSTANTS.WEBSITE_NAME+".\n"+
    "\n"+
    "Prière de cliquer sur le lien ci-dessous, ou de le coller dans votre navigateur pour continuer:\n"+
    "\n"+
    "%s\n" +
    "\n"+
    "Si vous n'avez pas fait cette demande, veuillez ignorer cet email.\n",
    DEREGISTER_TOKEN_REQUIRED: "Le code de radiation est requis",
    USER_IS_NOT_LOCAL: "Ce compte utilise un mode de connexion différent (comme Facebook).",
    LOCATION: "Lieu",
    CATEGORIES: "Catégories",
    POSTED: "Publié",
    CONTACT_TOO_LONG: "Le contact que vous avez entré est trop long.",
    CLASSIFIED_ALREADY_FLAGGED: "Cette petite annonce a déjà été marquée.",
    PERMANENT_SETTING_MODIFY_ERROR: "Paramètre ne pouvant être modifié",
    CONTACT: "Contact",
    LATEST_CLASSIFIEDS_ON_WEBSITE: "Dernières petites annonces sur "+CONSTANTS.WEBSITE_NAME,
    UNSUBSCRIBE_MESSAGE: 'Pour vous désabonner de ces e-mails, vous pouvez vous <a href="%s">désabonner</a>, ou vous désabonner dans les <a href="%s">paramètres</a> de votre compte.',
    PERMANENT_ACCOUNT_MODIFY_ERROR: "Comptes permanents ne peuvent pouvant être modifiés.",
  }
};


module.exports.get = function(lang, key)
{
  if(!lang) lang='en';
  return translations[lang] && translations[lang][key] ? translations[lang][key] : key;
};

module.exports.has = function(lang, key)
{
  return translations[lang] && translations[lang][key];
}
