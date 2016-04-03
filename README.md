# ClassAct v1.0.0

## Synopsis

**ClassAct** is a simple, clean and easy to use multilingual platform for posting classifieds with image attachments. It allows users to register their email, or create an account. All registered emails are verified using an email verification process. Users can post classifieds which are listed publicly on the homepage. The classifieds are searchable and can be narrowed down using categories. **ClassAct** also gives a rich set of functionality to one or multiple administrators, allowing full control over the management of classifieds and users. Furthermore, administrators can generate regular email digests consisting of the latest classifieds (chosen by the admin), to all subscribed users. Users have the capability to change their email subscription, change their password, reset their forgotten password, or delete their account. 


## Technical Features

- Built entirely in MEAN (MongoDB, Express.js, Angular.js, Node.js)
- Seeded using the AngularJS Full-Stack generator: https://github.com/angular-fullstack/generator-angular-fullstack
- Single page-application
- Support for Google Analytics
- Full i18n support: language, dates, etc
- Live data synchronization: all data kept fully updated at all times in all clients using websockets
- Responsive: scales and renders well from large displays, down to tablets, down to small phones
- OAuth 2.0 support: Facebook Login
- Quick, powerful, performant: leveraging Node.js, and asynchronous javascript up and down the stack
- Ready for deployment to OpenShift


## Technologies Used

- MEAN
- Bootstrap UI
- ImageMagick


## Demo

- Testing website: http://bamakoolstaging-synappze.rhcloud.com
- Live production website: http://www.bamakool.com 
- Screenshots
  * ![Screenshot 1](http://i.imgur.com/34VC44q.png "Screenshot 1")
  
  * ![Screenshot 1](http://i.imgur.com/6S03t5s.png "Screenshot 2")


## Developer's Guide

- Developing and running locally 
  1) Install **Node.js** from https://nodejs.org/, make sure it is available in your system path
  2) Install **Git** from https://git-scm.com/, make sure it is available in your system path
  3) Install **MongoDB** from https://www.mongodb.org/, make sure it is available in your system path
  4) Install **Ruby** from https://www.ruby-lang.org/, make sure it is in your system path, and install **SASS** by running the command **gem install sass**
  5) Install **ImageMagick** from http://www.imagemagick.org, make sure it is available in your system path
  6) Set up your machine for node-gyp, more instructions here: https://github.com/nodejs/node-gyp (For example, you'll need to install **Python v2.7.x** and if using Windows: Visual Studio Express).
  7) Drop to the command line and change directory to the parent folder you'll download the ClassAct project to
  8) Run the command **npm install -g grunt-cli bower** 
  9) Use git to get the ClassAct project from GitHub. Instructions on how to do that: https://help.github.com/articles/fetching-a-remote/
  10) There should be a directory named "ClassAct" in the project folder, change directory to it
  11) Run the command **npm install**. Get a fresh cup of coffee, sit back, and wait for it to finish. This may take a while.
  12) Run MongoDB. Instructions here: https://docs.mongodb.org/manual/tutorial/manage-mongodb-processes/
  13) Run the command **grunt serve** and that's it! You'll have a browse window popup to the ClassAct application running on your machine! You're all done. You can log in using the built in account for the development environment created from seed.js: admin@admin.com/admin
  * Some notes:
    * I would recommend the use of an IDE, such as WebStorm. Or Sublime.
    * LiveReload is already configured. So if you make any changes to the code, you'll see your browser page reload, and run the latest code!  
    * **grunt serve** runs the server in development mode by default. To run it in production mode, run **grunt build** and **grunt serve:dist** 
    
- Customizing settings
  * You'll need to customize various settings to get ClassAct to work properly
  * Start with client/app/app.js, the .constant() section
    * **WEBSITE_NAME** defines a name for your website used throughout the ClassAct application. Whatever name you want to identify it as. For example BamaKool. 
    * **WEBSOCKET_PORT** defines the port websockets run on, on your production server. In most cases this should be 80. But it was important to create this setting for OpenShift, which uses port 8000 for websockets. Note: when running ClassAct on localhost, the same port will be used that express is listening on (auto configured), and this configuration will be ignored.
    * **SYSTEM_EMAIL** defines the email address that is used to email users from. For example donotreply@bamakool.com.
    * **GOOGLE_ANALYTICS_TRACKING_ID** defines the tracker ID to collect Google Analytics under. Comment out this value if you wish to disable Google Analytics.
    * **AUTO_APPROVE_VERIFIED_USER** allows you to configure whether users that verify their email addresses should automatically be "approved". Being approved means that when the user submits a classified, it is automatically posted publicly for everyone to see, versus having the admin approve the classified first before it is posted publicly.
  * The server/config folder contains various other important settings
    * server/config/environment/development.js
      * **developmentCatchAllToEmailAddress** If this is defined as an email address, when ClassAct is running in development mode, all system-generated emails will be sent to this email address. This is particularly useful so real email addresses don't get emailed during development/testing.
    * server/config/environment/email.js
      * **systemEmail** You'll need to change this to the email address all system emails are generated from (same as in the client side SYSTEM_EMAIL constant). You get two settings, one for production mode, and one for everything else (development/staging). Both can be the same if you wish.
      * **smtp** This defines the SMTP configuration for sending emails from. It again has two separate settings, one for your production email setup, and one for development/staging. All settings should be straight forward, such as hostname, username, password, etc. You can set both the production and development/staging to the same.
    * server/config/constants.js
      * **WEBSITE_NAME** the server side definition of your website's name, used throughout the application.
      * **AUTO_APPROVE_VERIFIED_USER** server side setting for the same feature set on the client side (see above). Make sure both server and client side values for this constant are the same.
    * server/config/express.js
      * Most noteworthy is the **app.use(morgan('combined'));** line that is commented out for production usage. Uncomment this out if you'd like express to log all HTTP requests/details (to node's stdout, which node may put in a log file depending on your configuration). Note: on a production server with lots of users, if you're on a free hosting server that has limited disk quota, this may cause it to fill up quickly.
    * server/config/local.env.js - this file allows you to define environment variables on your local development machine, that would be different from a production system. If the variables in this file are already set in node's environment, then these will not be used.
      * **SESSION_SECRET** Used by jwt to encrypt user's sessions. Would not matter much for localhost development.
      * **FACEBOOK_ID** The ID for Facebook Login for your application, to allow users to login using Facebook
      * **FACEBOOK_SECRET** The secret for Facebook Login for your application, used to encrypt data exchanged between facebook for authentication purposes.
    * server/config/seed.js - this file allows the creation (population) of "seed" data in your database, enough to get you started. Most importantly the main permanent admin account is created through this. Note: it only populates data if there is no data at all (i.e. the users collection is completely empty, or the classifieds collection is completely empty).
      * You'll want to scroll down to where users are created for production, under **if(process.env.NODE_ENV=='production')**. Modify the name/email/password for the main admin account, and it will be automatically created upon first use of the application.  
  
- Adding a new language
  * Translations exist both in the client and the server
  * In both places you can add a language simply by adding a two letter language code (ISO 639-1, https://en.wikipedia.org/wiki/ISO_639-1) to the 'translations' object (details below). For example, 'en' for English, or 'fr' for French. 
  * To add translations in the client side, edit client/app/app.js. Scroll down to the .config() section, and you'll see an object called "translations", which has two letter language codes that map to a JSON of translations for that language. To add a language with code xx, add translations['xx']={} with all the keys from the other languages copies and translated to your new language.
  * In the client side app.js, also add a translation for your two letter language code for WEBSITE_TITLE in CONSTANTS, which can be found in the .constant() section.
  * On the server side, edit server/config/translations.js. Again look for the "translations" object, which will map the two letter language code to a JSON of translations. Copy and translate all existing keys to your new language.
  * Again, be sure to copy and translate all existing keys for it to work correctly. (For example: {HELLO: "Hello"} for English, or {HELLO: "Bonjour"} for French).
  
- Deploying to OpenShift
  * Currently it's very easy to deploy ClassAct to OpenShift hosting right out of the box
  * If you don't know about OpenShift, it's RedHat's PaaS (Platform as a Service), which has free hosting available. Check it out at http://www.openshift.com
  * OpenShift already has ImageMagick, so you don't need to worry about installing that
  * Steps
    1) Create an OpenShift account if you don't already have one
    2) Install and set up OpenShift Client Tools: https://developers.openshift.com/managing-your-applications/client-tools.html
    3) cd to your ClassAct project folder and run **grunt build**
    4) Run the command **npm install -g yo** and **npm install yeoman-generator@0.17.7 chalk@0.4.0**
    5) Run the command **yo ./openshift**. This will give you several prompts and allow you to create your application on OpenShift. Note the application name, which will be used in the commands below. And note the other useful information it provides such as the URL for your live application (that info can also be gotten with the command **rhc app-show -v <app name>**).
    6) Run the command **rhc set-env SESSION_SECRET=xxx -a <app name>**. This will become the secret all user sessions are encrypted with.
    7) Run the command **rhc set-env EMAIL_MODE=<production/staging> -a <app name>**. Production mode will use the production SMTP settings, and staging will use the default for development.
    8) If you'll be using Facebook Login, set up your application on Facebook and run the following commands:
      1) **rhc set-env FACEBOOK_ID=xxx -a <app name>**
      2) **rhc set-env FACEBOOK_SECRET=xxx -a <app name>**
    9) If you'll be using an alternative DNS hostname that points to the default hostname OpenShift creates for your application, run the command **rhc alias add <app name> www.xyz.com** (replace xyz.com with the full hostname of your application) 
    10) For all the changes to take affect, run **rhc app-restart -a <app name>**
  * That's it! Your application is all set, and should be live on the URL that OpenShift set up for you. 

- Deploying code updates to OpenShift
  * When you make code updates, here are the steps to deploy them to your existing OpenShift application running ClassAct:
    1) cd to your ClassAct project folder and run **grunt build**
    2) Run **grunt buildcontrol:openshift --openshift_target=<app name>**
    3) (Optional, if you have server side changes): **rhc app-restart -a <app name>**


## User and Administrator Guide

- Full guides coming soon to a GitHub near you!
- Some important notes about the application for now:
  * User's language is detected from the browser. Defaults to English.
  * A "permanent" account is one that cannot be changed or deleted, other than its password. The application (both client and server side) won't allow modification of the role, email, verified, approved, or permanent status. This is so a disgruntled admin can't delete or lock out the main admin/owner of the site
  * A "verified" account is one for which the email address has been verified using a link emailed to the user. We can now be certain that this person did really intend to sign up, and they will receive system generated emails (such as the email digest). Non-verified accounts will not.
  * An "approved" account is one that can submit classifieds which will be posted automatically to the main site. If a user is not approved, or not logged in at all, and submits a classified, it will not be posted automatically. Instead, the admin will need to approve the classified first.
  * An "approved" classified means that the classified is posted to the main website for the public to see. Classifieds submitted by admins or approved users are automatically approved (and posted publicly). An admin can search for un-approved classifieds from the Admin Classified tool and approve them.  
  * There are a set of admin tools for administrating classifieds and users, as well as generating the email digest. They should be pretty straight forward to use. You'll see an "Admin" link in the navbar after logging in as an admin
  * Admins can make other people admins. But permanent accounts cannot be modified (not through the application, at least, they will need to be modified directly in the database).
  * Flagging a classified means that it is illegal/inappropriate/duplicate/etc. If there are 5 flags submitted from unique IP addresses against a classified, it will be removed automatically from the posted list. The admin can also flag/unflag classifieds from the Admin Classified tool.
  * In any of the mulit-select drop-downs throughout ClassAct used for searching/filtering, selecting none of the items means selecting all.
  * For any emails generated by the system, if there is an error sending the email, it is retried 5 times before giving up.
  * A classified can be posted under multiple categories.
  * All old classifieds posted from an account are available under the settings.
  * Classifieds older than 3 months are no longer displayed in the posted list, though will still show up in the Admin Classified tool.
  * ImageMagick is used to downsize/compress/convert images to jpg format.
  

## Contributors

**Author:** Adeel Mufti. The author of this project encourages contributions of code improvements, new features, bug fixes, etc., from the GitHub developer community.   
**French Translations/Design & Feature Collaborator/Tester:** Christophe Pérotin.


## License

Licensed under the [Apache License](LICENSE.md)
